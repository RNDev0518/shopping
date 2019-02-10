import {
  CHOOSE_CHAT_USER,
  CLEAR_CHAT_USER,
  NEW_MESSAGE,
  UPDATE_MESSAGE,
  DELETE_MESSAGE,
  POP_UNREAD,
  CHOOSE_CHAT_LANG
} from './ActionTypes';

import { RealmService } from '../utils';
import { UnreadMessage, Message } from '../models';

export const chooseChatUser = (userId) => {

  return {
    type: CHOOSE_CHAT_USER,
    payload: userId
  }

}

export const chooseChatLang = (lang) => {

  return {
    type: CHOOSE_CHAT_LANG,
    payload: lang
  }

}


export const clearChatUser = () => {

  return {
    type: CLEAR_CHAT_USER,
  }

}

export const readMessage = (message: Message) => {

  return async (dispatch) => {

    await UnreadMessage.readMessage(message.id);

    dispatch({
      type: NEW_MESSAGE,
      payload: null
    });

    dispatch({
      type: POP_UNREAD,
      payload: [message],
    });

    RealmService.addMessage(message, message.sender);
  }

}

export const updatedMessage = () => {

  return {
    type: UPDATE_MESSAGE,
    payload: null
  }

}

export const deletedMessage = (message) => {

  return async (dispatch) => {

    return async (dispatch) => {
      dispatch({
        type: DELETE_MESSAGE,
        payload: null
      });
    }
  
  }
}