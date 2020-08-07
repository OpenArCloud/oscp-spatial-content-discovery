import { GeoPose } from "./scr.interface";

export interface Tags {
  geopose: GeoPose;
  tenant: string;
  url: URL;
  keywords?: string[];
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
