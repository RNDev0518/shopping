import React, { Component } from 'react'
import { View, Text, Image, StyleSheet, TouchableHighlight } from 'react-native';
import { Theme } from '../config/constants';
import { CachedImage } from 'react-native-img-cache';

const rtl = /[\u0590-\u06FF]/;

export class ChatBubble extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const user = this.props.user;
    const avatar = user && user.photo ? <CachedImage
      source={{ uri: user.photo }}
      style={[styles.avatar]}
    /> : <Image source={require('../assets/images/avatar.png')} style={styles.avatar}/>

    const messages = this.props.messages;
    return (
      <TouchableHighlight onLongPress={this.props.onLongPress} underlayColor='transparent'>
        <View style={[styles.container, {justifyContent: this.props.mine ? 'flex-end' : 'flex-start'}]}>
          { this.props.mine ? null : avatar }
          <View style={styles.bubbleContainer}>
            <View style={this.props.mine ? styles.content_right : styles.content_left}>
              {
                messages[0] ? (
                  <View style={styles.textContainer}>
                    {
                      messages[1] ? <Text style={{color: 'transparent'}}>😬</Text> : null
                    }
                    <Text style={[styles.text, {color: 'black', textAlign: rtl.test(messages[0]) ? 'right' : 'left'}]}>{messages[0]}</Text>
                  </View>
                ) : null
              }
              {
                messages[1] ? (
                  <View style={styles.textContainer}>
                    <Text>😬</Text>
                    <Text style={[styles.text, {fontStyle: 'italic', textAlign: rtl.test(messages[1]) ? 'right' : 'left'}]}>{messages[1]}</Text>
                  </View>
                ) : null
              }
              {
                messages[2] ? (
                  <View style={styles.textContainer}>
                    <Text style={{color: 'transparent'}}>😬</Text>
                    <Text style={[styles.text, {color: 'red', textAlign: rtl.test(messages[2]) ? 'right' : 'left'}]}>{messages[2]}</Text>
                  </View>
                ) : null
              }
            </View>
            <View style={this.props.mine ? styles.border_right : styles.border_left}></View>
          </View>
          { this.props.mine ? avatar : null }
        </View>
      </TouchableHighlight>
    )
  }
}

const avatarSize = 40;

const content = {
  maxWidth: '80%',
  borderRadius: 10,
  padding: 10,
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content_left: {
    ...content,
    backgroundColor: Theme.colors.bubble_left,
    alignSelf: 'flex-start'
  },
  content_right: {
    ...content,
    backgroundColor: Theme.colors.bubble_right,
    alignSelf: 'flex-end'
  },
  textContainer: {
    marginVertical: 5,
    marginRight: 5,
    width: '90%',
    flexDirection: 'row',
  },
  text: {
    marginLeft: 5,
  },
  avatar: {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    borderWidth: 1,
    borderColor: 'grey',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  bubbleContainer: {
    flex: 1, marginBottom: 15,
    backgroundColor: 'transparent',
    shadowOffset:{width: 1, height: 1},
    elevation: 2,
    shadowColor: 'grey',
    shadowOpacity: 0.5,
    marginHorizontal: 5,
  },
  border_right: {
    width: 3, height: 3,
    borderWidth: 3,
    borderTopColor: Theme.colors.bubble_right,
    borderRightColor: Theme.colors.bubble_right,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    marginRight: 10,
    alignSelf: 'flex-end',
  },
  border_left: {
    width: 3, height: 3,
    borderWidth: 3,
    borderTopColor: Theme.colors.bubble_left,
    borderLeftColor: Theme.colors.bubble_left,
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    marginLeft: 10,
    alignSelf: 'flex-start',
  }
});
