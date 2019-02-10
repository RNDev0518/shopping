import { Parse } from 'parse/react-native';
import { BaseModel } from './BaseModel';
import { GeoPoint } from './GeoPoint';
import { languageMap } from '../config/constants';

const getLanguageCode = (language) => {
  const keys = Object.keys(languageMap);
  for (var key of keys) {
    if (languageMap[key] === language.toLowerCase()) return key;
  }
  return null;
}

export const UserStatus = Parse.Object.extend('user_status');

export class User extends BaseModel {

  static ReferenceParse = Parse.User;

  constructor(user?: null){
    super(user, User.ReferenceParse);
    if (user) this.prepareData();
  }

  prepareData() {
    super.prepareData();
    this.username = this.object.get('username');
    this.email = this.object.get('email');
    this.firstName = this.object.get('firstName');
    this.lastName = this.object.get('lastName');
    this.fullName = this.object.get('fullName');
    this.phone = this.object.get('phone');
    this.photo = this.object.get('photo');
    this.gender = this.object.get('gender');
    this.website = this.object.get('website');
    this.bio = this.object.get('bio');
    this.public_hashtags = this.object.get('public_hashtags');
    this.private_hashtags = this.object.get('private_hashtags');
    this.lang1 = this.object.get('lang1');
    this.lang2 = this.object.get('lang2');
    this.lang3 = this.object.get('lang3');
    this.social = this.object.get('social');
    this.socialId = this.object.get('socialId');
    this.location = this.object.get('location');
    this.geolocation = GeoPoint.toGeoPoint(this.object.get('geolocation'));
    this.shareLocation = this.object.get('shareLocation');
  }

  prepareParseObject() {
    super.prepareParseObject();
    this.object.set('username', this.username);
    this.object.set('firstName', this.firstName);
    this.object.set('lastName', this.lastName);
    this.object.set('fullName', `${this.firstName} ${this.lastName}`);
    this.object.set('phone', this.phone);
    this.object.set('photo', this.photo);
    this.object.set('gender', this.gender);
    this.object.set('website', this.website);
    this.object.set('bio', this.bio);
    this.object.set('public_hashtags', this.public_hashtags);
    this.object.set('private_hashtags', this.private_hashtags);
    this.object.set('lang1', this.lang1);
    this.object.set('lang2', this.lang2);
    this.object.set('lang3', this.lang3);
    this.object.set('social', this.social);
    this.object.set('socialId', this.socialId);
    this.object.set('shareLocation', this.shareLocation);
    if (this.shareLocation) {
      this.object.set('location', this.location);
      this.object.set('geolocation', GeoPoint.toParseGeoPoint(this.geolocation));
    } else {
      this.object.unset('location');
      this.object.unset('geolocation');
    }
  }

  save() {
    this.prepareParseObject();
    return this.object.save();
    this.id = this.object.id;
  }

  static async currentUser() {
    const user = await Parse.User.currentAsync();
    if (user) {
      return new User(user);
    } else {
      return null;
    }
  }

  static async getById(userId) {
    try {
      const query = new Parse.Query(User.ReferenceParse);
      const user = await query.get(userId);
      return new User(user);
    } catch (error) {
      return null;
    }
  }

  static async getAll() {
    const user = await Parse.User.currentAsync();

    const query = new Parse.Query(User.ReferenceParse);
    query.notEqualTo('objectId', user.id);
    
    const users = await query.find();
    return users.map(item => new User(item))
  }

  static async searchUser(containsText, searchMode) {
    if (!containsText && searchMode === 'all') return await User.getAll();
    const user = await User.currentUser();
    let mainQuery = null;
    switch (searchMode) {
      case 'all' :
        const query1 = new Parse.Query(Parse.User);
        query1.contains('username', containsText);
        const query2 = new Parse.Query(Parse.User);
        const query3 = new Parse.Query(Parse.User);
        const query4 = new Parse.Query(Parse.User);
        if (getLanguageCode(containsText)) {
          query2.equalTo('lang1', getLanguageCode(containsText));
          query3.equalTo('lang2', getLanguageCode(containsText));
          query4.equalTo('lang3', getLanguageCode(containsText));
        } else {
          query2.startsWith('lang1', containsText);
          query3.startsWith('lang2', containsText);
          query4.startsWith('lang3', containsText);
        }
        const query5 = new Parse.Query(Parse.User);
        query5.equalTo('public_hashtags', containsText.toLowerCase());
        const query6 = new Parse.Query(Parse.User);
        query6.contains('bio', containsText.toLowerCase());
        mainQuery = Parse.Query.or(query1, query2, query3, query4, query5, query6);
        break;
        
      case 'language':
        if (!containsText) {
          const query1 = new Parse.Query(Parse.User);
          const query2 = new Parse.Query(Parse.User);
          query1.equalTo('lang2', user.lang1);
          query2.equalTo('lang3', user.lang1);
          mainQuery = Parse.Query.or(query1, query2);
        } else {
          const query1 = new Parse.Query(Parse.User);
          const query2 = new Parse.Query(Parse.User);
          const query3 = new Parse.Query(Parse.User);
          if (getLanguageCode(containsText)) {
            query1.equalTo('lang1', getLanguageCode(containsText));
            query2.equalTo('lang2', getLanguageCode(containsText));
            query3.equalTo('lang3', getLanguageCode(containsText));
          } else {
            query1.startsWith('lang1', containsText);
            query2.startsWith('lang2', containsText);
            query3.startsWith('lang3', containsText);
          }
          mainQuery = Parse.Query.or(query1, query2, query3);
        }
        break;
      case 'tag':
        if (!containsText) {
          return await User.getAll();
        } else {
          mainQuery = new Parse.Query(Parse.User);
          mainQuery.equalTo('public_hashtags', containsText.toLowerCase());
        }
        break;
      case 'bio':
        mainQuery = new Parse.Query(Parse.User);
        if (containsText) {
          mainQuery.contains('bio', containsText.toLowerCase());
        }
        break;
      case 'distance':
        mainQuery = new Parse.Query(Parse.User);
        mainQuery.withinKilometers("geolocation", GeoPoint.toParseGeoPoint(user.geolocation), parseInt(containsText) || 1E10, true);
        break;
      default:
      break;
    }
    const users = await mainQuery.find();
    return users.map(item => new User(item)).filter(item => item.id !==user.id)
  }

  static async login(username, password) {

    const userObj = await Parse.User.logIn(username, password);

    return new User(userObj);
  }

  static async signUp(username, email, password, firstName, lastName, social, socialId) {

    let userObj = new Parse.User({ username, email, password, firstName, lastName, social, socialId, lang1: 'English', lang2: 'English', lang3: 'English' });
    // await userObj.signUp();
    return new User(userObj);
    // userObj = await Parse.User.logIn(username, password);
    // return new User(userObj);

  }

  static async getSocialUser(type, id) {
    let query = new Parse.Query(User.ReferenceParse);
    query.equalTo('social', type);
    query.equalTo('socialId', id);
    const results = await query.find();
    if (results.length === 0) {
      return null;
    }
    return new User(results[0]);
  }

  static logOut() {
    return Parse.User.logOut();
  }

  static requestPasswordReset(email){
    return Parse.User.requestPasswordReset(email);
  }
  
  static async getMyStatus() {
    const currentUser = await User.currentUser();
    const query = new Parse.Query(UserStatus);
    query.equalTo('userId', currentUser.id);
    const results = await query.find();
    let myStatus = results.length > 0 ? results[0] : new UserStatus();
    myStatus.set('userId', currentUser.id);
    return myStatus;
  }
  static async getOnlineUsers() {
    try {
      const results = await Parse.Cloud.run('getOnlineUsers', {});
      return results;
    } catch (error) {
    }
  }

  id: string;
  username: string; email: string;
  firstName: string; lastName: string; fullName: string;
  phone: string; photo: string; gender: ['Male', 'Female'];
  website: string;
  bio: string;
  public_hashtags: [string]; private_hashtags: [string];
  lang1: string; lang2: string; lang3: string;
  social: ['google', 'facebook', 'wechat'];
  socialId: string;
  location: string;
  geolocation: GeoPoint;
  shareLocation: boolean;
}
