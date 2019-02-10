'use strict';
import React from 'react';
import { StyleSheet, View, AsyncStorage, StatusBar, Platform, AppRegistry } from 'react-native';
import { createSwitchNavigator } from 'react-navigation';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import Parse from 'parse/react-native';
import { ParseConfig } from './src/config/constants';
import reducers from './src/reducers';
import LoginScreen from './src/screens/LoginScreen';
import { NavigationService } from './src/utils';
import SignupScreen from './src/screens/SignupScreen';
import { Theme } from './src/config/constants';
import MainScreen from './src/screens/MainScreen';
import VerifyScreen from './src/screens/VerifyScreen';

export default class App extends React.Component {

  constructor(props){
    super(props);
    this.store = createStore(reducers, {}, applyMiddleware(ReduxThunk));
  }

  componentWillMount() {
    Parse.setAsyncStorage(AsyncStorage);
    Parse.initialize(ParseConfig.ApplicationID, ParseConfig.JavascriptKey, ParseConfig.MasterKey);
    Parse.serverURL = ParseConfig.ServerURL
  }

  render() {

    const LoginNavigator = createSwitchNavigator({
        Login: { screen: LoginScreen},
        Signup: { screen: SignupScreen},
        Verify: {screen: VerifyScreen},
        Main: { screen: MainScreen},
      },
      {
        navigationOptions: {
          tabBarVisible: false,
          header: null
        },
        swipeEnabled: false,
        lazy: true
      });

      return (
        <Provider store={this.store}>
          <View style={styles.container} forceInset={{ bottom: 'never' }}>
            <LoginNavigator ref={navigatorRef => { NavigationService.setSwitchContainer(navigatorRef); }}/>
          </View>
        </Provider>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
});
