import { Parse } from 'parse/react-native';
import { BaseModel } from './BaseModel';
import { GeoPoint } from './GeoPoint';
import { User } from './User';

export class Follow extends BaseModel {

  static ReferenceParse = Parse.Object.extend('follows');

  constructor(handshake?: null){
    super(handshake, Follow.ReferenceParse);
    if (!handshake) return;
    if (handshake.id) {
      this.prepareData();
    } else {
      this.prepareDataRealm(handshake);
    }
  }

  prepareData() {
    super.prepareData();
    this.to = this.object.get('to');
    this.by = this.object.get('by');
  }
  prepareParseObject() {
    super.prepareParseObject();
    this.object.set('to', this.to);
    this.object.set('by', this.by);
  }
  
  async save() {
    this.prepareParseObject();
    await this.object.save();
    this.id = this.object.id;
  }

  static async getFollowerCount(userId) {
    const query = new Parse.Query(Follow.ReferenceParse);
    query.equalTo('to', userId);
    const results = await query.find();
    return results.length;
  }

  static async getFollowingCount(userId) {
    const query = new Parse.Query(Follow.ReferenceParse);
    query.equalTo('by', userId);
    const results = await query.find();
    return results.length;
  }

  static async getFollowing() {
    const currentUser = await User.currentUser();
    if (!currentUser) return [];

    let query = new Parse.Query(Follow.ReferenceParse);
    query.equalTo('by', currentUser.id);
    let results = await query.find();

    const userIds = results.map(item => item.get('to'));

    query = new Parse.Query(User.ReferenceParse);
    query.containedIn("objectId", userIds);

    results = await query.find();

    return results.map(item => new User(item));
  }

  static async follow(userId) {
    const currentUser = await User.currentUser();
    if (!currentUser) return null;

    let query = new Parse.Query(Follow.ReferenceParse);
    query.equalTo('to', userId);
    query.equalTo('by', currentUser.id);
    let results = await query.find();

    if (results.length > 0) throw {
      message: 'The user already added'
    }
    const handshake = new Follow();
    handshake.to = userId;
    handshake.by = currentUser.id;
    await handshake.save();
    return handshake;
  }

  static async unfollow(userId) {
    const currentUser = await User.currentUser();
    if (!currentUser) return false;

    let query = new Parse.Query(Follow.ReferenceParse);
    query.equalTo('to', userId);
    query.equalTo('by', currentUser.id);
    let results = await query.find();

    if (results.length === 0) throw {
      message: 'The user is not handshake user'
    }
    
    await results[0].destroy();
  }

  static async isFollow(userId) {
    const currentUser = await User.currentUser();
    if (!currentUser) return false;

    let query = new Parse.Query(Follow.ReferenceParse);
    query.equalTo('to', userId);
    query.equalTo('by', currentUser.id);
    let results = await query.find();
    return results.length > 0;
  }
  to: string;
  by: string;
};
