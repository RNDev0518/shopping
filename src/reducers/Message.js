import {
  CHOOSE_CHAT_USER,
  CLEAR_CHAT_USER,
  NEW_MESSAGE,
  UPDATE_MESSAGE,
  DELETE_MESSAGE,
  POP_UNREAD,
  CLEAR_UNREAD,
  UNREAD_MESSAGES,
  CHOOSE_CHAT_LANG,
  LOGOUT_USER
} from '../actions/ActionTypes';

import { NavigationService } from '../utils';
import { Message } from '../models';
import { Alert } from 'react-native';

const INITIAL_STATE = {
  chat_user: null,
  chat_lang: null,
  unread_messages: [],
  new_message: null,
  updated_message: null,
  deleted_message: null,
};

export default (state = INITIAL_STATE, action) => {
  const currentRoute = NavigationService.getCurrentRoute();
  switch (action.type) {
    case CHOOSE_CHAT_USER:
      return { ...state, chat_user: action.payload };
    case CLEAR_CHAT_USER:
      return { ...state, chat_user: null };
    case CHOOSE_CHAT_LANG:
      return { ...state, chat_lang: action.payload };
    case NEW_MESSAGE:
      if (action.payload) {
        const currentRoom = (state.chat_user === action.payload.receiver) || (state.chat_user === action.payload.sender);

        if (currentRoute === 'Chatroom' && currentRoom && (state.chat_lang === action.payload.lang)) {
          return { ...state, new_message: action.payload };
        } else {
          const unread_messages = [].concat(state.unread_messages).concat(action.payload);
          return { ...state, unread_messages };
        }
      } else {
        return { ...state, new_message: null };
      }
    case UPDATE_MESSAGE:
      if (action.payload) {
        const currentRoom = (state.chat_user === action.payload.receiver) || (state.chat_user === action.payload.sender);
        if (currentRoute === 'Chatroom' && currentRoom && state.chat_lang === action.payload.lang) {
          return { ...state, updated_message: action.payload };
        } else {
          return state;
        }
      } else {
        return { ...state, updated_message: null };
      }
    case DELETE_MESSAGE:
      if (action.payload) {
        const unread_messages = [].concat(state.unread_messages);
        const ids = unread_messages.map(item => item.id);
        const index = ids.indexOf(action.payload.id);
        if ( index > -1) unread_messages.splice(index, 1);

        const currentRoom = (state.chat_user === action.payload.receiver) || (state.chat_user === action.payload.sender);

        if (currentRoute === 'Chatroom' && currentRoom && (state.chat_lang === action.payload.lang)) {
          return { ...state, deleted_message: action.payload, unread_messages };
        } else {
          return { ...state, unread_messages };;
        }
      } else {
        return { ...state, deleted_message: null };
      }
    case POP_UNREAD:
      const unread_messages = [].concat(state.unread_messages);
      const ids = unread_messages.map(item => item.id);
      for (var message of action.payload) {
        const index = ids.indexOf(message.id);
        if ( index > -1) {
          unread_messages.splice(index, 1);
          ids.splice(index, 1);
        }
      }
      return { ...state, unread_messages };
    case CLEAR_UNREAD:
      return { ...state, unread_messages: [] };
    case UNREAD_MESSAGES:
      return { ...state, unread_messages: action.payload };
    case LOGOUT_USER:
      return INITIAL_STATE;
    default:
      return state;
  }
};
