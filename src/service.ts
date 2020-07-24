import { Scr } from "./models/scr.interface";
import request from "request-promise";
import { Element } from "./models/osm_json.interface";
import { BboxDto } from "./models/scr_bbox.dto";
import { ScrDto } from "./models/scr.dto";
import { validateOrReject } from "class-validator";

import kappa from "kappa-core";
import ram from "random-access-memory";
import memdb from "memdb";
import Osm from "kappa-osm";

import * as dotenv from "dotenv";

dotenv.config();

const KAPPA_CORE_FILE: string = process.env.KAPPA_CORE_FILE as string;

const osm = Osm({
  core: kappa(KAPPA_CORE_FILE, { valueEncoding: "json" }),
  index: memdb(),
  storage: function (name, cb) {
    cb(null, ram());
  },
});

export const find = async (id: string): Promise<Scr> => {
  const osmGet = new Promise<Element[]>((resolve, reject) => {
    osm.get(id, function (err, nodes) {
      if (err) reject(err);
      else resolve(nodes);
    });
  });

  const nodes: Element[] = await osmGet;

  if (nodes.length > 0) {
    if (nodes[0].deleted) {
      throw new Error("No record found");
    }

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

    const scrs: Scr[] = mapResponse(nodes);

    return scrs[0];
  }

  throw new Error("No record found");
};

export const remove = async (id: string): Promise<void> => {
  const osmGet = new Promise<Element[]>((resolve, reject) => {
    osm.get(id, function (err, nodes) {
      if (err) reject(err);
      else resolve(nodes);
    });
  });

  const nodes: Element[] = await osmGet;

  if (nodes.length > 0) {
    if (nodes[0].deleted) {
      throw new Error("No record found");
    }

    const osmDel = new Promise((resolve, reject) => {
      osm.del(nodes[0].id, { changeset: nodes[0].changeset }, function (err) {
        if (err) reject(err);
        else resolve();
      });
    });

    await osmDel;
    return;
  }

  throw new Error("No record found to delete");
};

export const findBbox = async (bboxStr: string): Promise<Scr[]> => {
  const bboxArr = bboxStr.split(",");
  let bboxObj = new BboxDto();
  bboxObj.minLongitude = +bboxArr[0];
  bboxObj.minLatitude = +bboxArr[1];
  bboxObj.maxLongitude = +bboxArr[2];
  bboxObj.maxLatitude = +bboxArr[3];

  try {
    await validateOrReject(bboxObj);
  } catch (errors) {
    throw new Error("Invalid bounding box");
  }

  if (
    bboxObj.minLongitude > bboxObj.maxLongitude ||
    bboxObj.minLatitude > bboxObj.maxLatitude
  )
    throw new Error("Invalid bounding box");

  const osmQuery = new Promise<Element[]>((resolve, reject) => {
    osm.query(
      [
        bboxObj.minLongitude,
        bboxObj.minLatitude,
        bboxObj.maxLongitude,
        bboxObj.maxLatitude,
      ],
      function (err, nodes) {
        if (err) reject(err);
        else resolve(nodes);
      }
    );
  });

  const nodes: Element[] = await osmQuery;

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

  const scrs: Scr[] = mapResponse(nodes);

  return scrs;
};

export const create = async (scr: ScrDto): Promise<string> => {
  try {
    await validateOrReject(scr);
  } catch (errors) {
    throw new Error("Validation failed");
  }

  const CHANGESET: string = process.env.CHANGESET as string;

  const node: Element = {
    type: "node",
    changeset: CHANGESET,
    lon: scr.geopose.east,
    lat: scr.geopose.north,
    tags: {
      geopose_vertical: scr.geopose.vertical,
      geopose_qNorth: scr.geopose.qNorth,
      geopose_qEast: scr.geopose.qEast,
      geopose_qVertical: scr.geopose.qVertical,
      geopose_qW: scr.geopose.qW,
      url: scr.url,
    },
  };

  const osmCreate = new Promise<Element>((resolve, reject) => {
    osm.create(node, function (err, nodes) {
      if (err) reject(err);
      else resolve(nodes);
    });
  });

  const nodeResp: Element = await osmCreate;

  if (!nodeResp.id) {
    throw new Error("Failed to create record");
  }

  return nodeResp.id;
};
