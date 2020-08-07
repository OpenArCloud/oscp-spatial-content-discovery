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
import dotenv from "dotenv";
import * as Swarm from "./swarm";

dotenv.config();

const KAPPA_CORE_DIR: string = process.env.KAPPA_CORE_DIR as string;
const GEOZONE: string = process.env.GEOZONE as string;
let TOPICS: string[] = process.env.TOPICS.split(",");
TOPICS = TOPICS.map(function (x) {
  return x.toLowerCase();
});

export interface IHash {
  [key: string]: any;
}

let kappaCores: IHash = {};

TOPICS.forEach((topic) => {
  kappaCores[topic] = Osm({
    core: kappa(KAPPA_CORE_DIR + "/" + GEOZONE + "_" + topic, {
      valueEncoding: "json",
    }),
    index: memdb(),
    storage: function (name, cb) {
      cb(null, ram());
    },
  });

  const swarm = Swarm.swarm(kappaCores[topic], GEOZONE + "_" + topic);
});

export const find = async (topic: string, id: string): Promise<Scr> => {
  if (!TOPICS.includes(topic)) throw new Error("Invalid topic");

  const osmGet = new Promise<Element[]>((resolve, reject) => {
    kappaCores[topic].get(id, function (err, nodes) {
      if (err) reject(err);
      else resolve(nodes);
    });
  });

  const nodes: Element[] = await osmGet;

  if (nodes.length === 0) throw new Error("No record found");
  if (nodes[0].deleted) throw new Error("No record found");

  const mapResponse = (response: Element[]) =>
    response.map((p) => ({
      id: p.id,
      type: "scr",
      geopose: p.tags.geopose,
      url: p.tags.url,
      keywords: p.tags.keywords,
      tenant: p.tags.tenant,
      timestamp: p.timestamp,
    }));

  const scrs: Scr[] = mapResponse(nodes);
  return scrs[0];
};

export const remove = async (
  topic: string,
  id: string,
  tenant: string
): Promise<void> => {
  if (!TOPICS.includes(topic)) throw new Error("Invalid topic");

  if (!tenant) throw new Error("Invalid tenant");

  const osmGet = new Promise<Element[]>((resolve, reject) => {
    kappaCores[topic].get(id, function (err, nodes) {
      if (err) reject(err);
      else resolve(nodes);
    });
  });

  const nodes: Element[] = await osmGet;

  if (nodes.length === 0) throw new Error("No record found");
  if (nodes[0].deleted) throw new Error("No record found");
  if (nodes[0].tags.tenant.toUpperCase() !== tenant.toUpperCase())
    throw new Error("Invalid tenant");

  const osmDel = new Promise((resolve, reject) => {
    kappaCores[topic].del(
      nodes[0].id,
      { changeset: nodes[0].changeset },
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  await osmDel;
  return;
};

export const findBbox = async (
  topic: string,
  bboxStr: string,
  keywords: string
): Promise<Scr[]> => {
  if (!TOPICS.includes(topic)) throw new Error("Invalid topic");
  if (!bboxStr) throw new Error("Invalid bbox");

  let keywordArr: string[] = []

  if (keywords) {
  keywordArr = keywords.split(",");
  keywordArr = keywordArr.map(function (x) {
    return x.toLowerCase();
  });
  }

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
    kappaCores[topic].query(
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

  let nodes: Element[] = await osmQuery;

  if (keywordArr.length > 0) {
  nodes = nodes.filter((node) => node.tags.keywords);
  nodes = nodes.filter((node) => node.tags.keywords.filter(x => keywordArr.includes(x)).length > 0);
  }

  const mapResponse = (response: Element[]) =>
    response.map((p) => ({
      id: p.id,
      type: "scr",
      geopose: p.tags.geopose,
      url: p.tags.url,
      keywords: p.tags.keywords,
      tenant: p.tags.tenant,
      timestamp: p.timestamp,
    }));

  const scrs: Scr[] = mapResponse(nodes);

  return scrs;
};

export const create = async (
  topic: string,
  scr: ScrDto,
  tenant: string
): Promise<string> => {
  if (!TOPICS.includes(topic)) throw new Error("Invalid topic");

  if (!tenant) throw new Error("Invalid tenant");

  try {
    await validateOrReject(scr);
  } catch (errors) {
    throw new Error("Validation failed");
  }

  const node: Element = {
    type: "node",
    changeset: "abcdef",
    lon: scr.geopose.east,
    lat: scr.geopose.north,
    tags: {
      geopose: scr.geopose,
      url: scr.url,
      keywords: scr.keywords,
      tenant: tenant,
    },
  };

  const osmCreate = new Promise<Element>((resolve, reject) => {
    kappaCores[topic].create(node, function (err, nodes) {
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

export const update = async (
  topic: string,
  id: string,
  scr: ScrDto,
  tenant: string
): Promise<void> => {
  if (!TOPICS.includes(topic)) throw new Error("Invalid topic");

  if (!tenant) throw new Error("Invalid tenant");

  try {
    await validateOrReject(scr);
  } catch (errors) {
    throw new Error("Validation failed");
  }

  const osmGet = new Promise<Element[]>((resolve, reject) => {
    kappaCores[topic].get(id, function (err, nodes) {
      if (err) reject(err);
      else resolve(nodes);
    });
  });

  const nodes: Element[] = await osmGet;

  if (nodes.length === 0) throw new Error("No record found");
  if (nodes[0].deleted) throw new Error("No record found");
  if (nodes[0].tags.tenant.toUpperCase() !== tenant.toUpperCase())
    throw new Error("Invalid tenant");

  const node: Element = {
    type: "node",
    changeset: "abcdef",
    lon: scr.geopose.east,
    lat: scr.geopose.north,
    tags: {
      geopose: scr.geopose,
      url: scr.url,
      keywords: scr.keywords,
      tenant: tenant,
    },
  };

  const osmPut = new Promise<Element>((resolve, reject) => {
    kappaCores[topic].put(nodes[0].id, node, function (err, nodes) {
      if (err) reject(err);
      else resolve(nodes);
    });
  });

  await osmPut;
  return;
};
