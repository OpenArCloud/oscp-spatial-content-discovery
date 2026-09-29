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
  // kappa-osm primitive: "node" is repurposed as an SCR (point at GeoPose lon/lat).
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
