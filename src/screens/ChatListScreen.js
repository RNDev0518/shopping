import React, { Component } from 'react'
import { StyleSheet, View, Text, ListView, Image, TouchableHighlight, RefreshControl } from 'react-native';
import { UIConstants, Theme } from '../config/constants';
import { NavigationService, RealmService, getLanguages } from '../utils';
import { User } from '../models';
import ActionButton from 'react-native-action-button';
import { Button, Badge } from 'react-native-elements';
import Realm from 'realm';
import {CachedImage} from "react-native-img-cache";
import ActionSheet from 'react-native-actionsheet';
import connect from 'react-redux/lib/connect/connect';
import { Message } from '../models';

class ChatListScreen extends Component {

  static navigationOptions = {
    headerTitleStyle: { 
      textAlign:"center", 
      flex:1 
    },
    title: 'Chat List',
  }

  listViewDataSource: ListView.DataSource = null;
  realm: Realm = null;
  selectedChat = null;

  constructor(props) {
    super(props);

    this.listViewDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => JSON.stringify(r1) !== JSON.stringify(r2)});
    this.state = {
      dataSource: this.listViewDataSource.cloneWithRows([]),
      chatLists: [],
      refreshing: false,
      unread_messages: {},
      languages: [],
      chooseUser: null,
    }
  }

  async fetchUnreadMessages(messages: [Message]) {
    const unread_messages = {};
    messages = [].concat(messages);
    for (var i=0; i<messages.length; i++) {
      unread_messages[messages[i].sender] = unread_messages[messages[i].sender] || [];
      unread_messages[messages[i].sender].push(messages[i]);
    }
    const users = Object.keys(unread_messages);
    let newUser = [], chatUsers = this.state.chatLists.map(item => item.userId), updated = false;
    for (var userId of users) {
      if (chatUsers.indexOf(userId) < 0 && userId) {
        this.addChatList(userId, true);
        updated = true;
      }
    }
    this.setState({unread_messages});
    this.updateChatList();
  }
  componentDidMount() {
    this.fetchUnreadMessages(this.props.unread_messages);
  }

  componentWillMount() {
    RealmService.openRealm().then(realm => {
      this.realm = realm;
      this.updateChatList();
    });
  }
  componentWillUpdate = (nextProps, nextState) => {
    this.reloadChatList();
  };
  
  async reloadChatList(withoutRefreshControl) {
    if (!withoutRefreshControl) this.setState({refreshing: true});
    await this.updateChatList();
    await this.fetchUnreadMessages(this.props.unread_messages);
    this.setState({refreshing: false});
  }

  async updateChatList() {
    if (!this.realm) return setTimeout(this.updateChatList.bind(this), 300);
    
    let chatLists = await RealmService.readChatList();

    for (var i=0;i<chatLists.length;i++) {
      chatLists[i].user = await User.getById(chatLists[i].userId);
      if (!chatLists[i].user) {
        try {
          await RealmService.removeChatList(chatLists[i]);
        } catch (error){
        }
      }
    }
    chatLists = chatLists.filter(item => item.user);
    this.setState({
      chatLists,
      dataSource: this.listViewDataSource.cloneWithRows(chatLists)
    });
  }

  componentWillUpdate = (nextProps, nextState) => {
    if (this.props.unread_messages !== nextProps.unread_messages) {
      this.fetchUnreadMessages(nextProps.unread_messages);
    }
  };

  listItemRender(chatList) {
    let lastMessage = chatList.lastMessage.split('\n').join(' ') || '';
    if (lastMessage.length > 20) {
      lastMessage = lastMessage.substr(0, 25) + '...';
    }
    return (
      <TouchableHighlight underlayColor={Theme.colors.highlight} onPress={() => {
        NavigationService.navigate('Chatroom', { chatList: chatList, reloadChatList: this.reloadChatList.bind(this) });
      }} onLongPress={() => {
        this.selectedChat = chatList;
        this.ActionSheet.show();
      }}>
        <View style={styles.rowView}>
          {
            chatList.user.photo ? <CachedImage
              source={{ uri: chatList.user.photo }}
              style={styles.userAvatar}
            /> : <Image source={require('../assets/images/avatar.png')} style={styles.userAvatar}/>
          }
          <View style={{flexDirection: 'row', flex: 1}}>
            <View style={{flex: 1}}>
              <Text style={styles.username}>{chatList.user.username}</Text>
              <Text style={styles.lastMessage}>{lastMessage}</Text>
            </View>
            <View>
              <View style={{flex: 1}}>
                {
                  this.state.unread_messages[chatList.userId] ? (
                    <Badge containerStyle={{alignSelf: 'center'}} value={this.state.unread_messages[chatList.userId].length} textStyle={{ color: 'white', fontWeight: '900', fontSize: 12 }}/>
                  ) : null
                }
              </View>
              <Text style={styles.updatedAt}>{chatList.updatedAt}</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
  async addChatList(userId, master) {
    if (userId === this.props.user.id) return;
    await RealmService.addChatList(userId, master);
    this.updateChatList();
  }
  message = null;
  render() {
    return (
      <View style={styles.container}>
        <ListView
          style={styles.container}
          dataSource={this.state.dataSource}
          renderRow={this.listItemRender.bind(this)}
          enableEmptySections={true}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.reloadChatList.bind(this)}
              enabled={true}
              colors={[Theme.colors.successDark]}
              tintColor={Theme.colors.successDark}
              />}
        />
        <ActionButton 
          size={45}
          buttonColor="rgba(231,76,60,1)"
          offsetX={20} offsetY={20}
          onPress={() => {
            NavigationService.navigate('UserSearch', {type: 'add_chat', onSelect: async (user: User) => {
              const currentUser = await User.currentUser();
              const languages = getLanguages(currentUser, user);
              if (languages) {
                this.setState({languages, chooseUser: user});
                this.ActionSheetMasterSlave.show();
              } else {
                this.addChatList(user.id, true);
              }
            }});
          }}
        />
        <ActionSheet
          ref={actionSheet => this.ActionSheet = actionSheet}
          options={['Delete Chat', 'Cancel']}
          cancelButtonIndex={1}
          onPress={(index) => { 
            switch (index) {
              case 0:
                RealmService.removeChatList(this.selectedChat).then(() => {
                  this.updateChatList();
                });
              case 1:
              default:
                break;
            }
            this.selectedChat = null;
          }}
        />
        <ActionSheet
          ref={actionSheet => this.ActionSheetMasterSlave = actionSheet}
          title='We detect you talking different languages, Which language do you want to use for this room?'
          options={[...this.state.languages, 'Cancel']}
          cancelButtonIndex={2}
          onPress={(index) => { 
            switch (index) {
              case 0:
                this.addChatList(this.state.chooseUser.id, true);
                break;
              case 1:
                this.addChatList(this.state.chooseUser.id, false);
                break;
              default:
                break;
            }
            this.selectedChat = null;
          }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background
  },
  rowView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 10,
    marginRight: 20,
  },
  username: {
    fontSize: 20,
    fontWeight: '900',
    paddingBottom: 10,
  },
  lastMessage: {
    flex: 1,
  },
  updatedAt: {
    paddingRight: 10,
  }
});

const mapStateToProps = ({ message, auth }) => {
  const { user } = auth;
  const { unread_messages } = message;
  return { unread_messages, user };
};

export default connect(mapStateToProps, null)(ChatListScreen);