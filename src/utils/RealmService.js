import Realm, { Results } from 'realm';
import moment from 'moment';
import { Message, ShoppingItem, WishList, User, SellingList, UnreadMessage } from '../models';
import { Alert } from 'react-native';

let realm: Realm = null;

const openRealm = async () => {
  if (!realm) {
    realm = await Realm.open({
      schema: [{
        name: 'chatList',
        properties: {
          id: 'string',
          userId: 'string',
          ownerId: 'string',
          master: 'bool',
          lastMessage: 'string',
          updatedAt: 'string',
        },
        primaryKey: 'id'
      }, {
        name: 'message',
        properties: {
          userId: 'string',
          ownerId: 'string',
          message_id: 'string',
          lang: 'string',
          messageJSON: 'string',
        }
      }, {
        name: 'shoppingItem',
        properties: {
          realm_id: 'string',
          id : {
            type: 'string',
            optional: true
          },
          searchWords : 'string',
          listId : 'string',
          price : {
            type: 'float',
            optional: true
          },
          image : {
            type: 'string',
            optional: true,
          },
          description : {
            type: 'string',
            optional: true,
          },
          location : {
            type: 'string',
            optional: true,
          },
          tags : {
            type: 'string',
            optional: true,
          },
          time : {
            type: 'string',
            optional: true,
          },
          fromCamera : {
            type: 'bool',
            optional: true,
          },
          imageGeolocation : {
            type: 'string',
            optional: true,
          },
          sharingGeolocation : {
            type: 'string',
            optional: true,
          },
          quantity : {
            type: 'int',
            optional: true,
          },
          backgroundColor : {
            type: 'string',
            optional: true,
          },
          downloadCount : {
            type: 'int',
            default: 0,
            optional: true,
          },
          isSharingOn : {
            type: 'bool',
            optional: true,
            default: false
          },
          isPurchased : {
            type: 'bool',
            optional: true,
            default: false,
          },
          isBlack : {
            type: 'bool',
            optional: true,
            default: false,
          },
          isOnline : {
            type: 'bool',
            optional: true,
            default: false
          },
          createdAt : {
            type: 'date',
            optional: true,
            default: false,
          },
          updatedAt : {
            type: 'date',
            optional: true,
            default: false
          }
        },
        primaryKey: 'realm_id',
      }, {
        name: 'wishList',
        properties: {
          realm_id: 'string',
          id : {
            type: 'string',
            optional: true
          },
          searchWords : 'string',
          userId : 'string',
          price : {
            type: 'float',
            optional: true
          },
          image : {
            type: 'string',
            optional: true,
          },
          description : {
            type: 'string',
            optional: true,
          },
          location : {
            type: 'string',
            optional: true,
          },
          tags : {
            type: 'string',
            optional: true,
          },
          time : {
            type: 'string',
            optional: true,
          },
          fromCamera : {
            type: 'bool',
            optional: true,
          },
          geolocation : {
            type: 'string',
            optional: true,
          },
          quantity : {
            type: 'int',
            optional: true,
          },
          downloadCount : {
            type: 'int',
            default: 0,
            optional: true,
          },
          isSharingOn : {
            type: 'bool',
            optional: true,
            default: false
          },
          isUpdateOn : {
            type: 'bool',
            optional: true,
            default: false,
          },
          isOnline : {
            type: 'bool',
            optional: true,
            default: false
          },
          createdAt : {
            type: 'date',
            optional: true,
            default: false,
          },
          updatedAt : {
            type: 'date',
            optional: true,
            default: false
          }
        },
        primaryKey: 'realm_id',
      }, {
        name: 'sellingList',
        properties: {
          realm_id: 'string',
          id : {
            type: 'string',
            optional: true
          },
          searchWords : 'string',
          userId : 'string',
          price : {
            type: 'float',
            optional: true
          },
          image : {
            type: 'string',
            optional: true,
          },
          description : {
            type: 'string',
            optional: true,
          },
          location : {
            type: 'string',
            optional: true,
          },
          tags : {
            type: 'string',
            optional: true,
          },
          time : {
            type: 'string',
            optional: true,
          },
          fromCamera : {
            type: 'bool',
            optional: true,
          },
          geolocation : {
            type: 'string',
            optional: true,
          },
          quantity : {
            type: 'int',
            optional: true,
          },
          downloadCount : {
            type: 'int',
            default: 0,
            optional: true,
          },
          isSharingOn : {
            type: 'bool',
            optional: true,
            default: false
          },
          isUpdateOn : {
            type: 'bool',
            optional: true,
            default: false,
          },
          isOnline : {
            type: 'bool',
            optional: true,
            default: false
          },
          createdAt : {
            type: 'date',
            optional: true,
            default: false,
          },
          updatedAt : {
            type: 'date',
            optional: true,
            default: false
          }
        },
        primaryKey: 'realm_id',
      }
    ],
      schemaVersion: 1,
      deleteRealmIfMigrationNeeded: true
    })
  }
  return realm;
}

const addChatList = async (userId, master = true) => {
  if (!realm) await openRealm();
  const currentUser = await User.currentUser();
  return await new Promise((resolve, reject) => {
    realm.write(() => {
      let exists = realm.objects('chatList').filtered(`userId = "${userId}" AND ownerId="${currentUser.id}"`);
      if (!exists || exists.length === 0) {
        let chatList = realm.create('chatList', { 
          id: `${Date.now()}`,
          userId: userId,
          ownerId: currentUser.id,
          master: master,
          lastMessage: 'New Chatroom',
          updatedAt: moment().format('D.MM.YY')
        });
      }
      resolve();
    });
  });
}
const removeChatList = async (chatList) => {
  if (!realm) await openRealm();
  const currentUser = await User.currentUser();
  return new Promise((resolve, reject) => {
    realm.write(() => {
      realm.delete(realm.objectForPrimaryKey('chatList', chatList.id));
      let messages = realm.objects('message').filtered(`userId = "${chatList.userId}" AND ownerId="${currentUser.id}"`);
      for (var message of messages) {
        try {
          realm.delete(message);
        } catch (error) {
        }
      };
      resolve();
    });
  });
}

const deleteMessage = async (message: Message) => {
  return new Promise((resolve, reject) => {
    realm.write(() => {
      try {
        let messages = realm.objects('message').filtered(`message_id = "${message.id}"`);
        for (var item of messages) {
          realm.delete(item);
        };
      } catch (error) {
        console.log(error);
      }
      resolve();
    });
  });
}

const readChatList = async () => {
  if (!realm) await openRealm();
  const currentUser = await User.currentUser();
  let chatLists = realm.objects('chatList').filtered(`ownerId = "${currentUser.id}"`).map(item => {
    item = Object.assign({}, item);
    return item;
  }).filter(item => item.userId);
  return chatLists
}

const addMessage = async (message: Message) => {
  if (!realm) await openRealm();
  const currentUser = await User.currentUser();
  const userId = message.sender === currentUser.id ? message.receiver : message.sender;
  return await new Promise((resolve, reject) => {
    realm.write(() => {
      realm.create('message', {
        userId,
        ownerId: currentUser.id,
        message_id: message.id,
        lang: message.lang,
        messageJSON: JSON.stringify(message)
      });

      let chatLists = realm.objects('chatList').filtered(`userId = "${userId}" AND ownerId="${currentUser.id}"`), chatList = null;
      if (!chatLists || !chatLists.length) {
        chatList = addChatList(userId);
      } else {
        chatList = chatLists[0];
      }
      chatList.lastMessage = message.messages[0] || message.messages[1] || message.messages[2];
      resolve();
    });
  });
}

const readMessage = async (userId, lang) => {
  if (!realm) await openRealm();
  const currentUser = await User.currentUser();
  let messages = realm.objects('message').filtered(`userId = "${userId}" AND ownerId="${currentUser.id}" AND lang = "${lang}"`);
  return messages.map(item => {
    const json = JSON.parse(item.messageJSON);
    let message = new Message();
    message.id = json.id;
    message.sender = json.sender;
    message.receiver = json.receiver;
    message.lang = json.lang;
    message.messages = json.messages;
    message.createdAt = json.createdAt;
    message.updatedAt = json.updatedAt;
    return message;
  })
}
const updateMessage = async (message: Message) => {
  if (!realm) await openRealm();
  await new Promise((resolve, reject) => {
    realm.write(() => {
      let results = realm.objects('message').filtered(`message_id = "${message.id}"`);
      if (results.length > 0) {
        let json = JSON.parse(results[0].messageJSON);
        json.messages = message.messages;
        results[0].messageJSON = JSON.stringify(json);
      }
      resolve();
    });
  });
}

const syncMessages = async (updatedMessages: [Message]) => {
  for (var message of updatedMessages) {
    await updateMessage(message);
    UnreadMessage.updatedMessage(message.id);
  }
}

const updateLastMessages = async (messages: [Message]) => {
  if (!realm) await openRealm();
  const currentUser = await User.currentUser();
  return await new Promise((resolve, reject) => {
    realm.write(() => {
      for (var message of messages) {
        const userId = message.sender === currentUser.id ? message.receiver : message.sender;
        let chatLists = realm.objects('chatList').filtered(`userId = "${userId}" AND ownerId="${currentUser.id}"`), chatList = null;
        if (!chatLists || !chatLists.length) {
          chatList = addChatList(userId);
        } else {
          chatList = chatLists[0];
        }
        chatList.lastMessage = message.messages[0];
      }
      resolve();
    });
  });
}
const removeShoppingItem = async (shoppingItem: ShoppingItem) => {
  if (!realm) await openRealm();
  return await new Promise((resolve, reject) => {
    realm.write(() => {
      let filter_query = `realm_id = "${shoppingItem.realm_id}"`;
      if (shoppingItem.id) {
        filter_query = `${filter_query} OR id="${shoppingItem.id}"`
      }
      let results = realm.objects('shoppingItem').filtered(filter_query);
      for (var item of results) {
        realm.delete(item);
      }
      resolve();
    });
  });
}
const saveShoppingItem = async (shoppingItem: ShoppingItem) => {
  if (!realm) await openRealm();
  return await new Promise((resolve, reject) => {
    realm.write(() => {
      shoppingItem.realm_id = shoppingItem.realm_id || `${Date.now()}`;
      let filter_query = `realm_id = "${shoppingItem.realm_id}"`;
      if (shoppingItem.id) {
        filter_query = `${filter_query} OR id="${shoppingItem.id}"`
      }
      let results = realm.objects('shoppingItem').filtered(filter_query);
      if (results.length === 0) {
        realm.create('shoppingItem', JSON.parse(JSON.stringify({
          ...shoppingItem,
          tags: JSON.stringify(shoppingItem.tags)
        })));
      } else {
        const result = results[0];
        shoppingItem.realm_id = result.realm_id;
        result.id = shoppingItem.id;
        result.searchWords = shoppingItem.searchWords;
        result.listId = shoppingItem.listId;
        result.price = shoppingItem.price;
        result.image = shoppingItem.image;
        result.description = shoppingItem.description;
        result.tags = JSON.stringify(shoppingItem.tags);
        result.time = shoppingItem.time;
        result.fromCamera = shoppingItem.fromCamera;
        result.location = shoppingItem.location;
        result.imageGeolocation = JSON.stringify(shoppingItem.imageGeolocation);
        result.sharingGeolocation = JSON.stringify(shoppingItem.sharingGeolocation);
        result.quantity = shoppingItem.quantity;
        result.backgroundColor = shoppingItem.backgroundColor;
        result.downloadCount = shoppingItem.downloadCount;
        result.isSharingOn = shoppingItem.isSharingOn;
        result.isPurchased = shoppingItem.isPurchased;
        result.isBlack = shoppingItem.isBlack;
        result.isOnline = shoppingItem.isOnline;
        result.isPrepared = shoppingItem.isPrepared;
        result.createdAt = shoppingItem.createdAt;
        result.updatedAt = new Date();
      }
      resolve();
    });
  });
}

const readShoppingItems = async (listId) => {
  if (!realm) await openRealm();
  let shoppingItems = realm.objects('shoppingItem').filtered(`listId = "${listId}"`);
  return shoppingItems.map(item => {
    let shoppingItem = new ShoppingItem();
    shoppingItem.realm_id = item.realm_id;
    shoppingItem.searchWords = item.searchWords;
    shoppingItem.listId = item.listId;
    shoppingItem.price = item.price;
    shoppingItem.image = item.image;
    shoppingItem.description = item.description;
    shoppingItem.tags = JSON.parse(item.tags);
    shoppingItem.time = item.time;
    shoppingItem.fromCamera = item.fromCamera;
    shoppingItem.location = item.location;
    shoppingItem.imageGeolocation = JSON.parse(item.imageGeolocation);
    shoppingItem.sharingGeolocation = JSON.parse(item.sharingGeolocation);
    shoppingItem.quantity = item.quantity;
    shoppingItem.backgroundColor = item.backgroundColor;
    shoppingItem.downloadCount = item.downloadCount;
    shoppingItem.isSharingOn = item.isSharingOn;
    shoppingItem.isPurchased = item.isPurchased;
    shoppingItem.isBlack = item.isBlack;
    shoppingItem.isOnline = item.isOnline;
    shoppingItem.isPrepared = item.isPrepared;
    shoppingItem.createdAt = item.createdAt;
    shoppingItem.updatedAt = item.updatedAt;
    return shoppingItem;
  })
}


const removeWishList = async (wishList: WishList) => {
  if (!realm) await openRealm();
  return await new Promise((resolve, reject) => {
    realm.write(() => {
      let filter_query = `realm_id = "${wishList.realm_id}"`;
      let results = realm.objects('wishList').filtered(filter_query);
      for (var item of results) {
        realm.delete(item);
      }
      resolve();
    });
  });
}
const saveWishList = async (wishList: WishList) => {
  if (!realm) await openRealm();
  return await new Promise((resolve, reject) => {
    realm.write(() => {
      wishList.realm_id = wishList.realm_id || `${Date.now()}`;
      let filter_query = `realm_id = "${wishList.realm_id}"`;
      let results = realm.objects('wishList').filtered(filter_query);
      if (results.length === 0) {
        realm.create('wishList', JSON.parse(JSON.stringify({
          ...wishList,
          tags: JSON.stringify(wishList.tags)
        })));
      } else {
        const result = results[0];
        wishList.realm_id = result.realm_id;
        result.id = wishList.id;
        result.searchWords = wishList.searchWords;
        result.userId = wishList.userId;
        result.price = wishList.price;
        result.image = wishList.image;
        result.description = wishList.description;
        result.currency = wishList.currency;
        result.tags = JSON.stringify(wishList.tags);
        result.time = wishList.time;
        result.fromCamera = wishList.fromCamera;
        result.location = wishList.location;
        result.geolocation = JSON.stringify(wishList.geolocation);
        result.quantity = wishList.quantity;
        result.downloadCount = wishList.downloadCount;
        result.isSharingOn = wishList.isSharingOn;
        result.isUpdateOn = wishList.isUpdateOn;
        result.isOnline = wishList.isOnline;
        result.isPrepared = wishList.isPrepared;
        result.createdAt = wishList.createdAt;
        result.updatedAt = new Date();
      }
      resolve();
    });
  });
}

const readWishLists = async () => {
  if (!realm) await openRealm();
  const currentUser = await User.currentUser();
  let shoppingItems = realm.objects('wishList').filtered(`userId = "${currentUser.id}"`);
  return shoppingItems.map(item => {
    let shoppingItem = new WishList();
    shoppingItem.realm_id = item.realm_id;
    shoppingItem.searchWords = item.searchWords;
    shoppingItem.userId = item.userId;
    shoppingItem.price = item.price;
    shoppingItem.image = item.image;
    shoppingItem.description = item.description;
    shoppingItem.tags = JSON.parse(item.tags);
    shoppingItem.time = item.time;
    shoppingItem.fromCamera = item.fromCamera;
    shoppingItem.location = item.location;
    shoppingItem.geoLocation = JSON.parse(item.geolocation);
    shoppingItem.quantity = item.quantity;
    shoppingItem.downloadCount = item.downloadCount;
    shoppingItem.isSharingOn = item.isSharingOn;
    shoppingItem.isUpdateOn = item.isUpdateOn;
    shoppingItem.isOnline = item.isOnline;
    shoppingItem.isPrepared = item.isPrepared;
    shoppingItem.createdAt = item.createdAt;
    shoppingItem.updatedAt = item.updatedAt;
    return shoppingItem;
  })
}


const removeSellingList = async (sellingList: SellingList) => {
  if (!realm) await openRealm();
  return await new Promise((resolve, reject) => {
    realm.write(() => {
      let filter_query = `realm_id = "${sellingList.realm_id}"`;
      let results = realm.objects('sellingList').filtered(filter_query);
      for (var item of results) {
        realm.delete(item);
      }
      resolve();
    });
  });
}
const saveSellingList = async (sellingList: SellingList) => {
  if (!realm) await openRealm();
  return await new Promise((resolve, reject) => {
    realm.write(() => {
      sellingList.realm_id = sellingList.realm_id || `${Date.now()}`;
      let filter_query = `realm_id = "${sellingList.realm_id}"`;
      if (sellingList.id) {
        filter_query = `${filter_query} OR id="${sellingList.id}"`
      }
      let results = realm.objects('sellingList').filtered(filter_query);
      if (results.length === 0) {
        realm.create('sellingList', JSON.parse(JSON.stringify({
          ...sellingList,
          tags: JSON.stringify(sellingList.tags)
        })));
      } else {
        const result = results[0];
        sellingList.realm_id = result.realm_id;
        result.id = sellingList.id;
        result.searchWords = sellingList.searchWords;
        result.userId = sellingList.userId;
        result.price = sellingList.price;
        result.image = sellingList.image;
        result.description = sellingList.description;
        result.currency = sellingList.currency;
        result.tags = JSON.stringify(sellingList.tags);
        result.time = sellingList.time;
        result.fromCamera = sellingList.fromCamera;
        result.location = sellingList.location;
        result.geolocation = JSON.stringify(sellingList.geolocation);
        result.quantity = sellingList.quantity;
        result.downloadCount = sellingList.downloadCount;
        result.isSharingOn = sellingList.isSharingOn;
        result.isUpdateOn = sellingList.isUpdateOn;
        result.isOnline = sellingList.isOnline;
        result.isPrepared = sellingList.isPrepared;
        result.createdAt = sellingList.createdAt;
        result.updatedAt = new Date();
      }
      resolve();
    });
  });
}

const readSellingLists = async () => {
  if (!realm) await openRealm();
  const currentUser = await User.currentUser();
  let shoppingItems = realm.objects('sellingList').filtered(`userId = "${currentUser.id}"`);
  return shoppingItems.map(item => {
    let shoppingItem = new SellingList();
    shoppingItem.realm_id = item.realm_id;
    shoppingItem.searchWords = item.searchWords;
    shoppingItem.userId = item.userId;
    shoppingItem.price = item.price;
    shoppingItem.image = item.image;
    shoppingItem.description = item.description;
    shoppingItem.tags = JSON.parse(item.tags);
    shoppingItem.time = item.time;
    shoppingItem.fromCamera = item.fromCamera;
    shoppingItem.location = item.location;
    shoppingItem.geoLocation = JSON.parse(item.geolocation);
    shoppingItem.quantity = item.quantity;
    shoppingItem.downloadCount = item.downloadCount;
    shoppingItem.isSharingOn = item.isSharingOn;
    shoppingItem.isUpdateOn = item.isUpdateOn;
    shoppingItem.isOnline = item.isOnline;
    shoppingItem.isPrepared = item.isPrepared;
    shoppingItem.createdAt = item.createdAt;
    shoppingItem.updatedAt = item.updatedAt;
    return shoppingItem;
  })
}

export const RealmService = {
  openRealm,
  addMessage,
  addChatList,
  removeChatList,
  readChatList,
  updateLastMessages,
  readMessage,
  deleteMessage,
  saveShoppingItem,
  readShoppingItems,
  removeShoppingItem,
  saveWishList,
  removeWishList,
  readWishLists,
  removeSellingList,
  saveSellingList,
  readSellingLists,
  updateMessage,
  syncMessages,
}
