import React, { Component } from 'react';
import { StyleSheet, View, TouchableHighlight, Alert, Text, Keyboard, ListView, KeyboardAvoidingView, Platform, ListViewDataSource, RefreshControl } from 'react-native';
import { Theme } from '../config/themes';
import { Icon, Input } from 'react-native-elements';
import { NavigationService, RealmService } from '../utils';
import Dialog from "react-native-dialog";
import { ShoppingList, User } from '../models';
import moment from 'moment';
import { connect } from 'react-redux';
import { showIndicator, hideIndicator } from '../actions';

let self: ShoppingHomeScreen = null;

class ShoppingHomeScreen extends Component {

  static navigationOptions = ({ navigation }) => {

    const isMine = !(navigation.state.params && navigation.state.params.user);

    return {
      headerLeft: (
        <View style={{flexDirection: 'row'}}>
          <Icon name='pricetag-multiple' type='foundation' containerStyle={[styles.navigationButtons, {marginLeft: 7}]} size={32} underlayColor='transparent' onPress={() => {
            NavigationService.navigate('WishList');
          }}/>
          <Icon name='burst-sale' type='foundation' containerStyle={styles.navigationButtons} size={32} underlayColor='transparent' onPress={() => {
            NavigationService.navigate('SellingList');
          }}/>
        </View>),
      headerRight: (
        <View style={{flexDirection: 'row'}}>
          <Icon name='add-circle' type='material' containerStyle={styles.navigationButtons} size={28} underlayColor='transparent' onPress={() => {
            self.selectedList = null;
            self.setState({isVisibleModal: true});
          }}/>
          <Icon name='delete-forever' type='material' containerStyle={[styles.navigationButtons, {marginRight: 7}]} size={28} underlayColor='transparent' onPress={() => {
            Alert.alert('Warning', 'Do you want to delete the shopping list? Are you sure?', [
              {
                text: 'Yes',
                onPress: async () => {
                  try {
                    await ShoppingList.deleteAll();
                    self.setState({shoppingLists: []});
                  } catch (error) {
                    console.log(error.message);
                  } finally {
                    self.props.hideIndicator();
                  }
                }
              }, {
                text: 'No',
              }
            ]);
          }}/>
        </View>),
      headerTitleStyle: { 
        textAlign:'center', 
        flex:1 
      },
      title: 'Shopping List',
    };
  };

  newListName = null;
  listViewDataSource: ListViewDataSource = null;
  constructor(props) {
    super(props);
    this.listViewDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => JSON.stringify(r1) !== JSON.stringify(r2)});
    this.state = {
      isVisibleModal: false,
      shoppingLists: [],
      refreshing: false,
    }
    self = this;
  }

  selectedList: ShoppingList = null;

  async createNewShoppingList() {

    Keyboard.dismiss();
    this.setState({isVisibleModal: false});

    if (!this.newListName || (this.selectedList && this.selectedList.name === this.newListName)) return;

    try {

      this.props.showIndicator();

      let shoppingLists = [].concat(this.state.shoppingLists);
  
      if (this.selectedList) {
        await this.selectedList.changeListName(this.newListName);
      } else {
        const shoppingList = await ShoppingList.create(this.newListName);
        shoppingLists = shoppingLists.concat(shoppingList);
      }
      this.setState({shoppingLists});
    } catch (error) {
      console.log(error.message);
    } finally {
      this.props.hideIndicator();
    }
  }

  async deleteShoppingList(shoppingList: ShoppingList) {
      Alert.alert('Warning', 'Do you want to delete all shopping lists? Are you sure?', [
        {
          text: 'Yes',
          onPress: async () => {
            try {
              this.props.showIndicator();
              shoppingList.delete();
              let shoppingLists = [].concat(this.state.shoppingLists);
              for (let i=0;i<shoppingLists.length;i++) {
                if (shoppingLists[i].id === shoppingList.id) {
                  shoppingLists.splice(i, 1);
                }
              }
              this.setState({shoppingLists});
            } catch (error) {
              console.log(error.message);
            } finally {
              this.props.hideIndicator();
            }
          }
        }, {
          text: 'No',
        }
      ]);
  }
  async toggleOpenStatus(shoppingList: ShoppingList) {
    try {

      this.props.showIndicator();

      shoppingList.isOpened = !shoppingList.isOpened;
      shoppingList.prepareParseObject();

      shoppingList.save();
  
      const shoppingLists = [].concat(this.state.shoppingLists);
      this.setState({shoppingLists});

    } catch (error) {
      console.log(error.message);
    } finally {
      this.props.hideIndicator();
    }
  }
  async reloadShoppingList() {
    this.setState({refreshing: true});
    const shoppingLists = await ShoppingList.getAll();
    this.setState({shoppingLists, refreshing: false});
  }

  componentDidMount() {
    this.reloadShoppingList();
  }
  
  listItemRender(shoppingList: ShoppingList) {
    return (
      <TouchableHighlight underlayColor={Theme.colors.highlight} onPress={() => {
        NavigationService.navigate('EditShoppingList', {shoppingList});
      }}>
        <View style={styles.rowView}>
          <View style={{flex: 1}}>
            <Text style={styles.nameText}>{shoppingList.name}</Text>
            <Text style={styles.dateText}>{moment(shoppingList.createdAt).format('MMM D, YYYY')}</Text>
          </View>
          <Icon name='edit' type='material' color='grey' containerStyle={styles.iconButton} onPress={() => {
            this.selectedList = shoppingList;
            this.setState({isVisibleModal: true});
          }}/>
          <Icon name='delete' type='material' color='grey' containerStyle={styles.iconButton} onPress={async () => {
            this.deleteShoppingList(shoppingList);
          }}/>
          <Icon name='description' type='material' color={shoppingList.isOpened ? 'green' : 'grey'} containerStyle={styles.iconButton} onPress={() => {
            this.toggleOpenStatus(shoppingList);
          }}/>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    const shoppingLists = this.listViewDataSource.cloneWithRows(this.state.shoppingLists);

    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null} enabled>
        <Dialog.Container visible={this.state.isVisibleModal}>
          <Dialog.Title>{this.selectedList ? 'Edit List Name' : 'Create New Shopping List'}</Dialog.Title>
          <Dialog.Input 
            placeholder='List Name'
            defaultValue={this.selectedList ? this.selectedList.name : ''}
            onChangeText={(name) => {
              this.newListName = name;
            }}
          />
          <Dialog.Button label="Cancel" onPress={() => this.setState({isVisibleModal: false})} />
          <Dialog.Button label="Save" onPress={() => {
            this.setState({isVisibleModal: false});
            this.createNewShoppingList();
          }}/>
        </Dialog.Container>
        <ListView
          style={styles.container}
          dataSource={shoppingLists}
          renderRow={this.listItemRender.bind(this)}
          enableEmptySections={true}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.reloadShoppingList.bind(this)}
              enabled={true}
              colors={[Theme.colors.successDark]}
              tintColor={Theme.colors.successDark}
              />}
        />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  navigationButtons: {
    paddingHorizontal: 5
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  modalContainer: {
    shadowOffset:{width: 2, height: 2},
    elevation: 5,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    width: '80%',
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: Theme.colors.background,
  },
  modalTitle: {
    paddingVertical: 10,
    fontSize: 14,
    alignSelf: 'center',
  },
  textInputContainer: {
    marginVertical: 20,
    marginHorizontal: 10,
    padding: 5,
    borderRadius: 3,
    borderColor: Theme.colors.border.textContainer,
    borderWidth: 1,
  },
  textInputStyle: {
    fontSize: 12,
    textAlign: 'center',
  },
  modalOKButton: {
    padding: 10,
    borderTopColor: 'lightgrey',
    borderTopWidth: 1,
    alignItems: 'center',
  },
  rowView: {
    flexDirection: 'row',
    margin: 10, padding: 10,
    backgroundColor: 'white',
    shadowOffset:{width: 1, height: 1},
    shadowColor: 'black',
    shadowOpacity: 0.3,
    elevation: 5
  },
  nameText: {
    fontSize: 16,
    paddingVertical: 10,
  },
  dateText: {
    color: 'grey',
    paddingBottom: 10,
  },
  iconButton: {
    marginLeft: 5,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    width: '100%',
    paddingHorizontal: 5,
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  textInputContainer: {
    borderColor: 'transparent',
  },
  inputStyle: {
    padding: 0,
    height: Platform.OS === 'ios' ? 30 : 40,
    fontSize: 14
  }
});

export default connect(null, {
  showIndicator, hideIndicator
})(ShoppingHomeScreen);
