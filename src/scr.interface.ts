
export interface GeoPose {
	north: Number;
	east: Number;
    vertical: Number;
    qNorth: Number;
    qEast: Number;
    qVertical: Number;
    qW: Number
}

export interface SCR {
    id: String;
    type: String;
    geopose: GeoPose;
    url: URL;
    timestamp: Date;
}
