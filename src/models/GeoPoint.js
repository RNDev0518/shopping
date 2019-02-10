import { Parse } from 'parse/react-native';

export class GeoPoint {

  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
  static toParseGeoPoint(geoPoint: GeoPoint) {
    if (!geoPoint) return null;
    return new Parse.GeoPoint({
      latitude: geoPoint.latitude,
      longitude: geoPoint.longitude,
    });
  }

  static toGeoPoint(geoPoint: Parse.GeoPoint) {
    if (!geoPoint) return null;
    return new GeoPoint(geoPoint.latitude, geoPoint.longitude);
  }

  latitude: number;
  longitude: number;
}
