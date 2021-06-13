
export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface GeoPose {
  longitude: number;
  latitude: number;
  ellipsoidHeight: number;
  quaternion: Quaternion;
}

export interface Ref {
  contentType: string;
  url: URL;
}

export interface Def {
  type: string;
  value: string;
}

export interface Content {
  id: string;
  type: string;
  title: string;
  description?: string;
  keywords?: string[];
  placekey?: string;
  refs?: Ref[];
  geopose: GeoPose;
  size?: number;
  bbox?: string;
  definitions?: Def[];
}

export interface Scr {
  id: string;
  type: string;
  content: Content;
  tenant: string;
  timestamp: number;
}
