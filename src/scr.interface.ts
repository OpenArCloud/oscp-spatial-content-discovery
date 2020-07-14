export interface GeoPose {
  north: Number;
  east: Number;
  vertical: Number;
  qNorth: Number;
  qEast: Number;
  qVertical: Number;
  qW: Number;
}

export interface ScrReq {
  type: String;
  geopose: GeoPose;
  url: URL;
}

export interface ScrResp {
  id: String;
  type: String;
  geopose: GeoPose;
  url: URL;
  timestamp: Date;
}
