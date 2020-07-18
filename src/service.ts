import { Scr } from "./scr.interface";
import request from "request-promise";
import { Element } from "./osm_json.interface";
import { RootObject } from "./osm_xml.interface";
import * as osm2json from "osmtogeojson";
import { DOMParser } from "xmldom";
import { BboxDto } from "./scr_bbox.dto";
import { ScrDto } from "./scr.dto";
import { validate, validateOrReject, validateSync } from "class-validator";

export const find = async (id: string): Promise<Scr> => {
  const BASE_URL: string = process.env.BASE_URL as string;

  const url = BASE_URL + `/api/0.6/node/` + id;

  const response = await request(url);
  const respXml = new DOMParser().parseFromString(response, "application/xml");
  const respGeoJson: RootObject = <RootObject>osm2json.default(respXml);

  const scr: Scr = {
    id: respGeoJson.features[0].properties.id.replace("node/", ""),
    type: "scr",
    geopose: {
      north: respGeoJson.features[0].geometry.coordinates[1],
      east: respGeoJson.features[0].geometry.coordinates[0],
      vertical: +respGeoJson.features[0].properties.geopose_vertical,
      qNorth: +respGeoJson.features[0].properties.geopose_qNorth,
      qEast: +respGeoJson.features[0].properties.geopose_qEast,
      qVertical: +respGeoJson.features[0].properties.geopose_qVertical,
      qW: +respGeoJson.features[0].properties.geopose_qW,
    },
    url: respGeoJson.features[0].properties.url,
    timestamp: respGeoJson.features[0].properties.timestamp,
  };

  if (scr) {
    return scr;
  }

  throw new Error("No record found");
};

export const remove = async (id: string): Promise<void> => {
  const BASE_URL: string = process.env.BASE_URL as string;
  const url = BASE_URL + `/api/0.6/node/` + id;

  const response = await request(url);
  const respXml = new DOMParser().parseFromString(response, "application/xml");
  const respGeoJson: RootObject = <RootObject>osm2json.default(respXml);
  const changeset: string = respGeoJson.features[0].properties.changeset;

  if (changeset) {
    const xmlString: string =
      '<osm><node id="' + id + '" changeset="' + changeset + '"></node></osm>';

    const options = {
      uri: url,
      body: xmlString,
      method: "DELETE",
      headers: {
        "Content-Type": "text/xml",
      },
    };

    const response = await request(options);

    return;
  }

  throw new Error("No record found to delete");
};

export const findBbox = async (bboxStr: string): Promise<Scr[]> => {

  const bboxArr = bboxStr.split(',');
  let bboxObj = new BboxDto();
  bboxObj.minLongitude = +bboxArr[0];
  bboxObj.minLatitude = +bboxArr[1];
  bboxObj.maxLongitude = +bboxArr[2];
  bboxObj.maxLatitude = +bboxArr[3];

  const err = validateSync(bboxObj);
  if (err.length > 0) throw new Error("Invalid bounding box");
  if ((bboxObj.minLongitude > bboxObj.maxLongitude) || (bboxObj.minLatitude > bboxObj.maxLatitude)) throw new Error("Invalid bounding box");

  const BASE_URL: string = process.env.BASE_URL as string;
  const url = BASE_URL + `/api/0.6/map?bbox=` + bboxStr;

  const options = {
    uri: url,
    headers: {
      Accept: "application/json",
    },
  };

  const response = JSON.parse(await request(options));

  const mapResponse = (response: Element[]) =>
    response.map((p) => ({
      id: p.id,
      type: "scr",
      geopose: {
        north: +p.lat,
        east: +p.lon,
        vertical: +p.tags.geopose_vertical,
        qNorth: +p.tags.geopose_qNorth,
        qEast: +p.tags.geopose_qEast,
        qVertical: +p.tags.geopose_qVertical,
        qW: +p.tags.geopose_qW,
      },
      url: p.tags.url,
      timestamp: p.timestamp,
    }));

  const scrs: Scr[] = mapResponse(response.elements);

  return scrs;
};

export const create = async (scr: ScrDto): Promise<void> => {

  const err = validateSync(scr);
  if (err.length > 0) throw new Error("Validation failed");

  const BASE_URL: string = process.env.BASE_URL as string;
  const CHANGESET: string = process.env.CHANGESET as string;
  const url = BASE_URL + `/api/0.6/node/create`;

  const xmlString: string =
    '<osm><node id="-1" changeset="' +
    CHANGESET +
    '" uid="10" lon="' +
    scr.geopose.east +
    '" lat="' +
    scr.geopose.north +
    '"><tag k="geopose_vertical" v="' +
    scr.geopose.vertical +
    '"/><tag k="geopose_qNorth" v="' +
    scr.geopose.qNorth +
    '"/><tag k="geopose_qEast" v="' +
    scr.geopose.qEast +
    '"/><tag k="geopose_qVertical" v="' +
    scr.geopose.qVertical +
    '"/><tag k="geopose_qW" v="' +
    scr.geopose.qW +
    '"/><tag k="url" v="' +
    scr.url +
    '"/></node></osm>';

  const options = {
    uri: url,
    body: xmlString,
    method: "PUT",
    headers: {
      "Content-Type": "text/xml",
    },
  };

  const response = await request(options);

  return;
};
