import { Parse } from 'parse/react-native';
import { BaseModel } from './BaseModel';
import { GeoPoint } from './GeoPoint';
import { User } from './User';
import { RealmService } from '../utils/RealmService';
import { ShoppingList } from './ShoppingList';

export class ShoppingItem extends BaseModel {

  static ReferenceParse = Parse.Object.extend('shopping_items');

  constructor(shoppingItem?: null){
    super(shoppingItem, ShoppingItem.ReferenceParse);
    if (!shoppingItem) return;
    if (shoppingItem.id) {
      this.prepareData();
    } else {
      this.prepareDataRealm(shoppingItem);
    }
  }

  isPrepared: boolean = false;

  prepareDataFromRealm(shoppingItem) {
    this.searchWords = shoppingItem.searchWords;
    this.listId = shoppingItem.listId;
    this.price = shoppingItem.price;
    this.image = shoppingItem.image;
    this.description = shoppingItem.description;
    this.tags = shoppingItem.tags;
    this.time = shoppingItem.time;
    this.fromCamera = shoppingItem.fromCamera;
    this.location = shoppingItem.location;
    this.imageGeolocation = GeoPoint.toGeoPoint(shoppingItem.imageGeolocation);
    this.sharingGeolocation = GeoPoint.toGeoPoint(shoppingItem.sharingGeolocation);
    this.quantity = shoppingItem.quantity;
    this.backgroundColor = shoppingItem.backgroundColor;
    this.downloadCount = shoppingItem.downloadCount;
    this.isOnline = false;
    this.isSharingOn = false;
    this.isPurchased = shoppingItem.isPurchased;
    this.isBlack = shoppingItem.isBlack;
    this.isPrepared = true;
  }

  prepareData() {
    super.prepareData();
    this.searchWords = this.object.get('searchWords');
    this.listId = this.object.get('listId');
    this.price = this.object.get('price');
    this.image = this.object.get('image');
    this.description = this.object.get('description');
    this.tags = this.object.get('tags');
    this.time = this.object.get('time');
    this.fromCamera = this.object.get('fromCamera');
    this.location = this.object.get('location');
    this.imageGeolocation = GeoPoint.toGeoPoint(this.object.get('imageGeolocation'));
    this.sharingGeolocation = GeoPoint.toGeoPoint(this.object.get('sharingGeolocation'));
    this.quantity = this.object.get('quantity');
    this.backgroundColor = this.object.get('backgroundColor');
    this.downloadCount = this.object.get('downloadCount');
    this.isSharingOn = this.object.get('isSharingOn');
    this.isPurchased = this.object.get('isPurchased');
    this.isBlack = this.object.get('isBlack');
    this.isOnline = this.object.get('isOnline');
    this.isPrepared = true;
  }

  prepareParseObject() {
    super.prepareParseObject();
    this.object.set('searchWords', this.searchWords);
    this.object.set('listId', this.listId);
    this.object.set('price', this.price);
    this.object.set('image', this.image);
    this.object.set('description', this.description);
    this.object.set('location', this.location);
    this.object.set('tags', this.tags);
    this.object.set('time', this.time);
    this.object.set('fromCamera', this.fromCamera);
    this.object.set('imageGeolocation', GeoPoint.toParseGeoPoint(this.imageGeolocation));
    this.object.set('sharingGeolocation', GeoPoint.toParseGeoPoint(this.sharingGeolocation));
    this.object.set('quantity', this.quantity);
    this.object.set('backgroundColor', this.backgroundColor);
    this.object.set('downloadCount', this.downloadCount);
    this.object.set('isOnline', this.isOnline);
    this.object.set('isSharingOn', this.isSharingOn);
    this.object.set('isPurchased', this.isPurchased);
    this.object.set('isBlack', this.isBlack);
    this.isPrepared = true;
  }

  async save() {
    this.prepareParseObject();
    if (this.isOnline) {
      try {
        await this.object.save();
        if (this.object.id) {
          this.id = this.object.id
        }
        await RealmService.removeShoppingItem(this);
      } catch (error) {
        alert(error.message);
      }
    } else {
      await RealmService.saveShoppingItem(this);
      if (this.id) {
        try {
          const query = new Parse.Query(ShoppingItem.ReferenceParse);
          const obj = await query.get(this.id);
          if (obj) await obj.destroy();
        } catch (error) {
        }
      }
    }
  }

  async delete() {
    try {
      await RealmService.removeShoppingItem(this);
    } catch (error){}
    if (this.id) {
      try {
        const query = new Parse.Query(ShoppingItem.ReferenceParse);
        const obj = await query.get(this.id);
        if (obj) await obj.destroy();
      } catch (error) {}
    }
  }

  static async getAll(listId) {
    const query = new Parse.Query(ShoppingItem.ReferenceParse);
    query.equalTo('listId', listId);
    const results = await query.find();
    return results.map(item => new ShoppingItem(item));
  }

  static async getByTags(tags: [string]) {
    const user = await User.currentUser();
    let query = new Parse.Query(ShoppingItem.ReferenceParse);
    query.containedIn('tags', tags || []);
    query.equalTo('isSharingOn', true);
    let results = await query.find(), list_map = {};
    let items = results.map(item => new ShoppingItem(item))
    const listIds = results.map(item => item.get('listId'));

    query = new Parse.Query(ShoppingList.ReferenceParse);
    query.containedIn("objectId", listIds);
    query.notEqualTo("userId", user.id);
    results = await query.find();
    results.forEach(item => (list_map[item.id] = new ShoppingList(item)));
    items = items.filter(item => list_map[item.id]);
    return { items, list_map };
  }

  static async create(searchWords, listId) {
    const currentUser = await User.currentUser();

    const shoppingItem = new ShoppingItem();

    shoppingItem.searchWords = searchWords;
    shoppingItem.listId = listId;
    shoppingItem.isSharingOn = false;
    shoppingItem.isPurchased = false;
    shoppingItem.isBlack = false;
    shoppingItem.isOnline = false;
    shoppingItem.fromCamera = true;
    shoppingItem.save();

    return shoppingItem;
  }

  searchWords: string;
  realm_id: string;
  listId: string;
  price: string;
  image: string;
  description: string;
  location: string;
  tags: [string];
  time: string;
  fromCamera: boolean;
  imageGeolocation: GeoPoint;
  sharingGeolocation: GeoPoint;
  quantity: string;
  backgroundColor: string;
  downloadCount: number;
  isSharingOn: boolean;
  isPurchased: boolean;
  isBlack: boolean;
  isOnline: boolean;

}
