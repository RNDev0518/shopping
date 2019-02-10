import React, { Component } from 'react';
import { StyleSheet, View, Image, ImageEditor, KeyboardAvoidingView, ScrollView, TouchableHighlight, Platform, TextInput, Keyboard } from 'react-native';
import { Button, Text, Input, Header, Icon } from 'react-native-elements';
import { UIConstants, languageMap, Theme } from '../config/constants';
import ImagePicker from 'react-native-image-crop-picker';
import Parse from 'parse/react-native';
import { connect } from 'react-redux';
import { logoutUser, saveProfile } from '../actions';
import { Dropdown } from 'react-native-material-dropdown';
import { Buffer } from 'buffer';
import Picker from 'react-native-picker';
import { CachedImage } from "react-native-img-cache";
import { Handshake, User, Follow } from '../models';
import { NavigationService } from '../utils';
import ImageResizer from 'react-native-image-resizer';
import RNFetchBlob from 'react-native-fetch-blob'
import { NavigationEvents } from 'react-navigation';
import { reset } from 'ansi-colors';
import Switch from 'react-native-switch-pro'
import ActionSheet from 'react-native-actionsheet';

let self: PersonScreen = null;

const Container = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

class PersonScreen extends Component {

  static navigationOptions = ({ navigation }) => {
    const isMine = !(navigation.state.params && navigation.state.params.user);
    return isMine ? {
      headerLeft: <Icon name='exit-to-app' type="material" underlayColor='transparent' containerStyle={{paddingHorizontal: 3, marginLeft: 7}} onPress={async () => {
        const myStatus = await User.getMyStatus();
        myStatus.set('online', false);
        await myStatus.save();
        self.props.logoutUser.bind(self)()
      }}/>,
      headerRight: <Icon name='done' type="material" size={32} underlayColor='transparent' containerStyle={{paddingHorizontal: 3, marginRight: 7}} onPress={() => self.saveProfile.bind(self)()}/>,
      headerTitleStyle: { 
        textAlign:"center", 
        flex:1 
      },
      title: 'Profile',
    } : {
      headerRight: <Icon name='done' type="material" color='transparent' containerStyle={{padding: 10}}/>,
      headerTitleStyle: { 
        textAlign:"center", 
        flex:1 
      },
      title: navigation.state.params.user.fullName
    };
  };

  constructor(props) {
    super(props);
    self = this;
    this.isMine = this.props.navigation.getParam('user', null) === null;
    this.state = {
      id: null,
      username: null,
      email: null,
      firstName: null,
      lastName: null,
      phone: null,
      photo: null,
      website: null,
      bio: null,
      public_hashtags: null,
      private_hashtags: null,
      lang1: null,
      lang2: null,
      lang3: null,
      social: null,
      gender: null,
      shareLocation: false,
      follower: 0,
      following: 0,
      follow: false,
      handshake: false,
    }
  }

  loadProfile() {
    let user: User = this.props.navigation.getParam('user', undefined) || this.props.user;
    this.setState({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      photo: user.photo,
      website: user.website,
      bio: user.bio,
      public_hashtags: user.public_hashtags,
      private_hashtags: user.private_hashtags,
      lang1: user.lang1,
      lang2: user.lang2,
      lang3: user.lang3,
      social: user.social,
      gender: user.gender,
      shareLocation: user.shareLocation
    });
  }
  isMine: boolean = false;

  componentWillMount() {
    this.loadProfile();
  }

  async reloadProfile() {
    let user: User = await User.currentUser();
    this.setState({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      photo: user.photo,
      website: user.website,
      bio: user.bio,
      public_hashtags: user.public_hashtags,
      private_hashtags: user.private_hashtags,
      lang1: user.lang1,
      lang2: user.lang2,
      lang3: user.lang3,
      social: user.social,
      gender: user.gender,
      shareLocation: user.shareLocation
    });
  }
  async pickImage(result) {

    try {

      const compressedImage = await ImageResizer.createResizedImage(result.path, result.width, result.height, 'JPEG', 100);
      const base64 = await RNFetchBlob.fs.readFile(compressedImage.path, 'base64');
      let filename = result.path.split('/');
      filename = filename[filename.length-1];
      const profileImage = new Parse.File(`${this.state.id}`, { base64 });

      await profileImage.save();

      this.setState({photo: profileImage.url()});
  
      await this.props.saveProfile({photo: profileImage.url()});

    } catch (error) {
      console.log(error.message);
    }

  }
  saving = false;
  saveProfile() {
    this.props.saveProfile(this.state);
    this.saving = true;
  }

  changeValue(key, value) {
    let newState = {}; newState[key] = value;
    this.setState(newState);
  }

  componentWillUpdate = (nextProps, nextState) => {
    if (this.saving && JSON.stringify(nextProps.user) !== JSON.stringify(this.props.user)) {
      setTimeout(() => {
        this.loadProfile();
      }, 200);
    }
  };

  componentDidMount = () => {
    this.updateFollowAndHandshake();
  };
  async updateFollowAndHandshake() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      Picker.hide();
    });
    const handshake = await Handshake.hadHandshake(this.state.id);
    const follow = await Follow.isFollow(this.state.id);
    const follower = await Follow.getFollowerCount(this.state.id);
    const following = await Follow.getFollowingCount(this.state.id);
    this.setState({handshake, follow, follower, following});
    this.mounted = true;
  }
  componentWillUnmount () {
    Picker.hide();
    this.keyboardDidShowListener.remove();
  }
  render() {
    let photo = <Image source={require('../assets/images/avatar.png')} style={styles.avatar}/>
    if (this.state.photo) photo = <CachedImage source={{
      uri: this.state.photo
    }} style={styles.avatar}/>;

    const data = [
      {key: 0, label: 'Male'},
      {key: 1, label: 'FaMale'}
    ];

    const langPickerOptions = {
      pickerData: Object.keys(languageMap),
      pickerTitleText: 'Choose Language',
      pickerConfirmBtnText: 'Choose',
      pickerConfirmBtnColor: [0,0,0,1],
      pickerCancelBtnText: 'Cancel',
      pickerCancelBtnColor: [128,128,128,1],
    };

    return this.state.username !== null ? (
      <Container style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null} enabled>
        <NavigationEvents
          onWillFocus={() => {
            if (this.mounted) {
              this.reloadProfile();
            }
          }}
        />
        <ScrollView style={{flex: 1}} contentContainerStyle={{minHeight: '100%'}}>
          <View style={{...styles.form, flexDirection: 'row'}}>
            <TouchableHighlight
              onPress={() => {
                if (this.isMine) {
                  this.ChooseAction.show();
                }
              }} style={styles.avatarContainer}
              underlayColor={'transparent'}
              >
              {photo}
            </TouchableHighlight>
            <View style={{flex: 1, paddingLeft: 10, alignSelf: 'center'}}>
            <View style={{flexDirection: 'row', marginBottom: 20}}>
              <View style={{flex: 1}}>
                <Text style={[styles.textCenter, { marginBottom: 5}]}>{this.state.follower}</Text>
                <Text style={[styles.textCenter]}>Follower</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={[styles.textCenter, { marginBottom: 5}]}>{this.state.following}</Text>
                <Text style={[styles.textCenter]}>Following</Text>
              </View>
            </View>
            {
              this.isMine ? (
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <TouchableHighlight style={[styles.infoButtons, {marginRight: 10, backgroundColor: Theme.colors.primary}]} underlayColor={Theme.colors.primaryActive} onPress={() => {
                    NavigationService.navigate('Followings');
                  }}>
                    <Text style={[styles.textCenter, {color: 'white'}]}>Followings</Text>
                  </TouchableHighlight>
                </View>
              ) : 
              (
                <View style={{flexDirection: 'row'}}>
                  <TouchableHighlight style={[
                    styles.infoButtons, 
                    {
                      marginRight: 10, 
                      backgroundColor: this.state.follow ? Theme.colors.highlight : Theme.colors.primary
                    }]}
                    underlayColor={Theme.colors.primaryActive} onPress={async () => {
                      if (!this.state.follow) {
                        await Follow.follow(this.state.id)
                        this.updateFollowAndHandshake();
                      } else {
                        await Follow.unfollow(this.state.id)
                        this.updateFollowAndHandshake();
                      }
                  }}>
                    <Text style={[styles.textCenter, {color: this.state.follow ? 'black' : 'white'}]}>{this.state.follow ? 'Unfollow' : 'Follow'}</Text>
                  </TouchableHighlight>
                  <TouchableHighlight style={[styles.infoButtons, {
                      backgroundColor: this.state.handshake ? Theme.colors.highlight : Theme.colors.primary
                    }]}
                    underlayColor={Theme.colors.primaryActive} onPress={async () => {
                    if (!this.state.handshake) {
                      await Handshake.sendHandshake(this.state.id)
                      this.setState({handshake: true});
                    } else {
                      await Handshake.removeHandshake(this.state.id)
                      this.setState({handshake: false});
                    }
                  }}>
                    <Text style={[styles.textCenter, {color: this.state.handshake ? 'black' : 'white'}]}>{this.state.handshake ? 'Unshake' : 'Shake'}</Text>
                  </TouchableHighlight>
                </View>
              )
            }
            </View>
          </View>
          <View style={styles.form}>
            {
              this.isMine ? (
                <View style={{width: '100%', flexDirection: 'row'}}>
                  <View style={{flex: 4, marginRight: 20}}>
                    <Input
                      placeholder="First Name" 
                      onChangeText={firstName => this.changeValue('firstName', firstName)} 
                      defaultValue={this.state.firstName}
                      containerStyle={styles.textContainer}
                      inputContainerStyle={styles.textInputContainer}
                      editable={this.isMine}
                      />
                  </View>
                  <View style={{flex: 3}}>
                    <Input 
                      style={{flex: 1}}
                      placeholder="Last Name" 
                      onChangeText={lastName => this.changeValue('lastName', lastName)} 
                      defaultValue={this.state.lastName}
                      editable={this.isMine}
                      containerStyle={styles.textContainer}
                      inputContainerStyle={styles.textInputContainer}
                      />
                  </View>
                </View>
              ) : null
            }
            <Input 
              placeholder="Username" 
              leftIcon={{name: 'user', type: 'font-awesome', color: 'grey'}}
              onChangeText={username => {
                if (!username) {
                  this.changeValue('username', username);
                } else {
                  this.changeValue('username', username.substr(1).replace(/\s/g, ''));
                }
              }} 
              value={`@${this.state.username}`}
              editable={this.isMine}
              containerStyle={styles.textContainer}
              inputContainerStyle={styles.textInputContainer}
              enablesReturnKeyAutomatically={false}
              />
            {
              this.isMine ? (
                <Input 
                  textContentType="emailAddress"
                  leftIcon={{name: 'envelope', type: 'font-awesome', color: 'grey', size: 16}}
                  onChangeText={email => this.changeValue('email', email)}
                  keyboardType="email-address"
                  defaultValue={this.state.email}
                  editable={false}
                  containerStyle={styles.textContainer}
                  inputContainerStyle={styles.textInputContainer}
                  />
              ) : null
            }
            {
              this.isMine ? (
                <Input 
                  placeholder="Phone" 
                  leftIcon={{name: 'phone', type: 'font-awesome', color: 'grey', size: 20}}
                  onChangeText={phone => this.changeValue('phone', phone)} 
                  defaultValue={this.state.phone}
                  containerStyle={styles.textContainer}
                  inputContainerStyle={styles.textInputContainer}
                  editable={this.isMine}
                  />
              ) : null
            }
            {
              this.isMine ? (
                <View
                  style={styles.pickerContainer}
                >
                  <Icon containerStyle={{marginTop: 2}} name='venus' type='font-awesome' color='grey'></Icon>
                  <View style={{overflow: 'hidden', backgroundColor: 'white', flex: 1}}>
                    <Dropdown
                      label='Gender'
                      data={[{
                        value: 'Female',
                      }, {
                        value: 'Male',
                      }]}
                      containerStyle={styles.picker}
                      value={this.state.gender || ''}
                      onChangeText={(gender) => {if (this.isMine) this.changeValue('gender', gender);}}
                    />
                  </View>
                </View>
              ) : null
            }
            <Input 
              placeholder="http://"
              leftIcon={{name: 'globe', type: 'font-awesome', color: 'grey'}}
              onChangeText={website => this.changeValue('website', website)} 
              defaultValue={this.state.website}
              containerStyle={styles.textContainer}
              inputContainerStyle={styles.textInputContainer}
              editable={this.isMine}
              />
            <View style={styles.textViewContainer}>
              <TextInput 
                placeholder="Bio" 
                multiline={true}
                onChangeText={bio => this.changeValue('bio', bio.toLowerCase())} 
                editable={this.isMine}
                defaultValue={this.state.bio}
                underlineColorAndroid={'transparent'}
                />
            </View>
            <View style={styles.textViewContainer}>
              <TextInput 
                placeholder="Public Hashtags" 
                onChangeText={public_hashtags => {
                  if (public_hashtags) {
                    this.changeValue('public_hashtags', public_hashtags.toLowerCase().split('\n').join(' ').split('\r').join('').split(' '))
                  } else {
                    this.changeValue('public_hashtags', []);
                  }
                }} 
                editable={this.isMine}
                defaultValue={(this.state.public_hashtags || []).join(' ')}
                underlineColorAndroid={'transparent'}
                />
            </View>
            {
              this.isMine ? (
                <View style={styles.textViewContainer}>
                  <TextInput 
                    placeholder="Private Hashtags" 
                    editable={this.isMine}
                    onChangeText={private_hashtags => {
                      if (private_hashtags) {
                        this.changeValue('private_hashtags', private_hashtags.toLowerCase().split('\n').join(' ').split('\r').join('').split(' '))
                      } else {
                        this.changeValue('private_hashtags', [])
                      }
                    }} 
                    defaultValue={(this.state.private_hashtags || []).join(' ')}
                    underlineColorAndroid={'transparent'}
                    />
                </View>
              ) : null
            }
            <View style={styles.languagesContainer}>
              <TouchableHighlight underlayColor={Theme.colors.highlight} style={styles.languages} onPress={() => {
                  if (!this.isMine) return;
                  Picker.init({
                    ...langPickerOptions,
                    selectedValue: [this.state.lang1],
                    onPickerConfirm: ([lang1]) => {
                      this.setState({lang1});
                    }
                  });
                  Picker.show();
                }}>
                <Text style={styles.languageText}>{this.state.lang1 || 'Native Language'}</Text>
              </TouchableHighlight>
              <TouchableHighlight underlayColor={Theme.colors.highlight} style={styles.languages} onPress={() => {
                  if (!this.isMine) return;
                  Picker.init({
                    ...langPickerOptions,
                    selectedValue: [this.state.lang2],
                    onPickerConfirm: ([lang2]) => {
                      this.setState({lang2});
                    }
                  });
                  Picker.show();
                }}>
                <Text style={styles.languageText}>{this.state.lang2 || 'Second Language'}</Text>
              </TouchableHighlight>
              <TouchableHighlight underlayColor={Theme.colors.highlight} style={styles.languagesLast} onPress={() => {
                  if (!this.isMine) return;
                  Picker.init({
                    ...langPickerOptions,
                    selectedValue: [this.state.lang3],
                    onPickerConfirm: ([lang3]) => {
                      this.setState({lang3});
                    }
                  });
                  Picker.show();
                }}>
                <Text style={styles.languageText}>{this.state.lang3 || 'Third Language'}</Text>
              </TouchableHighlight>
            </View>
            {
              this.isMine ? <View style={{marginVertical: 20, flexDirection: 'row'}}>
                <Text style={{flex: 1, fontSize: 16}}>Share Location</Text>
                <Switch value={this.state.shareLocation} width={60} height={30} onSyncPress={shareLocation => {
                  this.setState({shareLocation});
                }}/>
              </View> : null
            }
          </View>
        </ScrollView>
        <ActionSheet
          ref={actionSheet => this.ChooseAction = actionSheet}
          title='Choose picture'
          options={['Take Photo...', 'Open Library...', 'Cancel']}
          cancelButtonIndex={2}
          onPress={(index) => {
            if (index === 0) {
              ImagePicker.openCamera({
                cropping: true,
                width: 100,
                height: 100,
              }).then(result => {
                this.pickImage(result);
              });
            } else if (index === 1) {
              ImagePicker.openPicker({
                cropping: true,
                width: 100,
                height: 100,
              }).then(result => {
                this.pickImage(result);
              });
            }
          }}
        />
      </Container>
    ) : (<View></View>)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    marginVertical: 10,
    alignSelf: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'gray',
  },
  infoButtons: {
    flex: 1,
    paddingHorizontal: 2,
    borderRadius: 5,
    borderColor: Theme.colors.border.textContainer,
    borderWidth: 1,
    alignSelf: 'center',
    maxWidth: 100,
    alignItems: 'center',
    paddingVertical: 5,
  },
  form: {
    width: '80%',
    paddingVertical: 10,
    alignSelf: 'center',
  },
  textContainer: {
    width: '100%',
    paddingHorizontal: 5,
    marginBottom: 20,
    borderRadius: 30,
    borderColor: Theme.colors.border.textContainer,
    borderWidth: 1,
  },
  textViewContainer: {
    width: '100%',
    paddingHorizontal: 5,
    marginBottom: 20,
    borderRadius: 10,
    borderColor: Theme.colors.border.textContainer,
    borderWidth: 1,
    minHeight: 100,
  },
  textInputContainer: {
    borderColor: 'transparent'
  },
  pickerContainer: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 5,
    paddingLeft: 20,
    paddingRight: 10,
    marginBottom: 20,
    borderRadius: 30,
    borderColor: Theme.colors.border.textContainer,
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    marginTop: -30,
    marginBottom: -10,
    paddingLeft: 8,
  },

  languagesContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  languageText: {
    textAlign: 'center',
    alignSelf: 'center',
  },
  languages: {
    flex: 1,
    borderRadius: 10,
    justifyContent: 'center',
    marginRight: 10,
    paddingVertical: 10,
    borderColor: Theme.colors.border.textContainer,
    borderWidth: 1,
  }, 
  languagesLast: {
    flex: 1,
    borderRadius: 10,
    justifyContent: 'center',
    paddingVertical: 10,
    borderColor: Theme.colors.border.textContainer,
    borderWidth: 1,
  },
  textCenter: {
    textAlign: 'center'
  }
});

const mapStateToProps = ({ auth }) => {
  const { user } = auth;
  return { user };
};

export default connect(mapStateToProps, {
  logoutUser, saveProfile
})(PersonScreen);