import { BaseModel } from './BaseModel';
import { GeoPoint } from './GeoPoint';

export class WishSellingList extends BaseModel {

  searchWords: string;
  userId : string;
  realm_id: string;
  price: string;
  image: string;
  description: string;
  location: string;
  tags: [string];
  time: string;
  fromCamera: boolean;
  geoLocation: GeoPoint;
  currency : string;
  downloadCount: number;
  isSharingOn: boolean;
  isUpdateOn: boolean;
  isOnline: boolean;
  horizontalAccuracy : number;

  prepareDataFromRealm: Function;
  prepareData: Function;
  prepareParseObject: Function;
  save: Function;
  delete: Function;
  static getAll: Function;
  static create: Function;
}