import React, { Component } from 'react';
import { View, StyleSheet, Alert, Platform, PermissionsAndroid } from 'react-native';
import { createStackNavigator, createBottomTabNavigator,} from 'react-navigation';
import PersonScreen from './/PersonScreen';
import UsersScreen from './UsersScreen';
import { Icon, Badge } from 'react-native-elements'
import { connect } from 'react-redux';
import { Theme } from '../config/constants';
import ChatListScreen from './ChatListScreen';
import ChatScreen from './ChatScreen';
import { NavigationService, getLocationAddress } from '../utils';
import Subscriptions from './Subscriptions';
import { ECColors } from '../config/themes/ECColors';
import { ChatTabIcon, LoadingIndicator} from '../components';
import ShoppingHomeScreen from './ShoppingHomeScreen';
import WishListScreen from './WishListScreen';
import SellingListScreen from './SellingListScreen';
import ShoppingListEditScreen from './ShoppingListEditScreen';
import MapScreen from './MapScreen';
import HandshakeUsersScreen from './HandshakesScreen';
import FollowingsScreen from './FollowingsScreen';
import ShoppingItemDetail from './ShoppingItemDetail';
import WishSellingListDetail from './WishSellingListDetail';
import { saveLocation } from '../actions';
import { User } from '../models';
import { Parse } from 'parse/react-native';
import SearchShoppingItems from './SearchShoppingItems';
import SearchWishSellingList from './SearchWishSellingList';

const navigatorOptions = {
  navigationOptions: {
    headerStyle: {
      backgroundColor: Theme.colors.navigation
    }
  },
  swipeEnabled: true,
  lazy: true
}

class MainScreen extends Component {

  runningLocationService = false;
  componentDidMount() {
    if (Platform.OS === 'android') {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(granted => {
        if (granted) {
          this.initLocation();
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(granted => {
            this.initLocation();
          }).catch(error => {
            Alert.alert('Can not get location.');
          })
        }
      });
    } else {
      this.initLocation();
    }
    this.updateStatus();
  }

  async updateStatus() {
    const myStatus = await User.getMyStatus();
    this.intervalID = setInterval(async () => {
      try {
        myStatus.set('online', true);
        myStatus.save();
        const currentUser: User = await User.currentUser();
        if (!currentUser) return;
        if (this.runningLocationService && !currentUser.shareLocation) {
          if (this.watchID) {
            navigator.geolocation.clearWatch(this.watchID);
          }
          this.watchID = null;
          this.runningLocationService = false;
        } else if (!this.runningLocationService && currentUser.shareLocation) {
          this.initLocation();
        }
      } catch (error) {
      }
    }, 1000);
  }

  intervalID = null;
  watchID = null;
  async initLocation() {

    const currentUser: User = await User.currentUser();
    if (!currentUser) return;

    this.runningLocationService = true;
    navigator.geolocation.getCurrentPosition(position => {
      this.saveLocation(position.coords);
    }, (error) => {
      Alert.alert(error.message);
    }, {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 10000
    });

    if (!currentUser.shareLocation) return;
    this.watchID = navigator.geolocation.watchPosition((position: Position) => {
      this.saveLocation(position.coords);
    }, (error) => {
      Alert.alert(error.message);
    }, {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 10000
    });
  }
  async saveLocation(coords) {
    let currentUser: User = null;
    try {
      this.props.saveLocation(coords);
      currentUser = await User.currentUser();
      if (!currentUser || !currentUser.shareLocation) return;
      const address = await getLocationAddress(coords);
      currentUser.geolocation = coords;
      currentUser.location = address;
    } catch (error) {
      currentUser = await User.currentUser();
      if (!currentUser) return;
      currentUser.geolocation = coords;
    } finally {
      currentUser.prepareParseObject();
      currentUser.save();
    }
  }
  componentWillUnmount() {
    if (this.watchID) {
      navigator.geolocation.clearWatch(this.watchID);
    }
    if (this.intervalID) {
      navigator.geolocation.clearWatch(this.intervalID);
    }
  }

  render() {
    const MainNavigator = createBottomTabNavigator({
      Users: {
        screen: createStackNavigator({
          UserList: UsersScreen,
          Person: PersonScreen
        }, navigatorOptions)
      },
      Shopping: { 
        screen: createStackNavigator({
          ShoppingHome: ShoppingHomeScreen,
          EditShoppingList: ShoppingListEditScreen,
          ShoppingItemDetail: ShoppingItemDetail,
          WishList: WishListScreen,
          SellingList: SellingListScreen,
          WishSellingListDetail: WishSellingListDetail,
          SearchShoppingItems: SearchShoppingItems,
          SearchWishSellingList: SearchWishSellingList,
          ViewOnMap: MapScreen,
        }, navigatorOptions)
      },
      Maps: {
        screen: createStackNavigator({
          Map: MapScreen,
          HandshakeUsers: HandshakeUsersScreen,
        }, navigatorOptions)
      },
      Chats: { 
        screen: createStackNavigator({
          ChatList: ChatListScreen,
          Chatroom: ChatScreen,
          UserSearch: UsersScreen,
        }, navigatorOptions)
      },
      Profile: { 
        screen: createStackNavigator({
          ProfileHome: PersonScreen,
          Followings: FollowingsScreen,
          FollowPerson: PersonScreen,
          HandshakeUser: PersonScreen,
        }, navigatorOptions)
      },
    },
    {
      navigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused, tintColor }) => {
          const iconsMap = {
            Chats: 'comments',
            Users: 'user',
            Maps: 'map',
            Profile: 'cog',
            Shopping: 'shopping-cart',
          };
          if (navigation.state.routeName === 'Chats') {
            return (<ChatTabIcon iconName={iconsMap[navigation.state.routeName]} iconType="font-awesome" iconColor={tintColor} valueKey={'unread_messages'}/>)
          } else {
            return <Icon name={iconsMap[navigation.state.routeName]} size={25} type="font-awesome" color={tintColor} />;
          }
        },
      }),
      tabBarOptions: {
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
        style: {
          backgroundColor: Theme.colors.navigation
        },
      },
    })

    return (
      <View style={styles.container}>
        <MainNavigator ref={navigatorRef => { NavigationService.setContainer(navigatorRef); }} />
        <Subscriptions />
        <LoadingIndicator />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
  },
});

export default connect(null, {
  saveLocation
})(MainScreen);
