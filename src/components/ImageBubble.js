import React, { Component } from 'react'
import { View, Text, Image, StyleSheet, TouchableHighlight, Clipboard } from 'react-native';
import { Theme } from '../config/constants';
import { CachedImage, ImageCacheProvider } from 'react-native-img-cache';
import Lightbox from 'react-native-lightbox';

export class ImageBubble extends Component {
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
    Clipboard.setString(this.props.url);
    return (
      <TouchableHighlight onLongPress={this.props.onLongPress} underlayColor='transparent'>
        <View style={[styles.container, {justifyContent: this.props.mine ? 'flex-end' : 'flex-start'}]}>
          { this.props.mine ? null : avatar }
          <View style={styles.bubbleContainer}>
            <View style={this.props.mine ? styles.content_right : styles.content_left}>
              {
                this.props.url ? (
                  <Lightbox
                    navigator={this.props.navigator}
                    style={{justifyContent: "center"}}
                    renderContent={() => (<CachedImage
                      style={{ width: '100%', height: '100%'}}
                      source={{ uri: this.props.url }}
                      resizeMode='contain'
                  />)}>
                    <CachedImage
                      style={{ width: 150, height: 150 }}
                      source={{ uri: this.props.url }}
                      resizeMode='cover'
                    />
                  </Lightbox>
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
    flexDirection: 'row',
  },
  text_left: {
    marginLeft: 5,
    color: 'white',
  },
  text_right: {
    marginLeft: 5,
    color: 'black',
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
    marginRight: 5,
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
