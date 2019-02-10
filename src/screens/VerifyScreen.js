import React, { Component } from 'react'
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Image, Platform, ActivityIndicator } from 'react-native'
import { UIConstants, Theme } from '../config/constants';
import { connect } from 'react-redux';
import { sendError } from '../actions';
import PhoneAuth from 'react-native-phone-auth-component';
const axios = require('axios');

class VerifyScreen extends Component {

  state = {
    phone: '',
    code: ''
  };

  // here is where you connect to your api to redeem a user's code
  // I'm using Firebase in this example but of course you don't have to
  // To avoid confusion, I'm storing the API address in process.env.URL. You don't have to do this
  signInWithPhone(phone){
    this.setState({phone});

    return axios.post('localhost:5000/times', {
      phone
    }).then((tok) => {
      alert(tok);
      return Promise.resolve();
    }).catch(e => {
      alert('There was an error or something');
      return Promise.reject();
    });
  }

  redeemCode(code){
    return axios.post('localhost:5000/ok', {
      phone: this.state.phone,
      code
    }).then((res) => {
      return Promise.resolve();
    }).catch(e => {
      alert(e.response.data.error);
      return Promise.reject();
    });
  }

  render(){
    return(
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null} enabled>
      <ScrollView style={{flex: 1}} contentContainerStyle={{minHeight: '100%'}}>
      <View style={{flex: 1}}>
        <PhoneAuth
          signInWithPhone={phone => this.signInWithPhone(phone)}
          redeemCode={code => this.redeemCode(code)}
          codeLength={4}
          buttonTextColor={'black'}
          spinnerColor={'black'}
        />
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
    );
  }
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
});

const mapStateToProps = ({ auth }) => {
  const { loginStatus } = auth;
  return { loginStatus };
};

export default connect(mapStateToProps, {
  sendError
})(VerifyScreen);