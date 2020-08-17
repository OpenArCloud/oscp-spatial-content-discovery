import { Content } from "./scr.interface";

export interface Tags {
  type: string;
  content: Content;
  tenant: string;
  version: string;
}

export interface Element {
  id?: string;
  deleted?: boolean;
  type: string;
  changeset: string;
  uid?: string;
  lon: number;
  lat: number;
  tags: Tags;
  timestamp?: Date;
  links?: any[];
  version?: string;
}
