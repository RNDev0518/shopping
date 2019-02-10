import React, { Component } from 'react';
import { View, StyleSheet, Image, Text, TouchableHighlight, Alert, Platform, KeyboardAvoidingView, ScrollView, Clipboard, PermissionsAndroid } from 'react-native';
import { Theme } from '../config/themes';
import { WishSellingList } from '../models/WishSellingList';
import { CachedImage } from 'react-native-img-cache';
import Modal from 'react-native-modal';
import { TextField } from 'react-native-material-textfield';
import Switch from 'react-native-switch-pro';
import { Icon } from 'react-native-elements';
import { currencies } from '../config/constants';
import Picker from 'react-native-picker';
import ImagePicker from 'react-native-image-crop-picker';
import { Parse } from 'parse/react-native';
import { getLocationAddressFull, isValidURL } from '../utils';
import ActionSheet from 'react-native-actionsheet';

let self: WishSellingListDetail = null;

class WishSellingListDetail extends Component {

  static navigationOptions = ({ navigation }) => {
    const isNew = !(navigation.state.params.shoppingList.id || navigation.state.params.shoppingList.realm_id);
    return {
      headerRight: <View style={{flexDirection: 'row'}}>
        <Icon name='pin-drop' type='material' size={32} underlayColor='transparent' containerStyle={{paddingHorizontal: 3}} onPress={() => {
          self.ActionSheet.show();
        }}/>
        <Icon name='done' type='material' size={32} underlayColor='transparent' containerStyle={{paddingHorizontal: 3, marginRight: 7}} onPress={async () => {
          await self.save();
          self.props.navigation.goBack();
        }}/>
      </View>,
      headerTitleStyle: { 
        textAlign:"center", 
        flex:1 
      },
      title: isNew ? `Create ${navigation.state.params.type}` : `Edit ${navigation.state.params.type}`,
    }
  };

  constructor(props) {
    super(props);
    const shoppingList: WishSellingList = this.props.navigation.getParam('shoppingList');
    this.state = {
      searchWords: shoppingList.searchWords || '',
      tags: (shoppingList.tags || []).join(' '),
      description: shoppingList.description || '',
      quantity: `${shoppingList.quantity || 0}`,
      price: `${shoppingList.price || 0}`,
      isOnline: shoppingList.isOnline,
      isSharingOn: shoppingList.isSharingOn,
      currency: shoppingList.currency || '$',
      image: shoppingList.image,
      geoLocation: shoppingList.geoLocation,
      location: shoppingList.location
    }
    this.reload = this.props.navigation.getParam('reload');
    self = this;
  }

  updateLocation() {
    const updateLocation = async () => {
      navigator.geolocation.getCurrentPosition(position => {
        getLocationAddressFull(position.coords).then(location => {
          this.setState({
            geoLocation: position.coords,
            location
          });
        }).catch(error => {
          this.setState({
            geoLocation: position.coords,
          });
        });
      }, (error) => {
        Alert.alert(error.message);
      }, {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 10000
      });
    }
    if (Platform.OS === 'android') {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(granted => {
        if (granted) {
          this.initLocation();
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(granted => {
            updateLocation();
          }).catch(error => {
            Alert.alert('Can not get location.');
          })
        }
      });
    } else {
      updateLocation();
    }
  }
  clearLocation() {
    this.setState({
      geoLocation: null,
      location: null
    });
  }
  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(this.state.geoLocation) !== JSON.stringify(prevState.geoLocation)) {
      this.save().then(() => {
        Alert.alert(this.state.geoLocation ? 'Location was updated.' : 'Location was cleared.');
      });
    }
  }

  async save() {
    const shoppingList: WishSellingList = this.props.navigation.getParam('shoppingList');
    shoppingList.searchWords = this.state.searchWords;
    if (this.state.tags) {
      shoppingList.tags = this.state.tags.split(' ');
    } else {
      shoppingList.tags = [];
    }
    shoppingList.description = this.state.description;
    shoppingList.quantity = parseInt(this.state.quantity);
    shoppingList.price = parseFloat(this.state.price);
    shoppingList.isOnline = this.state.isOnline;
    shoppingList.isSharingOn = this.state.isSharingOn;
    shoppingList.currency = this.state.currency;
    shoppingList.image = this.state.image;
    shoppingList.location = this.state.location;
    shoppingList.geoLocation = this.state.geoLocation;
    await shoppingList.save();
    this.reload();
  }

  render() {
    const shoppingList: WishSellingList = this.props.navigation.getParam('shoppingList');
    const image = this.state.image
                  ? <CachedImage source={{uri: this.state.image}} style={styles.imageStyle} resizeMode='contain' />
                  : <Image source={require('../assets/images/shopping.png')} style={styles.imageStyle} resizeMode='contain'/>;

    const currencyPickerOptions = {
      pickerData: currencies,
      pickerTitleText: 'Choose Currency',
      pickerConfirmBtnText: 'Choose',
      pickerConfirmBtnColor: [0,0,0,1],
      pickerCancelBtnText: 'Cancel',
      pickerCancelBtnColor: [128, 128, 128, 1],
    };

    return shoppingList !== null ? (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null} enabled>
        <ActionSheet
          ref={actionSheet => this.ActionSheet = actionSheet}
          title={`Update your item's location and time to your current location and time?`}
          options={['Update from GPS', 'Clear', 'Cancel']}
          cancelButtonIndex={2}
          onPress={(index) => { 
            switch (index) {
              case 0:
              this.updateLocation();
              break;
              case 1:
              this.clearLocation();
              break;
              default:
              break;
            }
          }}
        />
        <ActionSheet
          ref={actionSheet => this.LinkActionSheet = actionSheet}
          title={`Select Image Link`}
          options={['Paste Image Link', 'Cancel']}
          cancelButtonIndex={1}
          onPress={(index) => { 
            if (index === 0) {
              Clipboard.getString().then(image => {
                if (!image) {
                  Alert.alert('Error', 'Clipboard is empty');
                } else if (isValidURL(image)) {
                  this.setState({ image });
                } else {
                  Alert.alert('Error', 'Clipboard is not URL format');
                }
              }).catch(error => {
                Alert.alert('Error', 'Clipboard is empty');
              })
            }
          }}
        />
        <ScrollView style={{flex: 1}} contentContainerStyle={{minHeight: '100%'}}>
          <View style={styles.editContainer}>
            <TextField label='Name' value={this.state.searchWords} autoCapitalize='none' onChangeText={(searchWords) => this.setState({searchWords})}/>
            <TextField label='Tags' value={this.state.tags} autoCapitalize='none' onChangeText={(tags) => this.setState({tags: tags.toLowerCase()})}/>
            <TextField label='Description' value={this.state.description} onChangeText={(description) => this.setState({description})}/>
            <View style={{flexDirection: 'row'}}>
              <TextField label='Price' containerStyle={{flex: 1}} prefix={this.state.currency} value={this.state.price} onChangeText={(price) => this.setState({price})} keyboardType='numeric'/>
              <TouchableHighlight underlayColor={'transparent'} style={{paddingVertical: 10, alignSelf: 'flex-end'}} onPress={() => {
                Picker.init({
                  ...currencyPickerOptions,
                  selectedValue: [this.state.currency],
                  onPickerConfirm: (currency) => {
                    this.setState({currency: currency[0]})
                  }
                });
                Picker.show();
              }}>
                <Text style={{color: 'grey'}}>{'Currency: ' + this.state.currency}</Text>
              </TouchableHighlight>
            </View>
            <View style={{flexDirection: 'row'}}>
              <TouchableHighlight underlayColor={'transparent'} onPress={() => {
                this.LinkActionSheet.show();
              }}>
                {image}
              </TouchableHighlight>
              <View style={{flex: 1}}>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Online</Text>
                  <Switch value={this.state.isOnline} width={60} height={30} onSyncPress={isOnline => this.setState({isOnline})}/>
                </View>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Sharing</Text>
                  <Switch value={this.state.isSharingOn} width={60} height={30} onSyncPress={isSharingOn => this.setState({isSharingOn})}/>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    ) : null;
  }
}

const styles = StyleSheet.create({
  touchable: {
    margin: 10,
  },
  container: {
    backgroundColor: Theme.colors.background,
    flex: 1,
  },
  editContainer:{
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopColor: 'grey',
    borderTopWidth: 1,
  },
  buttonStyle: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  imageStyle: {
    width: 120,
    height: 120,
  },
  descriptionContainer: {
    flex: 1,
  },
  descriptionItem: {
    flex: 1,
    justifyContent: 'center',
  },
  icons: {
    flex: 1,
    justifyContent: 'center',
  },
  switchContainer: {
    flex: 1, 
    paddingLeft: 20,
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
});

export default WishSellingListDetail;