import React, { Component } from 'react';
import { View, StyleSheet, Image, TouchableHighlight, Text, Platform, KeyboardAvoidingView, ScrollView, PermissionsAndroid, Alert, Clipboard } from 'react-native';
import { ShoppingItem } from '../models';
import { sleep, NavigationService, getLocationAddressFull, isValidURL } from '../utils';
import { Theme } from '../config/themes';
import { CachedImage } from 'react-native-img-cache';
import Dialog from "react-native-dialog";
import { TextField } from 'react-native-material-textfield';
import { Icon } from 'react-native-elements';
import Switch from 'react-native-switch-pro'
import ActionSheet from 'react-native-actionsheet';

let self: ShoppingItemDetail = null;
class ShoppingItemDetail extends Component {

  static navigationOptions = ({ navigation }) => {

    return {
      headerRight: <View style={{flexDirection: 'row'}}>
        <Icon name='pin-drop' type='material' containerStyle={{paddingHorizontal: 3}} size={32} underlayColor='transparent' onPress={() => {
          self.ActionSheet.show();
        }}/>
        <Icon name='done' type='material' containerStyle={{paddingHorizontal: 3, marginRight: 7}} size={32} underlayColor='transparent' onPress={async () => {
          await self.save();
          self.props.navigation.goBack();
        }}/>
      </View>,
      headerTitleStyle: { 
        textAlign:"center", 
        flex:1 
      },
      title: 'Edit Item',
    }
  };

  constructor(props) {
    super(props);
    const shoppingItem: ShoppingItem = this.props.navigation.getParam('shoppingItem');
    this.state = {
      searchWords: shoppingItem.searchWords || '',
      tags: (shoppingItem.tags || []).join(' '),
      description: shoppingItem.description || '',
      quantity: `${shoppingItem.quantity || 0}`,
      price: `${shoppingItem.price || 0}`,
      isOnline: shoppingItem.isOnline,
      isSharingOn: shoppingItem.isSharingOn,
      currency: this.props.navigation.getParam('currency'),
      image: shoppingItem.image,
      imageGeolocation: shoppingItem.imageGeolocation,
      location: shoppingItem.location
    }
    self = this;
  }

  async save() {
    const shoppingItem: ShoppingItem = this.props.navigation.getParam('shoppingItem');
    shoppingItem.searchWords = this.state.searchWords;
    if (this.state.tags) {
      shoppingItem.tags = this.state.tags.split(' ');
    } else {
      shoppingItem.tags = [];
    }
    shoppingItem.description = this.state.description;
    shoppingItem.quantity = parseInt(this.state.quantity);
    shoppingItem.price = parseFloat(this.state.price);
    shoppingItem.isOnline = this.state.isOnline;
    shoppingItem.isSharingOn = this.state.isSharingOn;
    shoppingItem.image = this.state.image;
    shoppingItem.imageGeolocation = this.state.imageGeolocation;
    shoppingItem.location = this.state.location;
    await shoppingItem.save();
  }

  updateLocation() {
    const updateLocation = async () => {
      navigator.geolocation.getCurrentPosition(position => {
        getLocationAddressFull(position.coords).then(location => {
          this.setState({
            imageGeolocation: position.coords,
            location
          });
        }).catch(error => {
          this.setState({
            imageGeolocation: position.coords,
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
      imageGeolocation: null,
      location: null
    });
  }
  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(this.state.imageGeolocation) !== JSON.stringify(prevState.imageGeolocation)) {
      this.save().then(() => {
        Alert.alert(this.state.imageGeolocation ? 'Location was updated.' : 'Location was cleared.');
      });
    }
  }
  
  render() {
    const shoppingItem: ShoppingItem = this.props.navigation.getParam('shoppingItem');
    const image = this.state.image
      ? <CachedImage source={{uri: this.state.image}} style={styles.imageStyle} resizeMode='contain' />
      : <Image source={require('../assets/images/shopping.png')} style={styles.imageStyle} resizeMode='contain' />;

    return (
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
                  Alert.alert('Clipboard is empty');
                } else if (isValidURL(image)) {
                  this.setState({ image });
                } else {
                  Alert.alert('Clipboard is not URL format');
                }
              }).catch(error => {
                Alert.alert('Clipboard is empty');
              })
            }
          }}
        />
        <ScrollView style={{flex: 1}} contentContainerStyle={{minHeight: '100%'}}>
          <View style={styles.editContainer}>
            <TextField label='Name' value={this.state.searchWords} autoCapitalize='none' containerStyle={styles.textFields} onChangeText={(searchWords) => this.setState({searchWords})}/>
            <TextField label='Tags' autoCapitalize='none' value={this.state.tags} containerStyle={styles.textFields} onChangeText={(tags) => this.setState({tags: tags.toLowerCase()})} labelHeight={15}/>
            <TextField label='Description' value={this.state.description} containerStyle={styles.textFields} onChangeText={(description) => this.setState({description})} labelHeight={15}/>
            <TextField label='Quantity' labelHeight={15} value={this.state.quantity} containerStyle={styles.textFields} onChangeText={(quantity) => this.setState({quantity})} keyboardType='numeric' defaultValue='0'/>
            <TextField label='Price' labelHeight={15} prefix={this.state.currency} value={this.state.price} containerStyle={styles.textFields} onChangeText={(price) => this.setState({price})} keyboardType='numeric' defaultValue='0'/>
            <View style={{flexDirection: 'row', paddingTop: 20,}}>
              <View>
                <TouchableHighlight underlayColor={'transparent'} style={{alignSelf: 'center', flex: 1}} onPress={() => {
                  this.LinkActionSheet.show();
                }}>
                  {image}
                </TouchableHighlight>
                <Icon name='search' type='material' containerStyle={{paddingTop: 5}} size={26} underlayColor='transparent' onPress={() => {
                  NavigationService.navigate('SearchShoppingItems', {tags: shoppingItem.tags});
                }}/>
              </View>
              <View style={{flex: 1}}>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Online</Text>
                  <Switch value={this.state.isOnline} width={60} height={30} onSyncPress={isOnline => {
                    this.setState({isOnline});
                    if (!isOnline && this.state.isSharingOn) {
                      this.setState({isSharingOn: false});
                    }
                  }}
                  />
                </View>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Sharing</Text>
                  <Switch value={this.state.isSharingOn} width={60} height={30} onSyncPress={isSharingOn => {
                    this.setState({isSharingOn});
                    if (isSharingOn && !this.state.isOnline) {
                      this.setState({isOnline: true});
                    }
                  }}/>
                </View>
                <Icon name='search' type='material' color='transparent' containerStyle={{paddingTop: 5}} size={26}/>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.background,
    flex: 1,
  },
  textFields: {
    paddingBottom: 10,
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
  switchContainer: {
    flex: 1,
    paddingLeft: 20,
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
});

export default ShoppingItemDetail;