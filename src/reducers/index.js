import { combineReducers } from 'redux';
import Authentication from './Authentication';
import Message from './Message';
import Common from './Common';
export default combineReducers({
  auth: Authentication,
  message: Message,
  common: Common,
});
