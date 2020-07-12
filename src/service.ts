
import { SCR } from "./scr.interface";
import request from "request-promise";
import { Element } from "./osm.interface";


export const findBbox = async (bbox: string): Promise<SCR[]> => {

  const BASE_URL: string = process.env.BASE_URL as string;

  const url = BASE_URL + `/api/0.6/map?bbox=` + bbox;

  const options = {
      uri: url,
      headers: {
          'Accept': 'application/json'
      },
  };

  const response = JSON.parse(await request(options));

  const mapResponse = (response: Element[]) => response.map((p) => ({
    id: p.id,
    type: "scr",
    geopose: {north: p.lat, east: p.lon, vertical: p.tags.geopose_vertical, qNorth: p.tags.geopose_qNorth, qEast: p.tags.geopose_qEast, qVertical: p.tags.geopose_qVertical, qW: p.tags.geopose_qW},
    url: p.tags.url,
    timestamp: p.timestamp,
  }));

  const scrs: SCR[] = mapResponse(response.elements);

  return scrs;
};