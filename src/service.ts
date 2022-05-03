import { Scr } from "./models/scr.interface";
import request from "request-promise";
import { Element } from "./models/osm_json.interface";
import { ScrDto } from "./models/scr.dto";
import { validateOrReject } from "class-validator";
import kappa from "kappa-core";
import ram from "random-access-memory";
import memdb from "memdb";
import Osm from "kappa-osm";
import dotenv from "dotenv";
import * as Swarm from "./swarm";
import * as h3 from "h3-js";
import * as turf from "@turf/turf";
import { Global } from "./global";
import { placekeyToH3, h3ToPlacekey, placekeyToGeo } from "@placekey/placekey";

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
      type: p.tags.type,
      content: p.tags.content,
      tenant: p.tags.tenant,
      timestamp: new Date(p.timestamp).getTime() / 1000,
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
      }
    );
  });

  await osmDel;
  return;
};

export const findHex = async (
  topic: string,
  h3Index: string,
  keywords: string,
  placekey: string
): Promise<Scr[]> => {
  if (!TOPICS.includes(topic)) throw new Error("Invalid topic");

  let placekeyComponents: string[];

  if (placekey) {
    placekeyComponents = placekey.split("@");
    h3Index = placekeyToH3("@" + placekeyComponents[1]);
  }

  if (!h3Index) throw new Error("Invalid h3Index");

  const hexBoundary = h3.h3ToGeoBoundary(h3Index, true);
  const hexPoly = turf.polygon([hexBoundary]);

  const scaledPoly = turf.transformScale(hexPoly, 2);

  const bbox = turf.bbox(scaledPoly);

  let keywordArr: string[] = [];

  if (keywords) {
    keywordArr = keywords.split(",");
    keywordArr = keywordArr.map(function (x) {
      return x.toLowerCase();
    });
  }

  const osmQuery = new Promise<Element[]>((resolve, reject) => {
    kappaCores[topic].query([bbox[0], bbox[1], bbox[2], bbox[3]], function (
      err,
      nodes
    ) {
      if (err) reject(err);
      else resolve(nodes);
    });
  });

  let nodes: Element[] = await osmQuery;

  if (placekey) {
    if (placekeyComponents[0].length > 0) {
      nodes = nodes.filter((node) => node.tags.content.placekey === placekey);
    }
  }

  if (keywordArr.length > 0) {
    nodes = nodes.filter((node) => node.tags.content.keywords);
    nodes = nodes.filter(
      (node) =>
        node.tags.content.keywords.filter((x) => keywordArr.includes(x))
          .length > 0
    );
  }

  const mapResponse = (response: Element[]) =>
    response.map((p) => ({
      id: p.id,
      type: p.tags.type,
      content: p.tags.content,
      tenant: p.tags.tenant,
      timestamp: new Date(p.timestamp).getTime() / 1000,
    }));

  const scrs: Scr[] = mapResponse(nodes);

  return scrs;
};

export const findAllTenant = async (
  tenant: string,
  topic: string
): Promise<Scr[]> => {
  if (!tenant) throw new Error("Invalid tenant");
  if (!TOPICS.includes(topic)) throw new Error("Invalid topic");

  const osmQuery = new Promise<Element[]>((resolve, reject) => {
    kappaCores[topic].query([-180, -90, 180, 90], function (err, nodes) {
      if (err) reject(err);
      else resolve(nodes);
    });
  });

  const elements: Element[] = await osmQuery;

  const nodes = elements.filter((element) => element.type === "node");

  const nodesAllTenant = nodes.filter(
    (element) => element.tags.tenant === tenant
  );

  const mapResponse = (response: Element[]) =>
    response.map((p) => ({
      id: p.id,
      type: p.tags.type,
      content: p.tags.content,
      tenant: p.tags.tenant,
      timestamp: new Date(p.timestamp).getTime() / 1000,
    }));

  const scrs: Scr[] = mapResponse(nodesAllTenant);

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
    lon: scr.content.geopose.position.lon,
    lat: scr.content.geopose.position.lat,
    tags: {
      type: scr.type,
      content: scr.content,
      tenant: tenant,
      version: Global.scdVersion,
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
    lon: scr.content.geopose.position.lon,
    lat: scr.content.geopose.position.lat,
    tags: {
      type: scr.type,
      content: scr.content,
      tenant: tenant,
      version: Global.scdVersion,
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
