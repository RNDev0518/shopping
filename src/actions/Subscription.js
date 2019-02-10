import {
  NEW_MESSAGE,
  UPDATE_MESSAGE,
  DELETE_MESSAGE,
  UNREAD_MESSAGES,
  ONLINE_USER,
  OFFLINE_USER
} from './ActionTypes';

import Parse from 'parse/react-native';
import { UnreadMessage, Message, User, UserStatus } from '../models';
import { Alert } from 'react-native';
import { RealmService } from '../utils';

export const initSubscription = () => {

  return async (dispatch) => {

    const user = await User.currentUser();

    const receiverQuery = new Parse.Query(Message.ReferenceParse);
    receiverQuery.equalTo('receiver', user.id);

    const senderQuery = new Parse.Query(Message.ReferenceParse);
    senderQuery.equalTo('sender', user.id);

    const messageQuery = Parse.Query.or(receiverQuery, senderQuery);
  
    const messageSubscription = messageQuery.subscribe();
  
    messageSubscription.on('create', (data) => {
      const message = new Message(data);
      message.prepareData();
      if (message.sender !== user.id) {
        dispatch({
          type: NEW_MESSAGE,
          payload: message,
        });
      }
    });

    messageSubscription.on('update', (data) => {
      const message = new Message(data);
      message.prepareData();
      RealmService.syncMessages([message]);
      dispatch({
        type: UPDATE_MESSAGE,
        payload: message,
      });
    });

    messageSubscription.on('delete', (data) => {
      const message = new Message(data);
      message.prepareData();
      dispatch({
        type: DELETE_MESSAGE,
        payload: message,
      });
    });

    const statusQuery = new Parse.Query(UserStatus);
    const statusSubscription = statusQuery.subscribe();
    statusSubscription.on('create', (data) => {
      const userId = data.get('userId');
      if (userId !== user.id) {
        dispatch({
          type: data.get('online') ? ONLINE_USER : OFFLINE_USER,
          payload: userId,
        });
      }
    });

    statusSubscription.on('update', (data) => {
      const userId = data.get('userId');
      if (userId !== user.id) {
        dispatch({
          type: data.get('online') ? ONLINE_USER : OFFLINE_USER,
          payload: userId,
        });
      }
    });

    const unread_messages = await UnreadMessage.getNew();
    RealmService.updateLastMessages(unread_messages);

    const updatedMessages = await UnreadMessage.getUpdated();
    await UnreadMessage.syncDeletedMessage();
    RealmService.syncMessages(updatedMessages);
    dispatch({
      type: UNREAD_MESSAGES,
      payload: unread_messages,
    });

  }
}
