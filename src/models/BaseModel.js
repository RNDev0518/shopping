import { Parse } from 'parse/react-native';

export class BaseModel {

  object: any;

  id: string;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(object, Reference) {
    if (object) {
      this.object = object;
    } else {
      this.object = new Reference();
    }
  }

  prepareParseObject() {
    this.object.id = this.id;
  }

  prepareData() {
    this.id = this.object.id;
    this.createdAt = this.object.createdAt || new Date();
    this.updatedAt = this.object.updatedAt || new Date();
  }

}
