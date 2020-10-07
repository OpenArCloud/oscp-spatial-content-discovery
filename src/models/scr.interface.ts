export interface GeoPose {
  longitude: number;
  latitude: number;
  ellipsoidHeight: number;
  quaternion: number[];
}

export interface Ref {
  contentType: string;
  url: URL;
}

export interface Content {
  id: string;
  type: string;
  title: string;
  description?: string;
  keywords?: string[];
  refs: Ref[];
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
