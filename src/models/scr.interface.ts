export interface GeoPose {
  north: number;
  east: number;
  vertical: number;
  qNorth: number;
  qEast: number;
  qVertical: number;
  qW: number;
}

export interface Scr {
  id: string;
  type: string;
  geopose: GeoPose;
  url: URL;
  timestamp: Date;
}
