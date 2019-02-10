import { Parse } from 'parse/react-native';
import { BaseModel } from './BaseModel';
import { GeoPoint } from './GeoPoint';
import { User } from './User';
import { RealmService } from '../utils/RealmService';
import { WishSellingList } from './WishSellingList';

export class SellingList extends WishSellingList {

  static ReferenceParse = Parse.Object.extend('selling_lists');

  constructor(wishList?: null){
    super(wishList, SellingList.ReferenceParse);
    if (!wishList) return;
    if (wishList.id) {
      this.prepareData();
    } else {
      this.prepareDataRealm(wishList);
    }
  }

  isPrepared: boolean = false;

  prepareDataFromRealm(wishList) {
    this.searchWords = wishList.searchWords;
    this.userId = wishList.userId;
    this.price = wishList.price;
    this.image = wishList.image;
    this.description = wishList.description;
    this.currency = wishList.currency;
    this.tags = JSON.parse(wishList.tags);
    this.time = wishList.time;
    this.fromCamera = wishList.fromCamera;
    this.location = wishList.location;
    this.geoLocation = GeoPoint.toGeoPoint(wishList.geoLocation);
    this.quantity = wishList.quantity;
    this.downloadCount = wishList.downloadCount;
    this.isOnline = false;
    this.isSharingOn = false;
    this.isUpdateOn = wishList.isUpdateOn;
    this.isPrepared = true;
  }

  prepareData() {
    super.prepareData();
    this.searchWords = this.object.get('searchWords');
    this.userId = this.object.get('listId');
    this.price = this.object.get('price');
    this.image = this.object.get('image');
    this.description = this.object.get('description');
    this.currency = this.object.get('currency');
    this.tags = this.object.get('tags');
    this.time = this.object.get('time');
    this.fromCamera = this.object.get('fromCamera');
    this.location = this.object.get('location');
    this.geoLocation = GeoPoint.toGeoPoint(this.object.get('geoLocation'));
    this.quantity = this.object.get('quantity');
    this.downloadCount = this.object.get('downloadCount');
    this.textDescription = this.object.get('textDescription');
    this.isOnline = this.object.get('isOnline');
    this.isSharingOn = this.object.get('isSharingOn');
    this.isUpdateOn = this.object.get('isUpdateOn');
    this.isPrepared = true;
  }

  prepareParseObject() {
    super.prepareParseObject();
    this.object.set('searchWords', this.searchWords);
    this.object.set('userId', this.userId);
    this.object.set('price', this.price);
    this.object.set('image', this.image);
    this.object.set('description', this.description);
    this.object.set('currency', this.currency);
    this.object.set('location', this.location);
    this.object.set('tags', this.tags);
    this.object.set('time', this.time);
    this.object.set('fromCamera', this.fromCamera);
    this.object.set('geoLocation', GeoPoint.toParseGeoPoint(this.geoLocation));
    this.object.set('downloadCount', this.downloadCount);
    this.object.set('textDescription', this.textDescription);
    this.object.set('isOnline', this.isOnline);
    this.object.set('isSharingOn', this.isSharingOn);
    this.object.set('isUpdateOn', this.isUpdateOn);
    this.isPrepared = true;
  }

  async save() {
    this.prepareParseObject();
    if (this.isOnline) {
      await this.object.save();
      this.id = this.object.id
      await RealmService.removeSellingList(this);
    } else {
      await RealmService.saveSellingList(this);
      if (this.id) {
        const query = new Parse.Query(SellingList.ReferenceParse);
        const obj = await query.get(this.id);
        if (obj) await obj.destroy();
      }
    }
  }

  async delete() {
    try {
      await RealmService.removeWishList(this);
    } catch (error) {
    }
    if (this.id) {
      try {
        const query = new Parse.Query(SellingList.ReferenceParse);
        const obj = await query.get(this.id);
        if (obj) await obj.destroy();
      } catch (error) {
      }
    }
  }

  static async getAll() {
    const currentUser = await User.currentUser();
    if (!currentUser) return [];
    
    const query = new Parse.Query(SellingList.ReferenceParse);
    query.equalTo('userId', currentUser.id);
    const results = await query.find();
    return results.map(item => new SellingList(item));
  }
  static async getByTags(tags: [string]) {
    const user = await User.currentUser();
    const query = new Parse.Query(SellingList.ReferenceParse);
    query.containedIn('tags', tags || []);
    query.equalTo('isSharingOn', true);
    query.notEqualTo("userId", user.id);
    let results = await query.find(), list_map = {};
    const items = results.map(item => new SellingList(item));
    return items;
  }
  
  static async create() {
    const currentUser = await User.currentUser();

    const wishList = new SellingList();

    wishList.userId = currentUser.id;
    wishList.currency = '$';
    wishList.isSharingOn = false;
    wishList.isUpdateOn = false;
    wishList.isOnline = false;
    wishList.fromCamera = true;

    return wishList;
  }

}
