import React, { Component } from 'react'
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Image, Platform, ActivityIndicator, SafeAreaView, TextInput, TouchableHighlight, Text } from 'react-native';
import { Input, Icon } from 'react-native-elements';
import { UIConstants, Theme } from '../config/constants';
import { ChatBubble, ChatRoom } from '../components';
import { connect } from 'react-redux';
import { NavigationService, RealmService } from '../utils';
import { Message, User } from '../models';
import { readMessage, chooseChatUser, clearChatUser,chooseChatLang } from '../actions';
import Hr from 'react-native-hr-plus';
import SegmentedControlTab from 'react-native-segmented-control-tab'

class ChatScreen extends Component {

  static navigationOptions = ({ navigation }) => {
    const chatList = navigation.state.params.chatList;
    return {
      headerRight: <Icon name='done' type="material" color='transparent' containerStyle={{padding: 10}}/>,
      headerTitleStyle: { 
        textAlign:"center", 
        flex:1 
      },
      title: chatList.user.username,
    };
  };

  reloadChatList = null;
  chatUser: User = null;
  currentUser: User = null;
  languages: [string] = [];
  langMap = {};
  constructor(props) {
    super(props);
    this.state = {
      lang: '',
      badges: [0, 0],
    }

    const chatList = this.props.navigation.getParam('chatList');
    this.chatUser = chatList.user;
    this.currentUser = this.props.user;
    this.props.chooseChatUser(this.chatUser.id);
    this.reloadChatList = this.props.navigation.getParam('reloadChatList');
    if (this.currentUser.lang1 === this.chatUser.lang1) return;
    if (
      this.currentUser.lang1 === this.chatUser.lang2 || this.currentUser.lang1 === this.chatUser.lang3 ||
      this.chatUser.lang1 === this.currentUser.lang2 || this.chatUser.lang1 === this.currentUser.lang3
    ) {
      this.languages = [this.currentUser.lang1, this.chatUser.lang1];
      this.langMap[this.currentUser.lang1] = 0;
      this.langMap[this.chatUser.lang1] = 1;
      if (chatList.master) {
        this.state.lang = this.currentUser.lang1;
      } else {
        this.state.lang = this.chatUser.lang1;
      }
      if (this.props.unread_messages) {
        this.props.unread_messages.forEach(item => {
          this.state.badges[this.langMap[item.lang]]++;
        });
      }
    }
    this.props.chooseChatLang(this.state.lang);
  }

  componentWillUpdate = (nextProps, nextState) => {
    let badges = [0, 0];
    if (nextProps.unread_messages) {
      nextProps.unread_messages.forEach(item => {
        badges[this.langMap[item.lang]]++;
      });
      nextState.badges = badges;
    }
  };
  
  componentWillUnmount() {
    this.props.clearChatUser();
    this.reloadChatList(true);
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null} enabled>
        {
          this.languages.length > 0
          ? (<View style={styles.segmentContainer}>
              <SegmentedControlTab
                values={this.languages}
                badges={this.state.badges}
                selectedIndex={this.langMap[this.state.lang]}
                onTabPress={(index) => {
                  this.props.chooseChatLang(this.languages[index]);
                  this.setState({lang: this.languages[index]})
                }}
                borderRadius={5}
              />
            </View>)
          : null
        }
        <View style={{flex: 1, }}><ChatRoom chatUser={this.chatUser} lang={this.state.lang}/></View>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  segmentContainer: {
    width: '70%', 
    alignSelf: 'center',
    paddingVertical: 5,
  }
});

const mapStateToProps = ({ auth, message }) => {
  const { user } = auth;
  const { unread_messages } = message;
  return { user, unread_messages };
};

export default connect(mapStateToProps, {
  readMessage, chooseChatUser, clearChatUser, chooseChatLang
})(ChatScreen);