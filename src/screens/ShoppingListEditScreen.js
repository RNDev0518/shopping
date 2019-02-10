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

class ShoppingListEditScreen extends Component {

  static navigationOptions = ({ navigation }) => {

    const shoppingList: ShoppingList = navigation.state.params.shoppingList;

    return {
      headerRight: <Icon name='done' type="material" color='transparent' containerStyle={{padding: 10}}/>,
      headerTitleStyle: { 
        textAlign:"center", 
        flex:1 
      },
      title: shoppingList.name,
    }
  };

  listViewDataSource: ListViewDataSource = null;

  constructor(props) {
    super(props);
    this.listViewDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => JSON.stringify(r1) !== JSON.stringify(r2)});
    this.state = {
      shoppingItems: [],
      refreshing: true, name: '',
    }
  }

  async createNewItem() {
    const shoppingList: ShoppingList = this.props.navigation.getParam('shoppingList', null);
    if (shoppingList && this.state.name) {
      const newItem = await ShoppingItem.create(this.state.name, shoppingList.id);
      const shoppingItems = [].concat(this.state.shoppingItems).concat(newItem);
      this.setState({shoppingItems, name: ''});
    }
  }
  async reloadShoppingList(withRefresh) {
    if (withRefresh) {
      this.setState({refreshing: true});
    }
    const shoppingList: ShoppingList = this.props.navigation.getParam('shoppingList', null);
    const serverItems = await ShoppingItem.getAll(shoppingList.id);
    const realmItems = await RealmService.readShoppingItems(shoppingList.id);

    const shoppingItems = serverItems.concat(realmItems);

    this.setState({shoppingItems, refreshing: false, currency: [shoppingList.currency]});
  }
  refresh() {
    const shoppingItems = [].concat(this.state.shoppingItems);
    this.setState({shoppingItems});
  }
  listItemRender(shoppingItem: ShoppingItem, group, index) {
    const shoppingList: ShoppingList = this.props.navigation.getParam('shoppingList', null);
    return (
      <TouchableHighlight underlayColor={Theme.colors.highlight} onPress={() => {
        NavigationService.navigate('ShoppingItemDetail', {shoppingItem, currency: shoppingList.currency});
      }}>
        <ShoppingItemCell shoppingItem={shoppingItem} shoppingList={shoppingList} refresh={() => this.refresh()} onDelete={async () => {
          Alert.alert('Warning', 'Do you want to delete this item? Are you sure?', [
            {
              text: 'Yes',
              onPress: async () => {
                try {
                  await shoppingItem.delete();
                  let shoppingItems = [].concat(this.state.shoppingItems);
                  shoppingItems.splice(index, 1);
                  this.setState({shoppingItems});
                } catch (error) {
                }
              }
            }, {
              text: 'No',
            }
          ]);
        }}/>
      </TouchableHighlight>);
  }
  render() {
    const shoppingList: ShoppingList = this.props.navigation.getParam('shoppingList', null);
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
        <NavigationEvents
          onDidFocus={() => this.reloadShoppingList()}
        />
        <View style={styles.textContainer}>
          <TextInput style={styles.textStyle} value={this.state.name} autoCapitalize='none' onChangeText={(name) => this.setState({name})} onSubmitEditing={this.createNewItem.bind(this)}/>
          <Icon name='close' type='material' size={24} onPress={() => {
            this.setState({name: ''});
          }}/>
        </View>
        <ListView
          style={styles.listContainer}
          dataSource={shoppingItems}
          renderRow={this.listItemRender.bind(this)}
          enableEmptySections={true}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => {
                this.reloadShoppingList(true)
              }}
              enabled={true}
              colors={[Theme.colors.successDark]}
              tintColor={Theme.colors.successDark}
              />
          }
        />
        <View style={styles.bottomContainer}>
          <Text style={{...styles.bottomItems, ...styles.bottomText}}>Checkout: {count}</Text>
          <Text style={styles.bottomText}>Total: </Text>
          <TouchableHighlight onPress={() => {
            Picker.init({
              ...currencyPickerOptions,
              selectedValue: [shoppingList.currency],
              onPickerConfirm: (currency) => {
                shoppingList.currency = currency[0];
                shoppingList.save()
                  .then(() => {
                    const shoppingItems = [].concat(this.state.shoppingItems);
                    this.setState({shoppingItems});
                  });
              }
            });
            Picker.show();
          }}><Text style={styles.bottomText}>{shoppingList.currency}</Text></TouchableHighlight>
          <Text style={{marginLeft: 5, ...styles.bottomText}}>{total}</Text>
        </View>
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

export default ShoppingListEditScreen;