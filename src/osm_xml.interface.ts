
export interface Properties {
    timestamp: Date;
    version: string;
    changeset: string;
    uid: string;
    geopose_vertical: number;
    geopose_qNorth: number;
    geopose_qEast: number;
    geopose_qVertical: number;
    geopose_qW: number;
    url: URL;
    id: string;
}

export interface Geometry {
    type: string;
    coordinates: number[];
}

export interface Feature {
    type: string;
    id: string;
    properties: Properties;
    geometry: Geometry;
}

export interface RootObject {
    type: string;
    features: Feature[];
}
