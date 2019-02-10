import React, { Component } from 'react';
import MapView, {EventUserLocation, Region, LatLng, Marker} from 'react-native-maps';
import { View, TextInput, StyleSheet, Text, TouchableHighlight, Platform, PermissionsAndroid, Alert, ScrollView, Image } from 'react-native';
import { User, MapInfo, Handshake } from '../models';
import { Icon } from 'react-native-elements';
import { Magnetometer } from "react-native-sensors";
import ActionSheet from 'react-native-actionsheet';
import { sleep, NavigationService } from '../utils';
import MapViewDirections from 'react-native-maps-directions';
import { CachedImage } from 'react-native-img-cache';
import { connect } from 'react-redux';

const initDelta = 0.1;

class MapScreen extends Component {

  static navigationOptions = ({ navigation }) => {
    const user = User.currentUser()
    return {
      // headerLeft: <Icon name='exit-to-app' type="material" containerStyle={{padding: 10}} color='transparent'/>,
      headerRight: <Icon name='contacts' rotation={90} type="material" containerStyle={{padding: 10}} underlayColor='transparent' onPress={() => {
        NavigationService.navigate('HandshakeUsers');
      }}/>,
      headerTitleStyle: { 
        textAlign:"center", 
        flex:1 
      },
      title: 'Map View',
    };
  };

  homeLocationObj: MapInfo = null;
  parkLocationObj: MapInfo = null;

  directCmp = null;
  componentDidMount() {
    this.updateLocations();
    const handshakeUsers = Handshake.getMyAcceptedHandshakes().then(users => {
      this.setState({handshakeUsers: users});
    })
  }
  async updateLocations() {
    this.homeLocationObj = await MapInfo.getHomeLocation();
    this.parkLocationObj = await MapInfo.getParkLocation();
  }
  constructor(props) {
    super(props);
    this.state = {
      isSatellite: false,
      track: false,
      actionSheetItems: ['Cancel'],
      handshakeUsers: [],
    }
  }

  map: MapView = null;
  actionSheet: ActionSheet = null;
  regionChanging: boolean;
  currentLocation: Coordinates = null;
  actionSheetActions: [];

  componentWillUpdate = (nextProps, nextState) => {
    if (nextProps.currentLocation && this.state.track && !this.regionChanging && this.map) {
      this.map.animateToCoordinate(nextProps.currentLocation, 200);
    }
  };
  
  render() {
    if (this.props.currentLocation) {
      this.currentLocation = this.props.currentLocation;
    }
    let targetLocation = this.props.navigation ? this.props.navigation.getParam('target') : null;
    const handshakeUsers = this.state.handshakeUsers.map((item: User, index) => {
      let photo = <Image source={require('../assets/images/avatar.png')} style={styles.avatar}/>
      if (item.photo) photo = <CachedImage source={{
        uri: item.photo
      }} style={styles.avatar}/>;
  
      return <TouchableHighlight key={index} underlayColor='transparent' onPress={async () => {
        if (item.geolocation) {
          this.setState({track: false, carLocation: item.geolocation, carTitle: item.username});
          this.map.animateToCoordinate(item.geolocation, 200);
        } else {
          Alert.alert('ERROR', `Can not get the user's location.`);
        }
      }}>
        <View style={{alignItems: 'center', justifyContent: 'center', padding: 5}}>
          {photo}
          <Text>{item.username}</Text>
        </View>
      </TouchableHighlight>
    });
    return (
      <View style={styles.container}>
        {
          (targetLocation || this.currentLocation)
          ? <MapView
            initialRegion={{
              ...(targetLocation || this.currentLocation),
              latitudeDelta: initDelta,
              longitudeDelta: initDelta,
            }}
            ref={ref => {this.map = ref}}
            mapType={this.state.isSatellite ? 'satellite' : 'standard'}
            provider='google'
            toolbarEnabled={false}
            style={styles.map}
            showsUserLocation={false}
            showsCompass={false}
            onRegionChange={() => {
              this.regionChanging = true;
            }}
            onRegionChangeComplete={(region) => {
              this.regionChanging = false;
              if (this.state.track && this.props.currentLocation) {
                this.map.animateToCoordinate(this.currentLocation, 200);
              }
            }}
          >
            { this.directCmp }
            {
              this.state.track ? <Marker 
                coordinate={this.props.currentLocation} 
                image={require('../assets/images/marker.png')}
              /> : null
            }
            {
              this.state.carLocation ? <Marker 
                coordinate={this.state.carLocation} 
                image={require('../assets/images/marker.png')}
                title={this.state.carTitle}
              /> : null
            }
            {
              targetLocation ? <Marker 
                coordinate={targetLocation} 
                image={require('../assets/images/target.png')}
                title={this.state.carTitle}
              /> : null
            }
          </MapView> : <View/>
        }
        <View style={{flexDirection: 'row'}}>
          <ScrollView style={{flex: 1}} contentContainerStyle={{flexDirection: 'row'}} directionalLockEnabled={true} horizontal={true}>
            {handshakeUsers}
          </ScrollView>
          <View style={{width: 60}}></View>
        </View>
        <View style={styles.topButtons}>
          <View style={[styles.roundSmallButtons, { backgroundColor: '#129eb7' }]}>
            <Icon name='home' type='font-awesome' size={26} color='white' underlayColor='transparent' onPress={async () => {
              this.setState({actionSheetItems: ['Save Home Location', 'Where is my Home?', 'Cancel']});
              this.actionSheetActions = [() => {
                this.homeLocationObj.geolocation = this.currentLocation;
                this.homeLocationObj.prepareParseObject();
                this.homeLocationObj.save().then(() => {
                  Alert.alert('Saved home location', 'Your home location was updated successfully.');
                });
              }, () => {
                if (this.homeLocationObj.geolocation) {
                  this.setState({track: false, carLocation: this.homeLocationObj.geolocation, carTitle: 'My Home'});
                  this.map.animateToCoordinate(this.homeLocationObj.geolocation, 200);
                } else {
                  Alert.alert('ERROR', 'Can not get your home location.');
                }
              }]
              await sleep(50);
              this.actionSheet.show();
            }}/>
          </View>
          <View style={[styles.roundSmallButtons, { backgroundColor: '#129eb7' }]}>
            <Icon name='car' type='font-awesome' size={20} color='white' underlayColor='transparent' onPress={async () => {
              this.setState({actionSheetItems: ['Where is my car?', 'Park', 'Cancel']});
              this.actionSheetActions = [() => {
                if (this.parkLocationObj.geolocation) {
                  this.setState({track: false, carLocation: this.parkLocationObj.geolocation, carTitle: 'My Car'});
                  this.map.animateToCoordinate(this.parkLocationObj.geolocation, 200);
                } else {
                  Alert.alert('ERROR', 'Can not get your park location.');
                }
              }, () => {
                this.parkLocationObj.geolocation = this.currentLocation;
                this.parkLocationObj.prepareParseObject();
                this.parkLocationObj.save().then(() => {
                  Alert.alert('Saved park location', 'Your park location was updated successfully.');
                });
              }]
              await sleep(50);
              this.actionSheet.show();
            }}/>
          </View>
        </View>
        <View style={styles.bottomButtons}>
          <View style={[styles.roundButtons, { backgroundColor: 'transparent' }]}>
            <Icon name='map-pin' type='font-awesome' size={32} color='transparent' underlayColor='transparent' onPress={async () => {
              // this.setState({actionSheetItems: ['Near me', 'Cancel']});
              // await sleep(50);
              // this.actionSheet.show();
            }}/>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
            <TouchableHighlight style={[styles.roundButtons, { backgroundColor: '#129eb7' }]}>
              <Icon name='map' type='font-awesome' size={32} color='white' underlayColor='transparent' onPress={() => {
                this.setState({isSatellite: !this.state.isSatellite});
              }}/>
            </TouchableHighlight>
          </View>
          <View style={[styles.roundButtons, { backgroundColor: '#fdfdfd' }]}>
            <Icon name={this.state.track ? 'my-location' :'location-off'} type='material' size={32} color='#129ef7' underlayColor='transparent' onPress={async () => {
              if (!this.state.track) {
                this.map.animateToCoordinate(this.currentLocation, 100);
              }
              if (!this.state.track && Platform.OS === 'android') {
                const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                if (granted) {
                  this.setState({track: !this.state.track});
                } else {
                  await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                  return;
                }
              } else {
                this.setState({track: !this.state.track});
              }
            }}/>
          </View>
        </View>
        <ActionSheet
          ref={actionSheet => this.actionSheet = actionSheet}
          options={this.state.actionSheetItems}
          cancelButtonIndex={this.state.actionSheetItems.length - 1}
          onPress={(index) => { 
            if (this.actionSheetActions && this.actionSheetActions.length > index) {
              this.actionSheetActions[index].bind(this)();
            }
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    position: 'absolute',
    left:0, right: 0, top: 0, bottom: 0
  },
  bottomButtons: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  topButtons: {
    position: 'absolute',
    right: 0, top: 0,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  roundSmallButtons: {
    borderRadius: 20,
    width: 40, height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  roundButtons: {
    borderRadius: 25,
    width: 50, height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'gray',
  },
});

const mapStateToProps = ({ common }) => {
  const { currentLocation } = common;
  return { currentLocation };
};

export default connect(mapStateToProps, null)(MapScreen);
