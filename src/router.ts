import * as express from "express";
import cors from "cors";
import * as Service from "./service";
import { Scr } from "./models/scr.interface";
import { ScrDto } from "./models/scr.dto";
import { checkJwt } from "./middleware/authz.middleware";
import dotenv from "dotenv";

const jwtAuthz = require("express-jwt-authz");

const AUTH0_AUDIENCE: string = process.env.AUTH0_AUDIENCE as string;

class Router {
  constructor(server: express.Express) {
    const router = express.Router();

    router.get(
      "/scrs/:topic/:id",
      async (req: express.Request, res: express.Response) => {
        try {
          const topic: string = String(req.params.topic);
          const id: string = String(req.params.id);
          const scr: Scr = await Service.find(topic, id);
          res.status(200).send(scr);
        } catch (e) {
          res.status(404).send(e.message);
        }
      }
    );

    router.delete(
      "/scrs/:topic/:id",
      checkJwt,
      jwtAuthz(["delete:scrs"]),
      async (req: express.Request, res: express.Response) => {
        try {
          const tenant: string = String(req['user'][AUTH0_AUDIENCE + '/tenant']);
          const topic: string = String(req.params.topic);
          const id: string = String(req.params.id);
          await Service.remove(topic, id, tenant);
          res.sendStatus(200);
        } catch (e) {
          res.status(500).send(e.message);
        }
      }
    );

    router.get(
      "/scrs/:topic",
      async (req: express.Request, res: express.Response) => {
        try {
          const topic: string = String(req.params.topic);
          const bbox: string = String(req.query.bbox);
          const scrs: Scr[] = await Service.findBbox(topic, bbox);
          res.status(200).send(scrs);
        } catch (e) {
          res.status(404).send(e.message);
        }
      }
    );

    router.post(
      "/scrs/:topic",
      checkJwt,
      jwtAuthz(["create:scrs"]),
      async (req: express.Request, res: express.Response) => {
        try {
          const tenant: string = String(req['user'][AUTH0_AUDIENCE + '/tenant']);
          const topic: string = String(req.params.topic);
          let scr = new ScrDto();
          Object.assign(scr, req.body);
          const id: string = await Service.create(topic, scr, tenant);
          res.status(201).send(id);
        } catch (e) {
          res.status(404).send(e.message);
        }
      }
    );

    router.options("*", cors());
    server.use("/", router);
  }
}

export default Router;
