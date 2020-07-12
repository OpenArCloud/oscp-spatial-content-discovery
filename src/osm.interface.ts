
export interface Tags {
    geopose_vertical: number;
    geopose_qNorth: number;
    geopose_qEast: number;
    geopose_qVertical: number;
    geopose_qW: number;
    url: URL;
}

export interface Element {
    id: string;
    type: string;
    changeset: string;
    uid: string;
    lon: number;
    lat: number;
    tags: Tags;
    timestamp: Date;
    links: any[];
    version: string;
}

export interface Bounds {
    minlon: number;
    minlat: number;
    maxlon: number;
    maxlat: number;
}

export interface RootObject {
    version: number;
    generator: string;
    elements: Element[];
    bounds: Bounds;
}

