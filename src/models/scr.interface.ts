export interface Position {
  lon: number;
  lat: number;
  h: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface GeoPose {
  position: Position;
  quaternion: Quaternion;
}

export interface Ref {
  contentType: string;
  /** Absolute http(s) URL, or a root-relative path in the client public folder. */
  url: string;
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
  /** Opaque SpatialDDS FramedPose; not interpreted by this geographic service. */
  framedPose?: any;
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
