import {
  LOADING_START,
  LOADING_DONE,
  SAVE_LOCATION
} from './ActionTypes';

import { RealmService } from '../utils';
import { UnreadMessage, Message } from '../models';

export const showIndicator = () => {

  return {
    type: LOADING_START,
  }

}

export const hideIndicator = () => {

  return {
    type: LOADING_DONE,
  }

}

export const saveLocation = (location) => {

  return {
    type: SAVE_LOCATION,
    payload: location,
  }
}
