import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, Image, TouchableHighlight, TextInput, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { CachedImage } from 'react-native-img-cache';
import { Theme } from '../config/themes';
import { Icon } from 'react-native-elements';
import moment from 'moment';
import { TextField } from 'react-native-material-textfield';
import Switch from 'react-native-switch-pro'
import { WishSellingList } from '../models';
import { NavigationService } from '../utils';
import Lightbox from 'react-native-lightbox';

export class WishSellingListCell extends Component {

  constructor(props) {
    super(props);
  }

  onDelete() {
    const shoppingList: WishSellingList = this.props.shoppingList;
    shoppingList.delete();
    this.props.onDelete();
  }

  render() {
    const shoppingList: WishSellingList = this.props.shoppingList;
    let image = shoppingList.image
                  ? <CachedImage source={{uri: shoppingList.image}} style={styles.imageStyle} resizeMode='contain' />
                  : <Image source={require('../assets/images/shopping.png')} style={styles.imageStyle} resizeMode='contain' />;
    let fullContent = shoppingList.image
                  ? <CachedImage source={{uri: shoppingList.image}} style={{ width: '100%', height: '100%'}} resizeMode='contain' />
                  : <Image source={require('../assets/images/shopping.png')} style={{ width: '100%', height: '100%'}} resizeMode='contain' />;
    image = (<Lightbox navigator={this.props.navigation} style={{justifyContent: "center"}} renderContent={() => fullContent}>{image}</Lightbox>);

    return (
      <View style={styles.container}>
        {image}
        <View style={styles.descriptionContainer}>
          <View style={{flexDirection: 'row', ...styles.descriptionItem}}>
            <Text style={{flex: 1}}>{shoppingList.searchWords}</Text>
            <Text>{moment(shoppingList.createdAt).format('MMM DD, YYYY')}</Text>
          </View>
          <Text style={{color: 'grey', ...styles.descriptionItem}}>{`${shoppingList.quantity || 0} x ${shoppingList.currency || '$'}${shoppingList.price || 0}`}</Text>
          <Text style={{color: 'grey', ...styles.descriptionItem}}>{shoppingList.location || 'No Location'}</Text>
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <Icon containerStyle={styles.icons} name='pricetag-multiple' type='foundation' color={this.props.onDelete ? 'green' : 'grey'} size={26} onPress={() => {
                if (this.props.onDelete) {
                  NavigationService.navigate('SearchWishSellingList', {type: 'WishList', tags: shoppingList.tags});
                }
              }}/>
              <Icon name='burst-sale' type='foundation' type='foundation' color={this.props.onDelete ? 'green' : 'grey'} size={26} containerStyle={styles.icons} onPress={() => {
                if (this.props.onDelete) {
                  NavigationService.navigate('SearchWishSellingList', {type: 'SellingList', tags: shoppingList.tags});
                }
              }}/>
              <Icon name='pin-drop' type='material' color={'green'} size={26} containerStyle={styles.icons} onPress={async () => {
                if (shoppingList.geoLocation) {
                  NavigationService.navigate('ViewOnMap', {target: shoppingList.geoLocation});
                }
              }}/>
              <Icon name='trash' type='foundation' color={this.props.onDelete ? 'green' : 'grey'} size={26} containerStyle={styles.icons} onPress={async () => {
                if (this.props.onDelete) this.onDelete();
              }}/>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
              <Icon name='cloud-download' type='material' color={Theme.colors.primaryActive} size={26} containerStyle={styles.icons} onPress={async () => {}}/>
              <Text style={{paddingBottom: 2}}>{`${shoppingList.downloadCount || 0}`}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

WishSellingListCell.propTypes = {
  wishList: PropTypes.instanceOf(WishSellingList),
  search: PropTypes.bool
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.background,
    shadowOffset:{width: 2, height: 2},
    elevation: 5,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageStyle: {
    width: 120,
    height: 120,
    marginRight: 10,
  },
  descriptionContainer: {
    flex: 1,
  },
  descriptionItem: {
    padding: 5,
  },
  icons: {
    marginTop: 10,
    marginHorizontal: 8,
  },
});
