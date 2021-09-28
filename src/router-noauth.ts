import * as express from "express";
import * as Service from "./service";
import { Scr } from "./models/scr.interface";
import { ScrDto } from "./models/scr.dto";
import { checkJwt } from "./middleware/authz.middleware";
import { Global } from "./global";
import { plainToClass } from "class-transformer";

const jwtAuthz = require("express-jwt-authz");

const AUTH0_AUDIENCE: string = process.env.AUTH0_AUDIENCE as string;

class Router {
  constructor(server: express.Express) {
    const router = express.Router();

    router.get(
      "/tenant/scrs/:topic",
      checkJwt,
      jwtAuthz(["read:scrs"]),
      async (req: express.Request, res: express.Response) => {
        try {
          const tenant: string = req["user"][AUTH0_AUDIENCE + "/tenant"];
          const topic: string = req.params.topic.toLowerCase();
          const scrs: Scr[] = await Service.findAllTenant(tenant, topic);
          res
            .status(200)
            .type("application/vnd.oscp+json; version=" + Global.scdVersion)
            .send(scrs);
        } catch (e) {
          res.status(404).send(e.message);
        }
      }
    );

    router.get(
      "/scrs/:topic/:id",
      async (req: express.Request, res: express.Response) => {
        try {
          const topic: string = req.params.topic.toLowerCase();
          const id: string = req.params.id;
          const scr: Scr = await Service.find(topic, id);
          res
            .status(200)
            .type("application/vnd.oscp+json; version=" + Global.scdVersion)
            .send(scr);
        } catch (e) {
          res.status(404).send(e.message);
        }
      }
    );

    router.delete(
      "/scrs/:topic/:id",
      async (req: express.Request, res: express.Response) => {
        try {
          const tenant: string = "noauthtest";
          const topic: string = req.params.topic.toLowerCase();
          const id: string = req.params.id;
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
          // if(req.accepts('application/vnd.oscp+json; version=1.0')) {
          // console.log('valid version');
          // }

          const topic: string = req.params.topic.toLowerCase();
          const h3Index: string = req.query.h3Index as string;
          const keywords: string = req.query.keywords as string;
          const placekey: string = req.query.placekey as string;

          const scrs: Scr[] = await Service.findHex(
            topic,
            h3Index,
            keywords,
            placekey
          );
          res
            .status(200)
            .type("application/vnd.oscp+json; version=" + Global.scdVersion)
            .send(scrs);
        } catch (e) {
          res.status(404).send(e.message);
        }
      }
    );

    router.post(
      "/scrs/:topic",
      async (req: express.Request, res: express.Response) => {
        try {
          const tenant: string = "noauthtest";
          const topic: string = req.params.topic.toLowerCase();
          const scr = plainToClass(ScrDto, req.body);
          const id: string = await Service.create(topic, scr, tenant);
          res.status(201).send(id);
        } catch (e) {
          res.status(404).send(e.message);
        }
      }
    );

    router.put(
      "/scrs/:topic/:id",
      async (req: express.Request, res: express.Response) => {
        try {
          const tenant: string = "noauthtest";
          const topic: string = req.params.topic.toLowerCase();
          const id: string = req.params.id;
          const scr = plainToClass(ScrDto, req.body);
          await Service.update(topic, id, scr, tenant);
          res.sendStatus(200);
        } catch (e) {
          res.status(500).send(e.message);
        }
      }
    );

    server.use("/", router);
  }
}

export default Router;
