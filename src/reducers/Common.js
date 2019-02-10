import {
  LOADING_START,
  LOADING_DONE,
  SAVE_LOCATION,
  ONLINE_USER,
  OFFLINE_USER,
  LOGOUT_USER,
} from '../actions/ActionTypes';

const INITIAL_STATE = {
  showIndicator: false,
  currentLocation: null,
  onlineUser: null,
  offlineUser: null,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LOADING_START:
      return { ...state, showIndicator: true };
    case LOADING_DONE:
      return { ...state, showIndicator: false };
    case SAVE_LOCATION:
      return { ...state, currentLocation: action.payload };
    case ONLINE_USER:
      return { ...state, onlineUser: action.payload, offlineUser: null };
    case OFFLINE_USER:
      return { ...state, offlineUser: action.payload, onlineUser: null };
    case LOGOUT_USER:
      return INITIAL_STATE;
    default:
      return state;
  }
};
