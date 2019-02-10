import React, { Component } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Theme } from '../config/themes';
import { connect } from 'react-redux';

class LoadingIndicatorCmp extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return this.props.showIndicator ? (
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color={Theme.colors.info} />
      </View>
    ) : <View></View>;
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

const mapStateToProps = ({ common }) => {
  const { showIndicator } = common;
  return { showIndicator };
};

export const LoadingIndicator = connect(mapStateToProps)(LoadingIndicatorCmp);