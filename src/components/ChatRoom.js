import React, { Component } from 'react'
import { Parse } from 'parse/react-native';

import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Image, Platform, ActivityIndicator, SafeAreaView, TextInput, TouchableHighlight, Text, Alert, Keyboard } from 'react-native';
import { Input, Icon } from 'react-native-elements';
import { UIConstants, Theme, ParseConfig } from '../config/constants';
import { ChatBubble } from './';
import { connect } from 'react-redux';
import { NavigationService, RealmService } from '../utils';
import { Message, User, UnreadMessage } from '../models';
import { readMessage, updatedMessage, deletedMessage } from '../actions';
import Hr from 'react-native-hr-plus';
import ActionSheet from 'react-native-actionsheet';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-crop-picker';
import { ImageBubble } from './ImageBubble';
import ImageResizer from 'react-native-image-resizer';
import RNFetchBlob from 'react-native-fetch-blob'

const rtl = /[\u0590-\u06FF]/;

class ChatRoomCmp extends Component {

  chatUser: User = null;
  myUser: User = null;
  editingMessageObj: Message = null;
  constructor(props) {
    super(props);
    this.state = {
      translated: true,
      message: '',
      messages: [],
      unreadStart: 0,
      height: 0,
      placeholder: 'Type a message...',
      actionSheetItems: [],
      translateMode: false,
      editMode: '',
    }
    this.chatUser = this.props.chatUser;
    this.myUser = this.props.user;
    this.initMessages(this.props.lang);
  }

  async initMessages(lang) {
    const messages = await RealmService.readMessage(this.chatUser.id, lang)
    const unread_messages = this.props.unread_messages.filter((item: Message) => {
      return item.lang === this.props.lang;
    });
    
    this.setState({messages: [].concat(messages).concat(unread_messages), unreadStart: messages.length});
    for (var item of unread_messages) {
      this.props.readMessage(item);
    }
  }

  async sendMessage() {
    if (!this.state.message) return;
    if (this.editingMessageObj) return this.confirmEdit();
    this.messageRef.clear();
    const message = Message.create(this.myUser.id, this.chatUser.id, this.state.translateMode ? [null, this.state.message] : [this.state.message], this.props.lang);
    try {
      this.state.message = '';
      await message.save();
      const messages = [].concat(this.state.messages).concat(message);
      if (this.state.messages.length === this.state.unreadStart) {
        this.setState({messages, unreadStart: messages.length});
      } else {
        this.setState({messages});
      }
      RealmService.addMessage(message, this.chatUser.id);
    } catch (error) {
      console.log(error.message);
    }
  }

  componentWillUpdate = (nextProps, nextState) => {
    if (this.props.lang !== nextProps.lang) {
      this.initMessages(nextProps.lang);
    } else if (nextProps.new_message) {
      const messages = [].concat(nextState.messages).concat(nextProps.new_message);
      nextState.messages = messages;
      nextProps.new_message = null;
      this.props.readMessage(nextProps.new_message);
    } else if (nextProps.updated_message) {
      let messages = [].concat(nextState.messages);
      for (var i=0;i<messages.length;i++) {
        if (messages[i].id === nextProps.updated_message.id) {
          messages[i] = nextProps.updated_message;
        }
      }
      nextState.messages = messages;
      RealmService.updateMessage(nextProps.updated_message);
      this.props.updatedMessage();
    } else if (nextProps.deleted_message) {
      let messages = [].concat(nextState.messages);
      for (var i=0;i<messages.length;i++) {
        if (messages[i].id === nextProps.deleted_message.id) {
          if (nextState.unreadStart < i) {
            nextState.unreadStart--;
          }
          messages.splice(i, 1);
        }
      }
      nextState.messages = messages;
      this.props.deletedMessage();
      this.deleteMessage(nextProps.deleted_message);
    }    
  };
  ActionSheet: ActionSheet = null;
  actionSheetActions: [];
  updateActionSheet(message: Message) {
    let actionSheetItems = [];
    this.actionSheetActions = [];
    if (this.props.lang === '') {
      if (message.sender === this.myUser.id) {
        actionSheetItems = ['Delete', 'Edit1', 'Edit2'];
        this.actionSheetActions = [() => {
          this.deleteMessage(message)
        }, () => {
          this.editMessage(message);
        }, () => {
          this.editTranslatedMessage(message);
        }]
      } else {
        return;
      }
    } else if (this.props.lang === this.myUser.lang1) {
      if (message.sender === this.myUser.id) {
        actionSheetItems = ['Delete', 'Edit1'];
        this.actionSheetActions = [() => {
          this.deleteMessage(message)
        }, () => {
          this.editMessage(message);
        }];
      } else {
        actionSheetItems = [];
        this.actionSheetActions = [];
      }
      if (message.messages[1]) {
        actionSheetItems.push('Edit3');
        this.actionSheetActions.push(() => {
          this.editReversedMessage(message);
        });
      }
    } else {
      if (message.sender === this.myUser.id) {
        actionSheetItems = ['Delete', 'Edit1'];
        this.actionSheetActions = [() => {
          this.deleteMessage(message)
        }, () => {
          this.editMessage(message);
        }];
        actionSheetItems.push('Edit2');
        this.actionSheetActions.push(() => {
          this.editTranslatedMessage(message);
        });
      } else {
        actionSheetItems = [];
        this.actionSheetActions = [];
      }
    }
    actionSheetItems.push('Cancel');
    this.setState({actionSheetItems});
    if (actionSheetItems.length > 1) {
      this.ActionSheet.show();
    }
  }
  deleteMessage(message: Message) {
    try {
      message.delete();
    } catch (error) {
      console.log(error.message);
    } finally {
      UnreadMessage.deletedMessage(message.id);
    }
  }
  editMessage(message: Message) {
    this.editingMessageObj = message,
    this.setState({
      message: message.messages[0],
      editMode: 'main',
      placeholder: 'Type a message...'
    });
    this.messageRef.focus();
  }
  editTranslatedMessage(message: Message) {
    this.editingMessageObj = message,
    this.setState({
      message: message.messages[1],
      editMode: 'translate',
      placeholder: 'Type a translate message...'
    });
    this.messageRef.focus();
  }
  editReversedMessage(message: Message) {
    this.editingMessageObj = message,
    this.setState({
      message: message.messages[2],
      editMode: 'reverse',
      placeholder: 'Type a correct translate...'
    });
    this.messageRef.focus();
  }
  async confirmEdit() {
    switch (this.state.editMode) {
      case 'main':
      this.editingMessageObj.messages[0] = this.state.message;
      break;
      case 'translate':
      this.editingMessageObj.messages[1] = this.state.message;
      break;
      case 'reverse':
      this.editingMessageObj.messages[2] = this.state.message;
      break;
    }
    this.editingMessageObj.prepareParseObject();
    this.editingMessageObj.save();
    RealmService.updateMessage(this.editingMessageObj);
    this.setState({ message: '', editMode: '', placeholder: 'Type a message...'});
    this.editingMessageObj = null;
  }
  isAttachMessage(message: Message) {
    return message.messages[0] && message.messages[0].startsWith('http://eurochat.info/api');
  }

  async pickImage(result) {
    try {
      let quality = 100;
      if (result.size > 1000000) {
        quality = 20;
      } else if (result.size > 500000) {
        quality = 50
      } else if (result.size > 200000) {
        quality = 75
      }
      const compressedImage = await ImageResizer.createResizedImage(result.path, result.width, result.height, 'JPEG', quality);
      const base64 = await RNFetchBlob.fs.readFile(compressedImage.path, 'base64');
      let filename = result.path.split('/');
      filename = filename[filename.length-1];
      const imageFile = new Parse.File(`${Date.now()}-${filename}`, {base64});

      await imageFile.save();

      const message = Message.create(this.myUser.id, this.chatUser.id, [imageFile.url()], this.props.lang);
      await message.save();
      const messages = [].concat(this.state.messages).concat(message);
      if (this.state.messages.length === this.state.unreadStart) {
        this.setState({messages, unreadStart: messages.length});
      } else {
        this.setState({messages});
      }
      RealmService.addMessage(message, this.chatUser.id);

    } catch (error) {
    }
  }

  render() {
    const messages = this.state.messages.filter((item, index) => index < this.state.unreadStart).map((message: Message, index) => {
      const sender = message.sender;
      if (this.isAttachMessage(message)) {
        return (<ImageBubble 
          key={index} 
          mine={sender === this.myUser.id} 
          user={sender === this.myUser.id ? this.myUser : this.chatUser} 
          url={message.messages[0]} 
          onLongPress={() => {
            if (message.sender === this.myUser.id) {
              let actionSheetItems = ['Delete'];
              this.actionSheetActions = [() => {
                this.deleteMessage(message)
              }]
              actionSheetItems.push('Cancel');
              this.setState({actionSheetItems});
              this.ActionSheet.show();
            }
          }}/>);
      } else {
        return (<ChatBubble 
          key={index} 
          mine={sender === this.myUser.id} 
          user={sender === this.myUser.id ? this.myUser : this.chatUser} 
          messages={message.messages} 
          onLongPress={() => {
            this.updateActionSheet(message);
          }}/>);
      }
    });
    const unread_messages = this.state.messages.filter((item, index) => index >= this.state.unreadStart).map((message, index) => {
      const sender = message.sender;
      if (this.isAttachMessage(message)) {
        return (<ImageBubble
          key={index} 
          mine={sender == this.myUser.id} 
          user={sender == this.myUser.id ? this.myUser : this.chatUser} 
          url={message.messages[0]} 
          onLongPress={() => {
            if (message.sender === this.myUser.id) {
              let actionSheetItems = ['Delete'];
              this.actionSheetActions = [() => {
                this.deleteMessage(message)
              }]
              actionSheetItems.push('Cancel');
              this.setState({actionSheetItems});
              this.ActionSheet.show();
            }
          }}/>);
      } else {
        return (<ChatBubble
          key={index} 
          mine={sender === this.myUser.id} 
          user={sender === this.myUser.id ? this.myUser : this.chatUser} 
          messages={message.messages} 
          onLongPress={() => {
            this.updateActionSheet(message);
          }}/>);
      }
    });
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          <ScrollView style={{flex: 1}} contentContainerStyle={{minHeight: '100%', paddingVertical: 10}} ref="scrollView"
            onContentSizeChange={(width,height) => this.refs.scrollView.scrollToEnd({animated: true})}
            >
            {messages}
            {unread_messages.length
              ? <Hr color={this.props.mine ? 'grey' : '#ddd'} width={1} style={{margin: 5}}><Text>  Unread messages  </Text></Hr>
              : null
            }
            {unread_messages}
          </ScrollView>
        </View>
        <View style={styles.sendMessage}>
          {
            this.state.editMode
            ? <Icon 
              name='close'
              type='material'
              size={10}
              containerStyle={styles.cancelIcon} underlayColor='transparent'
              onPress={() => {
                this.setState({ message: '', editMode: '' });
                this.editingMessageObj = null;
              }}
            /> : <TouchableHighlight underlayColor='transparent' onPress={this.props.lang === this.myUser.lang1 ? null : () => {
              if (this.state.editMode) return;
              this.setState({translateMode: !this.state.translateMode});
            }} style={styles.translateIcon}>
              <Image source={
                this.props.lang === this.myUser.lang1 ? require('../assets/images/italic_dis.png')
                : this.state.translateMode ? require('../assets/images/italic_on.png')
                : require('../assets/images/italic_off.png')} style={styles.icons}/>
            </TouchableHighlight>
          }
          <Input
            ref={ref => {this.messageRef = ref}}
            placeholder={
              this.state.editMode ? this.state.placeholder : this.state.translateMode ? 'Type a translate message...' : 'Type a message...'
            }
            containerStyle={styles.textContainer}
            inputStyle={{
              height: Math.max(35, this.state.height),
              fontSize: 14,
              textAlign: rtl.test(this.state.message) ? 'right' : 'left'
            }}
            multiline={true}
            value={this.state.message}
            inputContainerStyle={styles.textInputContainer}
            onChangeText={(message) => this.setState({message})}
            onContentSizeChange={(event) => {
              this.setState({ height: event.nativeEvent.contentSize.height })
            }}
          />
          <TouchableHighlight underlayColor='transparent' onPress={async () => {
            this.ChooseAction.show();
          }} style={styles.sendIcon}>
            <Image source={require('../assets/images/attach.png')} style={styles.icons}/>
          </TouchableHighlight>
          <TouchableHighlight underlayColor='transparent' onPress={this.state.message ? this.sendMessage.bind(this) : null} style={styles.sendIcon}>
            <Image source={this.state.message ? require('../assets/images/send_on.png') : require('../assets/images/send_on.png')} style={styles.icons}/>
          </TouchableHighlight>
        </View>
        <ActionSheet
          ref={actionSheet => this.ActionSheet = actionSheet}
          options={this.state.actionSheetItems}
          cancelButtonIndex={this.state.actionSheetItems.length - 1}
          onPress={(index) => { 
            if (this.actionSheetActions && this.actionSheetActions.length > index) {
              this.actionSheetActions[index].bind(this)();
            }
          }}
        />
        <ActionSheet
          ref={actionSheet => this.ChooseAction = actionSheet}
          title='Choose picture'
          options={['Take Photo...', 'Open Library...', 'Cancel']}
          cancelButtonIndex={2}
          onPress={(index) => {
            if (index === 0) {
              ImagePicker.openCamera({}).then(result => {
                this.pickImage(result);
              });
            } else if (index === 1) {
              ImagePicker.openPicker({}).then(result => {
                this.pickImage(result);
              });
            }
          }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  sendMessage: {
    width: '100%',
    borderColor: 'lightgrey',
    borderWidth: 1,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    shadowOffset:{width: 2, height: 2},
    elevation: 5,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    width: '80%',
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: Theme.colors.background,
  },
  modalTitle: {
    paddingVertical: 10,
    fontSize: 14,
    alignSelf: 'center',
  },
  modalOKButton: {
    padding: 10,
    borderTopColor: 'lightgrey',
    borderTopWidth: 1,
    alignItems: 'center',
  },
  modalTextContainer: {
    width: '100%',
    paddingHorizontal: 5,
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  modalTextInputContainer: {
    borderColor: 'transparent',
  },
  textContainer: {
    flex: 1
  },
  textInputContainer: {
    borderColor: 'transparent',
  },
  cancelIcon: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30, height: 30,
    backgroundColor: '#eeeeee',
    marginHorizontal: 5,
    borderRadius: 15,
    overflow: 'hidden'
  },
  translateIcon: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40, height: 40,
    backgroundColor: '#eeeeee',
    marginHorizontal: 5,
    borderRadius: 20,
    overflow: 'hidden'
  },
  sendIcon: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40, height: 40,
    borderRadius: 20,
  },
  icons: {
    width: 40,
    height: 40,
  }
});

const mapStateToProps = ({ auth, message }) => {
  const { user } = auth;
  const { new_message, updated_message, deleted_message, unread_messages } = message;
  return { user, new_message, updated_message, deleted_message, unread_messages };
};

export const ChatRoom = connect(mapStateToProps, {
  readMessage, updatedMessage, deletedMessage,
})(ChatRoomCmp);