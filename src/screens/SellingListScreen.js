import React, { Component } from 'react';
import { View, Modal, StyleSheet, Alert, TextInput, TouchableHighlight, ListView, ListViewDataSource, RefreshControl, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { Theme } from '../config/themes';
import { Icon, SearchBar } from 'react-native-elements';
import { RealmService } from '../utils/RealmService';
import { WishSellingListCell } from '../components';
import { sleep, NavigationService } from '../utils';
import Picker from 'react-native-picker';
import {currencies} from '../config/constants';
import { SellingList } from '../models';

let self: SellingListScreen = null;

class SellingListScreen extends Component {

  static navigationOptions = {
    headerRight: <Icon name='add' type="material" underlayColor='transparent' size={32} onPress={() => {self.createNewItem()}}/>,
    headerTitleStyle: { 
      textAlign:"center", 
      flex:1 
    },
    title: 'Selling List',
  }

  listViewDataSource: ListViewDataSource = null;

  constructor(props) {
    super(props);
    this.listViewDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => JSON.stringify(r1) !== JSON.stringify(r2)});
    self = this;
    this.state = {
      sellingLists: [],
      refreshing: false,
      name: '',
      selectedList: null,
    }
  }

  async createNewItem() {
    const newSellingList = await SellingList.create();
    NavigationService.navigate('WishSellingListDetail', {
      shoppingList: newSellingList,
      reload: this.reloadSellingLists.bind(this),
      type: 'SellingList'
    });
  }
  async onDelete(sellingList: SellingList) {
    const sellingLists = [].concat(this.state.sellingLists);
    for (var i = 0;i< sellingLists.length; i++) {
      if (sellingLists[i].id === sellingList.id || sellingLists[i].id.realm_id === sellingList.realm_id) {
        sellingLists.splice(i, 1);
        break;
      }
    }
    await sellingList.delete();
    this.setState({
      selectedList: null,
      sellingLists,
    })
  }
  async reloadSellingLists(withRefresh) {
    if (withRefresh) {
      this.setState({refreshing: true});
    }
    const serverItems = await SellingList.getAll();
    const realmItems = await RealmService.readSellingLists();

    const sellingLists = serverItems.concat(realmItems);
    this.setState({sellingLists, refreshing: false});
  }
  componentDidMount() {
    this.reloadSellingLists();
  }
  refresh() {
    const sellingLists = [].concat(this.state.sellingLists);
    this.setState({sellingLists});
  }

  listItemRender(sellingList: SellingList, group, index) {
    return (
      <TouchableHighlight style={{marginVertical: 5, marginHorizontal: 10}} underlayColor={Theme.colors.highlight} onPress={() => {
          NavigationService.navigate('WishSellingListDetail', {
          shoppingList: sellingList,
          reload: this.reloadSellingLists.bind(this),
          type: 'SellingList'
        })
      }}>
        <WishSellingListCell shoppingList={sellingList} refresh={() => this.refresh()} onDelete={async () => {
          await sellingList.delete();
          let sellingLists = [].concat(this.state.sellingLists);
          sellingLists.splice(index, 1);
          this.setState({sellingLists});
        }}/>
      </TouchableHighlight>);
  }
  render() {
    const sellingLists = this.listViewDataSource.cloneWithRows(this.state.sellingLists);
    let count = 0, total = 0;
    for (var item of this.state.sellingLists) {
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
          autoCapitalize='none'
          onChangeText={(searchText) => {this.setState({searchText})}}
          onClear={(value) => {}}
          placeholder='Search...'
          platform={Platform.OS}
          lightTheme={true}
          />
        <ListView
          style={styles.listContainer}
          dataSource={sellingLists}
          renderRow={this.listItemRender.bind(this)}
          enableEmptySections={true}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.reloadSellingLists.bind(this)}
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

export default SellingListScreen;