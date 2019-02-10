import React, { Component } from 'react';
import { View, Modal, StyleSheet, Alert, TextInput, TouchableHighlight, ListView, ListViewDataSource, RefreshControl, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { Theme } from '../config/themes';
import { Icon, SearchBar } from 'react-native-elements';
import { RealmService } from '../utils/RealmService';
import { WishSellingListCell } from '../components';
import { sleep, NavigationService } from '../utils';
import Picker from 'react-native-picker';
import {currencies} from '../config/constants';
import { WishList } from '../models';

let self: WishListScreen = null;
class WishListScreen extends Component {

  static navigationOptions = ({ navigation }) => {

    return {
      headerRight: <Icon name='add' type="material" containerStyle={{padding: 10}} underlayColor='transparent' onPress={() => {self.createNewItem()}}/>,
      headerTitleStyle: { 
        textAlign:"center", 
        flex: 1 
      },
      title: 'Wish List',
    }
  };

  listViewDataSource: ListViewDataSource = null;

  constructor(props) {
    super(props);
    this.listViewDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => JSON.stringify(r1) !== JSON.stringify(r2)});
    self = this;
    this.state = {
      wishLists: [],
      refreshing: false,
      name: '',
      selectedList: null,
    }
  }

  async createNewItem() {
    const newWishList = await WishList.create();
    NavigationService.navigate('WishSellingListDetail', {
      shoppingList: newWishList,
      reload: this.reloadWishLists.bind(this),
      type: 'WishList'
    });
  }

  async onDelete(wishList: WishList) {
    const wishLists = [].concat(this.state.wishLists);
    for (var i = 0;i< wishLists.length; i++) {
      if (wishLists[i].id === wishList.id || wishLists[i].id.realm_id === wishList.realm_id) {
        wishLists.splice(i, 1);
        break;
      }
    }
    await wishList.delete();
    this.setState({
      selectedList: null,
      wishLists,
    })
  }
  async reloadWishLists(withRefresh) {
    if (withRefresh) {
      this.setState({refreshing: true});
    }
    const serverItems = await WishList.getAll();
    const realmItems = await RealmService.readWishLists();

    const wishLists = serverItems.concat(realmItems);
    this.setState({wishLists, refreshing: false});
  }
  componentDidMount() {
    this.reloadWishLists(true);
  }
  refresh() {
    const wishLists = [].concat(this.state.wishLists);
    this.setState({wishLists});
  }

  listItemRender(wishList: WishList, group, index) {
    return (
      <TouchableHighlight style={{marginVertical: 5, marginHorizontal: 10}} underlayColor={Theme.colors.highlight} onPress={() => {
        NavigationService.navigate('WishSellingListDetail', {
          shoppingList: wishList,
          reload: this.reloadWishLists.bind(this),
          type: 'WishList'
        });
      }}>
        <WishSellingListCell shoppingList={wishList} refresh={() => this.refresh()} onDelete={async () => {
          await wishList.delete();
          let wishLists = [].concat(this.state.wishLists);
          wishLists.splice(index, 1);
          this.setState({wishLists});
        }}/>
      </TouchableHighlight>);
  }
  render() {
    const wishLists = this.listViewDataSource.cloneWithRows(this.state.wishLists);
    let count = 0, total = 0;
    for (var item of this.state.wishLists) {
      if (item.price > 0) {
        count += item.quantity;
        total += item.price * item.quantity;
      }
    }
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null} enabled>
        <SearchBar
          clearIcon={{ color: 'red' }}
          searchIcon={<Icon name='search' />}
          onChangeText={(searchText) => {this.setState({searchText})}}
          onClear={(value) => {}}
          placeholder='Search...'
          platform={Platform.OS}
          lightTheme={true}
          />
        <ListView
          style={styles.listContainer}
          dataSource={wishLists}
          renderRow={this.listItemRender.bind(this)}
          enableEmptySections={true}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => {
                this.reloadWishLists(true);
              }}
              enabled={true}
              colors={[Theme.colors.successDark]}
              tintColor={Theme.colors.successDark}
              />
          }
        />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.highlight
  },
  listContainer: {
    flex: 1,
    paddingVertical: 5,
  },
  textContainer: {
    backgroundColor: Theme.colors.background,
    flexDirection: 'row',
    shadowOffset:{width: 1, height: 1},
    elevation: 3,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    padding: 20
  },
  textStyle: {
    borderBottomColor: Theme.colors.primary,
    borderBottomWidth: 1,
    padding: 5,
    flex: 1,
  },
});

export default WishListScreen;