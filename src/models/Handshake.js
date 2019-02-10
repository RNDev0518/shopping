import { Parse } from 'parse/react-native';
import { BaseModel } from './BaseModel';
import { GeoPoint } from './GeoPoint';
import { User } from './User';

export class Handshake extends BaseModel {

  static ReferenceParse = Parse.Object.extend('handshakes');

  constructor(handshake?: null){
    super(handshake, Handshake.ReferenceParse);
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

  static async getHandshakeUserCount() {
    const currentUser = await User.currentUser();
    if (!currentUser) return [];
    const query = new Parse.Query(Handshake.ReferenceParse);
    query.equalTo('to', currentUser.id);
    const results = await query.find();
    return results.length;
  }

  static async getMyRequests() {
    const currentUser = await User.currentUser();
    if (!currentUser) return [];

    let query = new Parse.Query(Handshake.ReferenceParse);
    query.equalTo('to', currentUser.id);
    let requests = await query.find();

    query = new Parse.Query(Handshake.ReferenceParse);
    query.equalTo('by', currentUser.id);
    const yours = await query.find();

    const userIds = yours.filter(item => {
      for (var request of requests) {
        if (item.get('to') === request.get('by')) {
          return false;
        }
      }
      return true;
    }).map(item => item.get('to'));

    query = new Parse.Query(User.ReferenceParse);
    query.containedIn("objectId", userIds);

    const results = await query.find();

    return results.map(item => new User(item));
  }

  static async getMyAcceptedHandshakes() {
    const currentUser = await User.currentUser();
    if (!currentUser) return [];

    let query = new Parse.Query(Handshake.ReferenceParse);
    query.equalTo('to', currentUser.id);
    let requests = await query.find();

    query = new Parse.Query(Handshake.ReferenceParse);
    query.equalTo('by', currentUser.id);
    const yours = await query.find();

    const userIds = yours.filter(item => {
      for (var request of requests) {
        if (item.get('to') === request.get('by')) {
          return true;
        }
      }
      return false;
    }).map(item => item.get('to'));

    query = new Parse.Query(User.ReferenceParse);
    query.containedIn("objectId", userIds);

    const results = await query.find();

    return results.map(item => new User(item));
  }

  static async getHandshakeRequests() {
    const currentUser = await User.currentUser();
    if (!currentUser) return [];

    let query = new Parse.Query(Handshake.ReferenceParse);
    query.equalTo('to', currentUser.id);
    let requests = await query.find();

    query = new Parse.Query(Handshake.ReferenceParse);
    query.equalTo('by', currentUser.id);
    const yours = await query.find();

    const userIds = requests.filter(request => {
      for (var item of yours) {
        if (item.get('to') === request.get('by')) {
          return false;
        }
      }
      return true;
    }).map(item => item.get('by'));

    query = new Parse.Query(User.ReferenceParse);
    query.containedIn("objectId", userIds);

    const results = await query.find();

    return results.map(item => new User(item));
  }

  static async sendHandshake(userId) {
    const currentUser = await User.currentUser();
    if (!currentUser) return null;

    let query = new Parse.Query(Handshake.ReferenceParse);
    query.equalTo('to', userId);
    query.equalTo('by', currentUser.id);
    let results = await query.find();

    if (results.length > 0) throw {
      message: 'The user already added'
    }
    const handshake = new Handshake();
    handshake.to = userId;
    handshake.by = currentUser.id;
    await handshake.save();
    return handshake;
  }

  static async removeHandshake(userId) {
    const currentUser = await User.currentUser();
    if (!currentUser) return false;

    let query = new Parse.Query(Handshake.ReferenceParse);
    query.equalTo('to', userId);
    query.equalTo('by', currentUser.id);
    let results = await query.find();

    if (results.length === 0) throw {
      message: 'The user is not handshake user'
    }
    
    await results[0].destroy();
  }

  static async acceptHandshake(userId) {
    await Handshake.sendHandshake(userId);
  }
  
  static async declineHandshake(userId) {
    const currentUser = await User.currentUser();
    if (!currentUser) return false;

    let query = new Parse.Query(Handshake.ReferenceParse);
    query.equalTo('by', userId);
    query.equalTo('to', currentUser.id);
    let results = await query.find();

    if (results.length === 0) throw {
      message: 'The user is not handshake user'
    }
    
    await results[0].destroy();
  }

  static async hadHandshake(userId) {
    const currentUser = await User.currentUser();
    if (!currentUser) return false;

    let query = new Parse.Query(Handshake.ReferenceParse);
    query.equalTo('to', userId);
    query.equalTo('by', currentUser.id);
    let results = await query.find();
    return results.length > 0;
  }
  to: string;
  by: string;
};
