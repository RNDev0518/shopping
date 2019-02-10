import { Parse } from 'parse/react-native';
import { BaseModel } from './BaseModel';
import { User } from './User';
import { Alert } from 'react-native';

export class ShoppingList extends BaseModel {

  static ReferenceParse = Parse.Object.extend('shopping_lists');

  constructor(shoppingList?: null){
    super(shoppingList, ShoppingList.ReferenceParse);
    if (shoppingList) this.prepareData();
  }

  isPrepared: boolean = false;

  prepareData() {
    super.prepareData();
    this.name = this.object.get('name');
    this.userId = this.object.get('userId');
    this.fontSize = this.object.get('fontSize');
    this.fontFamily = this.object.get('fontFamily');
    this.currency = this.object.get('currency');
    this.isOpened = this.object.get('isOpened');
    this.isPrepared = true;
  }

  prepareParseObject() {
    super.prepareParseObject();
    this.object.set('name', this.name);
    this.object.set('userId', this.userId);
    this.object.set('fontSize', this.fontSize);
    this.object.set('fontFamily', this.fontFamily);
    this.object.set('currency', this.currency);
    this.object.set('isOpened', this.isOpened);
    this.isPrepared = true;
  }

  async save() {
    this.prepareParseObject();
    await this.object.save();
    this.id = this.object.id;
  }

  async changeListName(newListName) {
    const query = new Parse.Query(ShoppingList.ReferenceParse);
    query.equalTo('name', newListName);
    query.equalTo('userId', this.userId);
    let exists = (await query.find()) || [];
    exists = exists.filter(item => item.id !== this.id);
    if (exists.length > 0) throw {
      message: 'The list name already exists.\nPlease use other name.'
    }
    this.name = newListName;
    this.prepareParseObject();
    await this.save();
  }

  async delete() {
    if (!this.isPrepared) this.prepareParseObject();
    await this.object.destroy();
  }
  
  static async create(name: string) {
    const currentUser = await User.currentUser();

    const query = new Parse.Query(ShoppingList.ReferenceParse);
    query.equalTo('name', name);
    query.equalTo('userId', currentUser.id);
    let exists = (await query.find()) || [];
    if (exists.length > 0) throw {
      message: 'The list name already exists.\nPlease use other name.'
    }
    const shoppingList = new ShoppingList();
    shoppingList.name = name;
    shoppingList.userId = currentUser.id;
    shoppingList.fontSize = 12;
    shoppingList.currency = '$';
    shoppingList.isOpened = false;
    await shoppingList.save();
    return shoppingList;
  }

  static async getAll() {
    const user = await User.currentUser();
    const query = new Parse.Query(ShoppingList.ReferenceParse);
    query.equalTo('userId', user.id);
    const results = await query.find();
    return results.map(item => new ShoppingList(item));
  }
  
  static async deleteAll() {
    const user = await User.currentUser();
    const query = new Parse.Query(ShoppingList.ReferenceParse);
    query.equalTo('userId', user.id);
    const results = await query.find();
    const promises = results.map(result => result.destroy());
    await Promise.all(promises);
  }
  name: string;
  userId: string;
  fontSize: number;
  fontFamily: string;
  currency: string;
  isOpened: boolean;
}
