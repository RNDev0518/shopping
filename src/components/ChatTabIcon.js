import React, { Component } from 'react'
import { StyleSheet } from 'react-native';
import IconBadge from 'react-native-icon-badge';
import { Icon, Badge } from 'react-native-elements'
import {connect} from 'react-redux';

class ChatTabIconCmp extends Component {
  render() {
    return (
      <IconBadge 
        MainElement={<Icon name={this.props.iconName} size={25} type={this.props.iconType} color={this.props.iconColor} />}
        BadgeElement={<Badge 
          value={this.props[this.props.valueKey].length > 9 ? '9+' : this.props[this.props.valueKey].length} 
          containerStyle={{ backgroundColor: 'red', padding: 0,}} textStyle={{ color: 'white', fontWeight: '900', fontSize: 12, }}
        />}
        IconBadgeStyle={styles.badgeStyle}
        Hidden={this.props[this.props.valueKey].length === 0}
      />
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  badgeStyle: {
    marginRight: -10,
    marginTop: -5,
  }
});

const mapStateToProps = ({ message }) => {
  const { unread_messages } = message;
  return { unread_messages };
};

export const ChatTabIcon = connect(mapStateToProps, null)(ChatTabIconCmp);