import React, { Component } from 'react'
import { StyleSheet, View, Text, ListView, Image, TouchableHighlight, Platform, KeyboardAvoidingView, RefreshControl } from 'react-native';
import { SearchBar, Icon } from 'react-native-elements';
import { UIConstants, Theme } from '../config/constants';
import { NavigationService } from '../utils';
import { User, Handshake } from '../models';
import { CachedImage } from "react-native-img-cache";
import SegmentedControlTab from 'react-native-segmented-control-tab'

export default class HandshakeUsersScreen extends Component {

  static navigationOptions = ({ navigation }) => {
    return {
      headerRight: <Icon name='done' type="material" color='transparent' containerStyle={{padding: 10}}/>,
      headerTitleStyle: { 
        textAlign:"center", 
        flex:1 
      },
      title: 'Handshakes',
    };
  };

  intervalID = false;

  state = {
    userList: [],
    refreshing: false,
    segmentIndex: 0,
    searchText: '',
  };

  constructor(props) {
    super(props);
    this.listViewDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => JSON.stringify(r1) !== JSON.stringify(r2)});
    this.onSelect = this.props.navigation.getParam('onSelect', null);
  }

  async refreshUserData(segmentIndex, withoutRefreshControl) {
    if (!withoutRefreshControl) {
      this.setState({refreshing: true});
    }
    let userList = [];
    if (segmentIndex === 0) {
      userList = await Handshake.getMyAcceptedHandshakes();
    } else if (segmentIndex === 1) {
      userList = await Handshake.getMyRequests();
    } else {
      userList = await Handshake.getHandshakeRequests();
    }
    this.setState({
      userList,
      refreshing: false
    });
  }

  componentDidMount() {
    this.refreshUserData(0);
  }

  listItemRender(user: User) {
    return (
      <View style={styles.rowView}>
        <TouchableHighlight underlayColor='transparent' onPress={() => {
          NavigationService.navigate('HandshakeUser', {user: user});
        }}>
          {
            user.photo 
            ? <CachedImage source={ { uri: user.photo } } style={styles.userAvatar} />
            : <Image source={require('../assets/images/avatar.png')} style={styles.userAvatar} />
          }
        </TouchableHighlight>
        <Text style={styles.userName}>
          {
            (user.username)
            ? `${user.username}`
            : `Unknown`
          }
        </Text>
        <View style={{paddingHorizontal: 10}}>
          <TouchableHighlight underlayColor='transparent' onPress={async () => {
            await Handshake.acceptHandshake(user.id);
            this.refreshUserData(this.state.segmentIndex, true);
          }}>
            <Text style={{color: 'green', paddingBottom: 15}}>Accept</Text>
          </TouchableHighlight>
          <TouchableHighlight underlayColor='transparent' onPress={async () => {
            await Handshake.declineHandshake(user.id);
            this.refreshUserData(this.state.segmentIndex, true);
          }}>
            <Text style={{color: 'red'}}>Decline</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }

  render() {
    const userList = this.listViewDataSource.cloneWithRows(this.state.userList.filter(item => {
      return item.username.toLowerCase().indexOf(this.state.searchText.toLowerCase()) > -1;
    }));

    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null} enabled>
        <SearchBar
          clearIcon={{ color: 'red' }}
          searchIcon={<Icon name='search' />}
          autoCapitalize='none'
          onChangeText={(searchText) => {this.setState({searchText})}}
          value={this.state.searchText}
          onClear={(value) => {}}
          placeholder='Search...'
          platform={'android'}
          lightTheme={true}
          />
        <SegmentedControlTab
          values={['user <-> me', 'me -> user', 'user -> me']}
          selectedIndex={this.state.segmentIndex}
          tabTextStyle={{color: UIConstants.SegmentColor}}
          tabsContainerStyle={{height: 35}}
          tabStyle={{borderColor: UIConstants.SegmentColor}}
          activeTabStyle={{backgroundColor: UIConstants.SegmentColor, borderColor: UIConstants.SegmentColor}}
          onTabPress={(index) => {
            this.setState({segmentIndex: index});
            this.refreshUserData(index, false);
          }}
          borderRadius={5}
        />
        <ListView
          style={styles.container}
          dataSource={userList}
          renderRow={this.listItemRender.bind(this)}
          enableEmptySections={true}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this.refreshUserData(this.state.segmentIndex)}
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
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 10,
    marginRight: 20,
  },
  userName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900'
  }
});
