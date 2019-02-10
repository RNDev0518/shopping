import {
  LOGIN_USER_SUCCESS,
  LOGIN_USER_FAIL,
  LOGIN_USER,
  LOGOUT_USER,
  LOGIN_STATUS_CHANGED,
  LOAD_WELCOME_CHANGED,
  FONT_LOADED_CHANGED,
  SIGNUP_USER,
  PROFILE_SAVED,
  PROFILE_SAVE_FAILED,
  SOCIAL_SIGNUP,
} from '../actions/ActionTypes';

const INITIAL_STATE = {
  user: null,
  fontLoaded: false,
  loginStatus: 'initial',
  loadWelcome: false
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FONT_LOADED_CHANGED:
      return { ...state, fontLoaded: action.payload };
    case LOGIN_STATUS_CHANGED:
      if (action.payload == 'not logged in') {
        return { ...state, loginStatus: action.payload, user: null };
      } else {
        return { ...state, loginStatus: action.payload};
      }
    case LOAD_WELCOME_CHANGED:
      return { ...state, loadWelcome: action.payload };
    case LOGIN_USER_SUCCESS:
      return { ...state, user: action.payload, loginStatus: 'logged in'};
    case SOCIAL_SIGNUP:
      return { ...state, user: action.payload, loginStatus: 'social signup'};
    case LOGIN_USER_FAIL:
      return { ...state, loginStatus: 'login failed'  };
    case PROFILE_SAVED:
    case PROFILE_SAVE_FAILED:
      return { ...state, user: action.payload, loginStatus: 'logged in'  };
    case LOGOUT_USER:
      return INITIAL_STATE;
    default:
      return state;
  }
};
