import React, { Component } from 'react'
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Image, Platform, ActivityIndicator } from 'react-native'
import { Button, Text, Input } from 'react-native-elements';
import { UIConstants, Theme } from '../config/constants';
import { NavigationService } from '../utils';
import { connect } from 'react-redux';
import { createUser, sendError } from '../actions';

class SignupScreen extends Component {

  static navigationOptions= {
    tabBarVisible: false,
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      password: '',
    }
    this.changeValue = this.changeValue.bind(this);
  }

  signup() {
    if (!this.state.username ) {
      this.props.sendError('Username is required');
    } else if (!this.state.email) {
      this.props.sendError('Email is required');
    } else if (!this.state.email.match(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/)) {
      this.props.sendError('Email format does not match');
    } else if (!this.state.password) {
      this.props.sendError('Password is required');
    } else if (this.state.password.length < 3) {
      this.props.sendError('Password length must be greater than 3');
    } else {
      this.props.createUser(this.state);
    }
  }

  changeValue(key, value) {
    let newState = {}; newState[key] = value;
    this.setState(newState);
  }

  render() {

    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null} enabled>
        <ScrollView style={{flex: 1}} contentContainerStyle={{minHeight: '100%'}}>
          <View>
            <Image source={require('../assets/images/logo.png')} style={styles.logo}/>
          </View>
          <View style={styles.form}>
            <Input placeholder="Username" 
              leftIcon={{name: 'user', type: 'font-awesome', color: 'grey'}}
              onChangeText={username => this.changeValue('username', username)}
              containerStyle={styles.textContainer}
              inputContainerStyle={styles.textInputContainer}
              />
            <Input placeholder="Email" 
              leftIcon={{name: 'envelope', type: 'font-awesome', color: 'grey', size: 16}}
              textContentType="emailAddress" 
              onChangeText={email => this.changeValue('email', email)} 
              keyboardType="email-address"
              containerStyle={styles.textContainer}
              inputContainerStyle={styles.textInputContainer}
              />
            <Input 
              placeholder="Password" secureTextEntry={true} 
              leftIcon={{name: 'lock', type: 'font-awesome', color: 'grey'}}
              onChangeText={password => this.changeValue('password', password)}
              containerStyle={styles.textContainer}
              inputContainerStyle={styles.textInputContainer}
              />
            <Input 
              placeholder="Confirm Password" secureTextEntry={true} 
              leftIcon={{name: 'lock', type: 'font-awesome', color: 'grey'}}
              onChangeText={password => this.changeValue('confirm_password', password)}
              containerStyle={styles.textContainer}
              inputContainerStyle={styles.textInputContainer}
              />
          </View>
          <View>
            <Button 
              title='SIGN UP'
              onPress={() => {this.signup();}}
              buttonStyle={styles.buttons}
              titleStyle={styles.buttonTitle}
              />
          </View>
          <View style={styles.lastItem}>
            <Text style={{marginRight: 20, textDecorationLine: "underline"}}>Privacy Policy</Text>
            <Text style={{textDecorationLine: "underline"}} onPress={() => { NavigationService.navigateSwitch('Login'); }}>Sign in</Text>
          </View>
        </ScrollView>
        {
          this.props.loginStatus === 'checking' ? (
            <View style={styles.overlay}>
              <ActivityIndicator size="large" color={Theme.colors.button.info} />
            </View>
          ) : null
        }
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
  buttons: {
    ...buttons,
    backgroundColor: Theme.colors.button.success,
  },
  buttonTitle: {
    flex: 1,
    textAlign: "center",
    alignItems: "center",
  },
  form: {
    width: '80%',
    paddingBottom: 20,
    alignSelf: 'center',
  },
  lastItem: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  textContainer: {
    width: '100%',
    paddingHorizontal: 5,
    marginBottom: 20,
    borderRadius: 30,
    borderColor: Theme.colors.border.textContainer,
    borderWidth: 1,
  },
  textInputContainer: {
    borderColor: 'transparent'
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  }
});


const mapStateToProps = ({ auth }) => {
  const { loginStatus } = auth;
  return { loginStatus };
};

export default connect(mapStateToProps, {
  createUser, sendError
})(SignupScreen);