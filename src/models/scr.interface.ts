export interface GeoPose {
  north: number;
  east: number;
  vertical: number;
  qNorth: number;
  qEast: number;
  qVertical: number;
  qW: number;
}

export interface Content {
  id: string;
  type: string;
  title?: string;
  description?: string;
  keywords?: string[];
  url: URL;
  geopose: GeoPose;
  size?: number;
  bbox?: string;
}

export interface Scr {
  id: string;
  type: string;
  content: Content;
  tenant: string;
  timestamp: Date;
}
