import {
  LOGIN_USER_SUCCESS,
  LOGIN_USER_FAIL,
  LOGIN_USER,
  LOGOUT_USER,
  LOGIN_STATUS_CHANGED,
  SIGNUP_USER,
  PROFILE_SAVE_FAILED,
  PROFILE_SAVED,
  UNREAD_MESSAGES,
  LOADING_START,
  LOADING_DONE,
  SOCIAL_SIGNUP,
  VERIFY_PHONE,
} from './ActionTypes';

import { googleClientKey, fbappid } from '../config/auth';
import { Buffer } from 'buffer'
import Toast from 'react-native-root-toast';
import { NavigationService } from '../utils';
import { User } from '../models';

import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import {FBLoginManager} from 'react-native-facebook-login';

FBLoginManager.setLoginBehavior(FBLoginManager.LoginBehaviors.Web);

export const loginStatusChanged = (text) => {
  return {
    type: LOGIN_STATUS_CHANGED,
    payload: text
  };
};

export const sendError = (message) => {
  return async (dispatch) => {
    showError(message);
  }
};

const showError = (message) => {
  let toast = Toast.show(message, {
    duration: Toast.durations.LONG,
    position: Toast.positions.BOTTOM,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
  });
}

export const checkLogin = () => {

  return async (dispatch) => {

    dispatch({
      type: LOGIN_STATUS_CHANGED,
      payload: 'checking'
    });

    dispatch({ type: LOGIN_USER });

    try {

      var user = await User.currentUser();
      user = user ? (await User.getById(user.id)) : null;

      if (user) {

        loginUserSuccess(dispatch, user);

      } else {

        loginUserFail(dispatch);

      }
    }
    catch (error) {

      loginUserFail(dispatch, error.message);

    }
  };
}
export const loginUser = ({ username, password }) => {

  return async (dispatch) => {

    dispatch({
      type: LOGIN_STATUS_CHANGED,
      payload: 'checking'
    });

    dispatch({ type: LOGIN_USER });

    try {

      const user = await User.login(username, password);

      loginUserSuccess(dispatch, user);

    }
    catch (error) {
      
      loginUserFail(dispatch, error.message);
    }
  };
};

export const resetUser = ({ email }) => {

  return async (dispatch) => {
      try {

        await User.requestPasswordReset(email);

        showError('Reset Email Sent');

      } catch (error) {

        showError(error.message);

      }
  };

};

export const logoutUser = () => {

  return async (dispatch) => {
      dispatch({
        type: LOGIN_STATUS_CHANGED,
        payload: 'checking'
      });

      try {

        await User.logOut();

        dispatch({
          type: LOGIN_STATUS_CHANGED,
          payload: 'logged out'
        });

        NavigationService.navigateSwitch('Login');

      } catch (error) {

        dispatch({
          type: LOGIN_STATUS_CHANGED,
          payload: 'logged in'
        });

      }
  };

};

const saveSuccess = (dispatch, user) => {

  dispatch({
    type: PROFILE_SAVED,
    payload: user,
  });

}

const saveFail = (dispatch, user) => {

  dispatch({
    type: PROFILE_SAVE_FAILED,
    payload: user,
  });

}

export const saveProfile = ({username, firstName, lastName, phone, photo, gender, website, bio, public_hashtags, private_hashtags, lang1, lang2, lang3, shareLocation}) => {
  return async (dispatch) => {

    dispatch({
      type: LOGIN_STATUS_CHANGED,
      payload: 'saving'
    });

    dispatch({
      type: LOADING_START,
    });

    var user = await User.currentUser();

    try {

      user.username = username;
      user.firstName = firstName;
      user.lastName = lastName;
      if (firstName || lastName) {
        user.fullName = (firstName || lastName) ? `${firstName || ''} ${lastName || ''}` : 'Unknown';
      }
      user.phone = phone;
      user.photo = photo;
      user.gender = gender;
      user.website = website;
      user.bio = bio;
      user.public_hashtags = public_hashtags;
      user.private_hashtags = private_hashtags;
      user.lang1 = lang1; user.lang2 = lang2; user.lang3 = lang3;
      user.shareLocation = shareLocation;

      await user.save();

      saveSuccess(dispatch, user);

      showError('Saved Profile');

    } catch (error) {

      showError(error.message);

      user = await User.currentUser();
      saveFail(dispatch, user);

    } finally {
      dispatch({
        type: LOADING_DONE,
      });  
    }
  };
}
export const createUser = ({ username, email, password, firstName, lastName }) => {
  return async (dispatch) => {

    dispatch({
      type: LOGIN_STATUS_CHANGED,
      payload: 'checking'
    });

    dispatch({ type: SIGNUP_USER });

    try {

      const user = await User.signUp(username, email, password, firstName, lastName);

      // loginUserSuccess(dispatch, user);
      verifyPhone(dispatch, user);
    }
    catch (error) {
      
      loginUserFail(dispatch, error.message);

    }

  };
};

const verifyPhone = (dispatch, user) => {

  dispatch({
    type: VERIFY_PHONE,
    payload: user
  });

  NavigationService.navigateSwitch('Verify');


};

const loginUserFail = (dispatch, error_message) => {

  dispatch({
    type: LOGIN_USER_FAIL
  });

  if (error_message) showError(error_message);

};

const loginUserSuccess = (dispatch, user) => {

  dispatch({
    type: LOGIN_USER_SUCCESS,
    payload: user
  });

  NavigationService.navigateSwitch('Main');


};

export const socialSignup = (user, username) => {

  return async (dispatch) => {

    try {

      dispatch({
        type: LOGIN_STATUS_CHANGED,
        payload: 'checking'
      });
  
      dispatch({ type: LOGIN_USER });
  
      const password = new Buffer(user.socialId).toString('base64');
      let socialUser = await User.signUp(username, user.email, password, user.firstName, user.lastName, user.social, user.socialId);
      
      socialUser = await User.login(socialUser.username, password);

      loginUserSuccess(dispatch, socialUser);

    } catch (error) {

      loginUserFail(dispatch, error.message);

    }

  }

}
const socialLogin = async (dispatch, user) => {
  try {

    let socialUser = await User.getSocialUser(user.social, user.socialId);
    const password = new Buffer(user.socialId).toString('base64');

    if (!socialUser) {

      dispatch({
        type: SOCIAL_SIGNUP,
        payload: user
      })

    } else {

      socialUser = await User.login(socialUser.username, password);

      loginUserSuccess(dispatch, socialUser);
    }

  } catch (error) {

    loginUserFail(dispatch, error.message);

  }

}
export const googleLogin = () => {

  return async (dispatch) => {

    try {
  
      GoogleSignin.configure({
        webClientId: googleClientKey
      });

      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();

      var googleProfile = result.user;
      if (!googleProfile.id) throw {};

      dispatch({
        type: LOGIN_STATUS_CHANGED,
        payload: 'checking'
      });
  
      dispatch({ type: LOGIN_USER });
  
      const email = googleProfile.email;
      const firstName = googleProfile.givenName;
      const lastName = googleProfile.familyName;
      const social = 'google';
      const socialId = `${googleProfile.id}`;

      socialLogin(dispatch, {email, firstName, lastName, social, socialId});

    }
    catch (error) {
    }

  };
};

export const facebookLogin = () => {
  return async (dispatch) => {

    try {

      dispatch({
        type: LOGIN_STATUS_CHANGED,
        payload: 'checking'
      });

      dispatch({ type: LOGIN_USER });

      const {credentials} = await new Promise((resolve, reject) => {
        FBLoginManager.loginWithPermissions(['public_profile', 'email'], function(error, data){
          if (!error) {
            resolve(data);
          } else {
            reject(error);
          }
        })
      });

      if (credentials && credentials.token) {
        // Get the user's name and email using Facebook's Graph API
        const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${credentials.token}`);

        const profile = await response.json()

        if (!profile.id) throw {};

        const email = profile.email;
        const firstName = profile.name.split(' ')[0];
        const lastName = profile.name.split(' ')[1] || '';
        const social = 'facebook';
        const socialId = `${profile.id}`;
  
        socialLogin(dispatch, {email, firstName, lastName, social, socialId});
  
      }

    }
    catch (error) {
    }

  };
};
