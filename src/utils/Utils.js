import { User, GeoPoint } from "../models";
import Geocoder from 'react-native-geocoder';
import { MAP_API_KEY } from '../config/constants';

export const sleep = (interval) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, interval);
  })
}
export const magnetometerToHeading = ({x, y}) => {
  const angle = Math.atan2(-x, y) * 180 / Math.PI;
  return (angle + 360) % 360;
}

export const getLanguages = (user1: User, user2: User) => {
  if (user1.lang1 === user2.lang1) return null;
  if (
    (user1.lang1 === user2.lang2 || user1.lang1 === user2.lang3) && 
    (user2.lang1 === user1.lang2 || user2.lang1 === user1.lang3)) {
    return [user1.lang1, user2.lang1];
  }
  return null;
}

Geocoder.fallbackToGoogle(MAP_API_KEY);

export const getLocationAddress = (location: GeoPoint) => {
  return Geocoder.geocodePosition({lat: location.latitude, lng: location.longitude})
    .then(geo => `${geo[0].locality || ''}, ${geo[0].adminArea || ''} ${geo[0].country || ''}`);
}

export const getLocationAddressFull = (location: GeoPoint) => {
  return Geocoder.geocodePosition({lat: location.latitude, lng: location.longitude})
    .then(geo => `${geo[0].streetNumber || ''} ${geo[0].streetName || ''} ${geo[0].locality || ''}, ${geo[0].adminArea || ''} ${geo[0].country || ''}`);
}

export const isValidURL = (userInput) => {
  var res = userInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  if(res == null)
      return false;
  else
      return true;
}