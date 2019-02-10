
import React, { Component } from 'react'
import {View} from 'react-native';
import { connect } from 'react-redux';
import { initSubscription } from '../actions';

class Subscriptions extends Component {

  constructor(props) {
    super(props);
    this.props.initSubscription();
  }
  render() {
    return (<View></View>)
  }
}

export default connect(null, {
  initSubscription
})(Subscriptions);