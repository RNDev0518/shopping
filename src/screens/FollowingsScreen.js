import React, { Component } from 'react'
import { StyleSheet, View, Text, ListView, Image, TouchableHighlight, Platform, KeyboardAvoidingView, RefreshControl } from 'react-native';
import { SearchBar, Icon } from 'react-native-elements';
import { UIConstants, Theme, languageMap } from '../config/constants';
import { NavigationService } from '../utils';
import { User, GeoPoint, Follow } from '../models';
import { CachedImage } from "react-native-img-cache";
import moment from 'moment';
import { connect } from 'react-redux';
import lodash from 'lodash';
import { NavigationEvents } from 'react-navigation';

function toRad(Value) 
{
    return Value * Math.PI / 180;
}
function calcCrow(lat1, lon1, lat2, lon2) 
{
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

const getMatchedTags = (user1: User, user2: User) => {
  try {
    const tags1 = user1.private_hashtags, tags2 = user2.private_hashtags;
    return lodash.intersection(tags1, tags2);
  } catch (error) {
    return [];
  }
}

class FollowingsScreen extends Component {

  static navigationOptions = ({ navigation }) => {
    return {
      headerRight: <Icon name='done' type="material" color='transparent' containerStyle={{padding: 10}}/>,
      headerTitleStyle: { 
        textAlign:"center", 
        flex:1 
      },
      title: 'Following Users',
    };
  };

  intervalID = false;
  currentUser = null;
  state = {
    userList: [],
    onlineUsers: [],
    refreshing: false,
  };

  constructor(props) {
    super(props);
    this.listViewDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => JSON.stringify(r1) !== JSON.stringify(r2)});
    this.onSelect = this.props.navigation.getParam('onSelect', null);
  }

  async refreshUserData() {
    this.setState({refreshing: true});
    this.currentUser = await User.currentUser();
    const users = await Follow.getFollowing();
    const onlineUsers = await User.getOnlineUsers();
    this.setState({
      onlineUsers,
      userList: users,
      refreshing: false
    });
  }

  componentDidMount() {
    this.refreshUserData().then(() => {
      this.mounted = true;
    })
  }

  listItemRender(user: User) {
    const tags = getMatchedTags(this.currentUser, user);
    const location: GeoPoint = user.geolocation;
    let distance = '';
    if (this.currentUser.geolocation && location) {
      distance = calcCrow(location.latitude, location.longitude, 
        this.currentUser.geolocation.latitude, this.currentUser.geolocation.longitude);
      if (distance > 1) {
        distance = (Math.round(distance * 10) / 10) + 'km';
      } else {
        distance = Math.round(distance * 1000) + 'm';
      }
    }
    return (
      <TouchableHighlight underlayColor={Theme.colors.highlight} onPress={() => {
        NavigationService.navigate('FollowPerson', {user: user});
      }}>
        <View style={styles.rowView}>
          {
            user.photo 
            ? 
              <View style={styles.avatarContainer}>
                <CachedImage source={ { uri: user.photo } } style={styles.userAvatar} />
                <View style={styles.userStatus}>
                  <Image source={this.state.onlineUsers.indexOf(user.id) > -1 ? require('../assets/images/online.png'): require('../assets/images/offline.png')}/>
                </View>
              </View>
            : <View style={styles.avatarContainer}>
                <Image source={require('../assets/images/avatar.png')} style={styles.userAvatar} />
                <View style={styles.userStatus}>
                  <Image source={this.state.onlineUsers.indexOf(user.id) > -1 ? require('../assets/images/online.png'): require('../assets/images/offline.png')}/>
                </View>
              </View>
          }
          <View style={{flex: 1}}>
            <View style={[styles.descriptionRow, {marginVertical: 5}]}>
              <Text style={styles.userName}>@{user.username}</Text>
              <Text style={styles.timestamp}>
                {moment(user.updatedAt).format('DD/MM/YYYY')}
              </Text>
            </View>
            <View style={[styles.descriptionRow, {marginVertical: 5}]}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={styles.lang1}>{languageMap[user.lang1]}</Text>
                <Text style={styles.lang2}>{languageMap[user.lang2]}</Text>
                <Text style={styles.lang3}>{languageMap[user.lang3]}</Text>
              </View>
              { user.geolocation ? <Text style={{color: 'blue'}}>{distance}</Text> : null }
              { tags.length > 0 ? <View style={styles.tags}><Text style={{color: 'white'}}>{`${tags.length}`}</Text></View> : null }
            </View>
            {
              user.public_hashtags ? <View style={styles.descriptionRow}>
                {
                  user.public_hashtags.map((item, index) => (
                    <TouchableHighlight underlayColor='transparent' key={index} onPress={() => {}}>
                      <Text style={styles.hashtags}>{item}</Text>
                    </TouchableHighlight>))
                }
              </View> : null
            }
            {
              user.bio ? <View style={styles.descriptionRow}>
                <Text style={styles.location}>{user.bio}</Text>
              </View> : null
            }
            {
              user.location ? <View style={styles.descriptionRow}>
                <Text style={styles.location}>{user.location}</Text>
              </View> : null
            }
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  componentWillUpdate = (nextProps, nextState) => {
    if (this.props.onlineUser !== nextProps.onlineUser && nextProps.onlineUser) {
      if (this.state.onlineUsers.indexOf(nextProps.onlineUser) < 0) {
        const onlineUsers = [].concat(this.state.onlineUsers);
        onlineUsers.push(nextProps.onlineUser);
        this.setState({ onlineUsers });
      }
    }
    if (this.props.offlineUser !== nextProps.offlineUser && nextProps.offlineUser) {
      const position = this.state.onlineUsers.indexOf(nextProps.offlineUser);
      if (position > -1) {
        const onlineUsers = [].concat(this.state.onlineUsers);
        onlineUsers.splice(position, 1);
        this.setState({ onlineUsers });
      }
    }
  };

  render() {
    const userList = this.listViewDataSource.cloneWithRows(this.state.userList);

    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null} enabled>
        <NavigationEvents
          onWillFocus={() => {
            if (this.mounted) {
              this.refreshUserData();
            }
          }}
        />
        <ListView
          style={styles.container}
          dataSource={userList}
          renderRow={this.listItemRender.bind(this)}
          enableEmptySections={true}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.refreshUserData.bind(this)}
              enabled={true}
              colors={[Theme.colors.successDark]}
              tintColor={Theme.colors.successDark}
              />}
        />
        
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  rowView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    position: 'relative'
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 10,
  },
  userStatus: {
    position: 'absolute',
    right: 10, bottom: 5,
  },
  descriptionRow: {
    flexDirection: 'row',
    paddingRight: 5,
  },
  userName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '900'
  },
  timestamp: {
    fontSize: 14,
    fontWeight: '900'
  },
  lang1: {
    borderRadius: 3,
    marginRight: 5,
    paddingHorizontal: 5,
    overflow: 'hidden',
    backgroundColor: '#66dd66',
  },
  lang2: {
    borderRadius: 3,
    marginRight: 5,
    paddingHorizontal:5,
    overflow: 'hidden',
    backgroundColor: '#ffaa66',
  },
  lang3: {
    borderRadius: 3,
    paddingHorizontal: 5,
    overflow: 'hidden',
    backgroundColor: '#ff6666',
  },
  tags: {
    backgroundColor: '#0077ff',
    marginLeft: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  location: {
    flex: 1,
    paddingHorizontal:5,
    marginRight: 10,
  },
  hashtags: {
    color: 'blue',
    marginRight: 5,
  }
});

const mapStateToProps = ({ common }) => {
  const { onlineUser, offlineUser } = common;
  return { onlineUser, offlineUser };
};

export default connect(mapStateToProps, null)(FollowingsScreen);
