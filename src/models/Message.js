import { Parse } from 'parse/react-native';
import { BaseModel } from './BaseModel';
import { User } from './User';
import { RealmService } from '../utils';

export class Message extends BaseModel {

  static ReferenceParse = Parse.Object.extend('messages');

  constructor(message?: null){
    super(message, Message.ReferenceParse);
    if (message) this.prepareData();
  }

  isPrepared: boolean = false;

  prepareData() {
    super.prepareData();
    this.sender = this.object.get('sender');
    this.receiver = this.object.get('receiver');
    this.messages = this.object.get('messages');
    this.lang = this.object.get('lang');
    this.isPrepared = true;
  }

  prepareParseObject() {
    super.prepareParseObject();
    this.object.set('sender', this.sender);
    this.object.set('receiver', this.receiver);
    this.object.set('messages', this.messages);
    this.object.set('lang', this.lang);
    this.isPrepared = true;
  }

  static async getById(id) {
    try {
      const query = new Parse.Query(Message.ReferenceParse);
      const message = await query.get(id);
      if (message) {
        return new Message(message);
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  async save() {
    this.prepareParseObject();
    await this.object.save();
    this.id = this.object.id;
  }

  async delete() {
    try {
      this.prepareParseObject();
      await this.object.destroy();
    } catch (error) {
      console.log(error);
    } finally {
      RealmService.deleteMessage(this);
    }
  }
  sender: string;
  receiver: string;
  messages: [string];
  lang: string = '';

  static create(sender, receiver, messages, lang) {
    const message = new Message();
    message.sender = sender;
    message.receiver = receiver;
    message.messages = messages;
    message.lang = lang;
    return message;
  }
}

export class UnreadMessage extends BaseModel {

  static ReferenceParse = Parse.Object.extend('unread_message');

  static async readMessage(message_id) {
    const query = new Parse.Query(UnreadMessage.ReferenceParse);
    query.equalTo('message_id', message_id);
    query.equalTo('isNew', true);
    const results = await query.find();
    if (results.length > 0) await results[0].destroy();
  }

  static async updatedMessage(message_id) {
    try {
      const query = new Parse.Query(UnreadMessage.ReferenceParse);
      query.equalTo('message_id', message_id);
      query.equalTo('isNew', false);
      const results = await query.find();
      if (results.length > 0) await results[0].destroy();
    } catch (error) {
      console.log(error.message);
    }
  }

  static async getNew() {
    const user = await User.currentUser();
    if (!user) return [];
    const query = new Parse.Query(UnreadMessage.ReferenceParse);
    query.equalTo('user', user.id);
    query.equalTo('isNew', true);
    query.ascending('createdAt');
    const results = await query.find();
    const messages = [];
    for (var item of results) {
      const message = await Message.getById(item.get('message_id'));
      if (message) {
        message.prepareData();
        messages.push(message);
      } else {
        item.destroy();
      }
    }
    return messages;
  }

  static async getUpdated() {
    const user = await User.currentUser();
    if (!user) return [];
    const query = new Parse.Query(UnreadMessage.ReferenceParse);
    query.equalTo('user', user.id);
    query.equalTo('isNew', false);
    query.ascending('createdAt');
    const results = await query.find();
    const messages = [];
    for (var item of results) {
      const message = await Message.getById(item.get('message_id'));
      if (message) {
        message.prepareData();
        messages.push(message);
      } else {
        item.destroy();
      }
    }
    return messages;
  }

  static async syncDeletedMessage() {
    const user = await User.currentUser();
    if (!user) return [];
    const query = new Parse.Query(UnreadMessage.ReferenceParse);
    query.equalTo('user', user.id);
    query.equalTo('isDelete', true);
    query.ascending('createdAt');
    let results = await query.find();
    for (var item of results) {
      await item.destroy();
      await UnreadMessage.deletedMessage(item.item.get('message_id'));
    };
  }

  static async deletedMessage(message_id) {
    try {
      const query = new Parse.Query(UnreadMessage.ReferenceParse);
      query.equalTo('message_id', message_id);
      query.equalTo('isDelete', true);
      const results = await query.find();
      if (results.length > 0) await results[0].destroy();
    } catch (error) {
      console.log(error.message);
    }
  }

}
