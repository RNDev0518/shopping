import React, { Component } from 'react';
import { View, Modal, StyleSheet, Alert, TextInput, TouchableHighlight, ListView, ListViewDataSource, RefreshControl, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { Icon, SearchBar } from 'react-native-elements';
import Picker from 'react-native-picker';
import { Theme } from '../config/themes';
import { RealmService } from '../utils/RealmService';
import { WishSellingListCell } from '../components';
import { sleep, NavigationService } from '../utils';
import {currencies} from '../config/constants';
import { WishList, WishSellingList, SellingList } from '../models';

let self: SearchWishSellingList = null;

class SearchWishSellingList extends Component {

  static navigationOptions = ({ navigation }) => {

    const type = navigation.state.params.type;
    return {
      headerRight: <Icon name='add' type="material" containerStyle={{padding: 10}} color='transparent'/>,
      headerTitleStyle: { 
        textAlign:"center", 
        flex: 1 
      },
      title: `Related ${type}s`,
    }
  };

  type = 'SellingList';
  listViewDataSource: ListViewDataSource = null;

  constructor(props) {
    super(props);
    this.listViewDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => JSON.stringify(r1) !== JSON.stringify(r2)});
    self = this;
    this.type = this.props.navigation.getParam('type', 'SellingList');
    this.state = {
      shoppingLists: [],
    }
  }

  async loadWishSellingLists() {
    this.setState({refreshing: true});
    const tags = this.props.navigation.getParam('tags', []);
    let shoppingLists = [];
    if (this.type === 'SellingList') {
      shoppingLists = await SellingList.getByTags(tags);
    } else {
      shoppingLists = await WishList.getByTags(tags);
    }

    this.setState({shoppingLists, refreshing: false});
  }
  componentDidMount() {
    this.loadWishSellingLists(true);
  }

  listItemRender(shoppingLists: WishSellingList, group, index) {
    return (<WishSellingListCell shoppingList={shoppingLists} />);
  }

  render() {
    const shoppingLists = this.listViewDataSource.cloneWithRows(this.state.shoppingLists);
    let count = 0, total = 0;
    for (var item of this.state.shoppingLists) {
      if (item.price > 0) {
        count += item.quantity;
        total += item.price * item.quantity;
      }
    }

    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null} enabled>
        <ListView
          style={styles.listContainer}
          dataSource={shoppingLists}
          renderRow={this.listItemRender.bind(this)}
          enableEmptySections={true}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => {
                this.loadWishSellingLists();
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

export default SearchWishSellingList;