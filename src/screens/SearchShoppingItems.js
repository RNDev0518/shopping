import React, { Component } from 'react';
import { View, Modal, StyleSheet, Alert, TextInput, TouchableHighlight, ListView, ListViewDataSource, RefreshControl, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { ShoppingList, ShoppingItem } from '../models';
import { Theme } from '../config/themes';
import { Icon } from 'react-native-elements';
import { RealmService } from '../utils/RealmService';
import { ShoppingItemCell } from '../components';
import { sleep, NavigationService } from '../utils';
import Picker from 'react-native-picker';
import {currencies} from '../config/constants';
import { NavigationEvents } from 'react-navigation';

class SearchShoppingItems extends Component {

  static navigationOptions = ({ navigation }) => {

    return {
      headerRight: <Icon name='done' type="material" color='transparent' containerStyle={{padding: 10}}/>,
      headerTitleStyle: { 
        textAlign:"center", 
        flex:1 
      },
      title: 'Related Shopping Items',
    }
  };

  listViewDataSource: ListViewDataSource = null;

  constructor(props) {
    super(props);
    this.listViewDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => JSON.stringify(r1) !== JSON.stringify(r2)});
    this.state = {
      shoppingItems: [],
      refreshing: true,
    }
  }

  list_map = [];
  async loadShoppingList() {
    this.setState({refreshing: true});
    const tags: ShoppingList = this.props.navigation.getParam('tags', []);
    const { items, list_map } = await ShoppingItem.getByTags(tags);

    this.list_map = list_map;
    this.setState({shoppingItems: items, refreshing: false});
  }

  listItemRender(shoppingItem: ShoppingItem, group, index) {
    const shoppingList: ShoppingList = this.list_map[shoppingItem.listId];
    return (
      <ShoppingItemCell shoppingItem={shoppingItem} shoppingList={shoppingList}/>
    )
  }
  componentDidMount() {
    this.loadShoppingList();
  }
  
  render() {
    const shoppingItems = this.listViewDataSource.cloneWithRows(this.state.shoppingItems);
    let count = 0, total = 0;
    for (var item of this.state.shoppingItems) {
      if (item.price > 0) {
        count += item.quantity;
        total += item.price * item.quantity;
      }
    }
    const currencyPickerOptions = {
      pickerData: currencies,
      pickerTitleText: 'Choose Currency',
      pickerConfirmBtnText: 'Choose',
      pickerConfirmBtnColor: [0,0,0,1],
      pickerCancelBtnText: 'Cancel',
      pickerCancelBtnColor: [128,128,128,1],
    };

    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null} enabled>
        <ListView
          style={styles.listContainer}
          dataSource={shoppingItems}
          renderRow={this.listItemRender.bind(this)}
          enableEmptySections={true}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this.loadShoppingList()}
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
  bottomContainer: {
    backgroundColor: Theme.colors.navigation,
    padding: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bottomItems: {
    marginRight: 20,
  },
  bottomText: {
    fontSize: 16,
  }
});

export default SearchShoppingItems;