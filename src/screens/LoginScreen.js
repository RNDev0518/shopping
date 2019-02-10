import React, { Component } from 'react'
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Image, Platform, ActivityIndicator, SafeAreaView } from 'react-native'
import { Button, Text, Input } from 'react-native-elements';
import { UIConstants, Theme } from '../config/constants';
import { NavigationService } from '../utils';
import { connect } from 'react-redux';
import { googleLogin, facebookLogin, loginUser, checkLogin, socialSignup } from '../actions';
import Dialog from "react-native-dialog";

class LoginScreen extends Component {

  static navigationOptions= {
    tabBarVisible: false,
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      socialUsername: '',
      username: '',
      password: '',
      isVisibleModal: false,
    }
  }
  componentWillUpdate = (nextProps, nextState) => {
    const social_signup = 'social signup';
    if (this.props.loginStatus !== social_signup && nextProps.loginStatus === social_signup) {
      nextState.isVisibleModal = true;
    } else if (this.props.loginStatus === social_signup && nextProps.loginStatus !== social_signup) {
      nextState.isVisibleModal = false;
    }
  };
  
  componentWillMount() {
    this.props.checkLogin();
  }
  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null} enabled>
        <ScrollView style={{flex: 1}} contentContainerStyle={{minHeight: '100%'}}>
          <View>
            <Image source={require('../assets/images/logo.png')} style={styles.logo}/>
          </View>
          <View style={styles.loginForm}>
            <Input placeholder="Username" 
              leftIcon={{name: 'user', type: "font-awesome", color: 'grey'}}
              autoCapitalize='none'
              onChangeText={username => this.setState({username})}
              containerStyle={styles.textContainer}
              inputContainerStyle={styles.textInputContainer}
              />
            <Input 
              placeholder="Password" secureTextEntry={true} 
              onChangeText={password => this.setState({password})}
              leftIcon={{name: 'lock', type: "font-awesome", color: 'grey'}}
              containerStyle={styles.textContainer}
              inputContainerStyle={styles.textInputContainer}
              />
          </View>
          <View style={{paddingTop: 20}}>
            <Button 
              title='SIGN IN'
              onPress={() => { this.props.loginUser(this.state); }}
              buttonStyle={styles.signinBtn}
              titleStyle={styles.buttonTitle}
              />
          </View>
          <View style={{paddingTop: 20}}>
            <Button 
              icon={{name: 'facebook', type: 'font-awesome', color: 'white'}}
              title='Sign in with Facebook'
              onPress={() => { 
                this.props.facebookLogin(); }
              }
              buttonStyle={styles.facebookBtn}
              titleStyle={styles.buttonTitle}
              />
          </View>
          <View style={{paddingTop: 20}}>
            <Button
              icon={{name: 'google', type: 'font-awesome', color: 'white'}}
              title='Sign in with Google'
              buttonStyle={styles.googleBtn}
              onPress={() => {
                this.props.googleLogin(); }
              }
              titleStyle={styles.buttonTitle}
              />
          </View>
          <View style={styles.lastItem}>
            <Text style={{marginRight: 20, textDecorationLine: "underline"}}>Privacy Policy</Text>
            <Text style={{textDecorationLine: "underline"}} onPress={() => { NavigationService.navigateSwitch('Signup'); }}>Sign up</Text>
          </View>
        </ScrollView>
        {
          (this.props.loginStatus === 'checking')
          ? (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={Theme.colors.info} />
          </View>)
          : null
        }
        <Dialog.Container visible={this.state.isVisibleModal}>
          <Dialog.Description>
            Please enter your username
          </Dialog.Description>
          <Dialog.Input value={this.state.socialUsername} onChangeText={(socialUsername) => this.setState({socialUsername})} />
          <Dialog.Button label="Cancel" onPress={() => this.setState({isVisibleModal: false})} />
          <Dialog.Button label="OK" onPress={() => {
            this.setState({isVisibleModal: false});
            this.props.socialSignup(this.props.user, this.state.socialUsername);
          }}/>
        </Dialog.Container>
      </KeyboardAvoidingView>
    );
  }
}

const buttons = {
  height: 46,
  width: '80%',
  alignSelf: 'center',
  justifyContent: 'flex-start',
  paddingHorizontal: 20,
  borderRadius: 23,
}
const styles = StyleSheet.create({
  container: {
    paddingTop: UIConstants.StatusbarHeight,
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginVertical: 20,
  },
  signinBtn: {
    ...buttons,
    backgroundColor: Theme.colors.button.success
  },
  facebookBtn: {
    ...buttons,
    backgroundColor: Theme.colors.button.primary
  },
  googleBtn: {
    ...buttons,
    backgroundColor: Theme.colors.button.danger
  },
  buttonTitle: {
    flex: 1,
    textAlign: "center",
    alignItems: "center",
  },
  loginForm: {
    width: '80%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  lastItem: {
    flex: 1,
    flexDirection: 'row',
    paddingBottom: 20,
    paddingTop: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    width: '100%',
    paddingHorizontal: 5,
    marginBottom: 20,
    borderRadius: 30,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  textInputContainer: {
    borderColor: 'transparent'
  },
});

const mapStateToProps = ({ auth }) => {
  const { loginStatus, user } = auth;
  return { loginStatus, user };
};

export default connect(mapStateToProps, {
  loginUser, googleLogin, facebookLogin, checkLogin, socialSignup
})(LoginScreen);