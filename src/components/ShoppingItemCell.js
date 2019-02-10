import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ShoppingItem, ShoppingList } from '../models';
import { View, Text, StyleSheet, Image, TouchableHighlight, TextInput, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { CachedImage } from 'react-native-img-cache';
import { Theme } from '../config/themes';
import { Icon } from 'react-native-elements';
import moment from 'moment';
import { TextField } from 'react-native-material-textfield';
import Switch from 'react-native-switch-pro'
import { Parse } from 'parse/react-native';
import Dialog from "react-native-dialog";
import { sleep, NavigationService } from '../utils';
import Lightbox from 'react-native-lightbox';

export class ShoppingItemCell extends Component {

  constructor(props) {
    super(props);
  }

  delete() {
    this.props.onDelete();
  }

  render() {
    const shoppingItem: ShoppingItem = this.props.shoppingItem;
    const shoppingList: ShoppingList = this.props.shoppingList;
    let image = shoppingItem.image
                  ? <CachedImage source={{uri: shoppingItem.image}} style={styles.imageStyle} resizeMode='contain' />
                  : <Image source={require('../assets/images/shopping.png')} style={styles.imageStyle} resizeMode='contain' />;
    let fullContent = shoppingItem.image
                  ? <CachedImage source={{uri: shoppingItem.image}} style={{ width: '100%', height: '100%'}} resizeMode='contain' />
                  : <Image source={require('../assets/images/shopping.png')} style={{ width: '100%', height: '100%'}} resizeMode='contain' />;
    image = (<Lightbox navigator={this.props.navigation} style={{justifyContent: "center"}} renderContent={() => fullContent}>{image}</Lightbox>);

    return (
      <View style={styles.container}>
        {image}
        <View style={styles.descriptionContainer}>
          <View style={styles.descriptionItem}>
            <Text>{shoppingItem.searchWords}</Text>
          </View>
          <View style={styles.descriptionItem}>
            <Text style={{color: 'grey'}}>{`${shoppingItem.quantity || 0} x ${shoppingList.currency}${shoppingItem.price || 0}`}</Text>
          </View>
          <View style={styles.descriptionItem}>
            <Text style={{color: 'grey'}}>{moment(shoppingItem.createdAt).format('MMM DD, YYYY')}</Text>
          </View>
          <View style={styles.descriptionItem}>
            <Text style={{color: 'grey'}}>{shoppingItem.location || 'No Location'}</Text>
          </View>
        </View>
        <View>
          <Icon name='check-circle' type='material' color={shoppingItem.isPurchased ? 'green' : 'lightgrey'} size={24} containerStyle={styles.icons} onPress={async () => {
            shoppingItem.isPurchased = !shoppingItem.isPurchased;
            await shoppingItem.save();
            this.props.refresh();
          }}/>
          <Icon name='pin-drop' type='material' color={shoppingItem.imageGeolocation ? '#662222' : 'lightgrey'} size={30} containerStyle={styles.icons} onPress={() => {
            if (shoppingItem.imageGeolocation) {
              NavigationService.navigate('ViewOnMap', {target: shoppingItem.imageGeolocation});
            }
          }}/>
          <Icon name='delete' type='material' size={30} containerStyle={styles.icons} color='grey' onPress={() => {
            this.delete();
          }}/>
        </View>
      </View>
    );
  }
}

ShoppingItemCell.propTypes = {
  shoppingItem: PropTypes.instanceOf(ShoppingItem),
  shoppingList: PropTypes.instanceOf(ShoppingList),
};

const styles = StyleSheet.create({
  touchable: {
    margin: 10,
  },
  container: {
    backgroundColor: Theme.colors.background,
    shadowOffset:{width: 2, height: 2},
    elevation: 5,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    flexDirection: 'row',
    padding: 10,
    marginTop: 1,
  },
  imageStyle: {
    width: 120,
    height: 120,
  },
  descriptionContainer: {
    marginLeft: 10,
    flex: 1,
  },
  descriptionItem: {
    flex: 1,
    justifyContent: 'center',
  },
  icons: {
    flex: 1,
    justifyContent: 'center',
  },
});
