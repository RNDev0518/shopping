import { Parse } from 'parse/react-native';
import { BaseModel } from './BaseModel';
import { GeoPoint } from './GeoPoint';
import { User } from './User';

export class MapInfo extends BaseModel {

  static ReferenceParse = Parse.Object.extend('map_info');

  constructor(map_info?: null){
    super(map_info, MapInfo.ReferenceParse);
    if (!map_info) return;
    if (map_info.id) {
      this.prepareData();
    } else {
      this.prepareDataRealm(map_info);
    }
  }

  prepareData() {
    super.prepareData();
    this.type = this.object.get('type');
    this.userId = this.object.get('userId');
    this.geolocation = GeoPoint.toGeoPoint(this.object.get('geolocation'));
  }

  prepareParseObject() {
    super.prepareParseObject();
    this.object.set('type', this.type);
    this.object.set('userId', this.userId);
    this.object.set('geolocation', GeoPoint.toParseGeoPoint(this.geolocation));
  }
  
  async save() {
    this.prepareParseObject();
    await this.object.save();
    this.id = this.object.id;
  }

  static async getHomeLocation(userId) {
    const currentUser = await User.currentUser();

    const query = new Parse.Query(MapInfo.ReferenceParse);
    query.equalTo('userId', userId || currentUser.id);
    query.equalTo('type', 'home');
    
    const results = await query.find();
    if (results.length > 0) {
      const result = new MapInfo(results[0]);
      result.prepareData();
      return result;
    } else {
      let result = new MapInfo();
      result.type = 'home';
      result.userId = currentUser.id;
      return result;
    }
  }
  static async getParkLocation(userId) {
    const currentUser = await User.currentUser();

    const query = new Parse.Query(MapInfo.ReferenceParse);
    query.equalTo('userId', userId || currentUser.id);
    query.equalTo('type', 'park');
    
    const results = await query.find();
    if (results.length > 0) {
      const result = new MapInfo(results[0]);
      result.prepareData();
      return result;
    } else {
      let result = new MapInfo();
      result.type = 'park';
      result.userId = currentUser.id;
      return result;
    }
  }
  
  userId: string;
  geolocation: GeoPoint;
  type: ['home', 'park'];
};
