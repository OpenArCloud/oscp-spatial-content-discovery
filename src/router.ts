import * as express from "express";
import cors from "cors";
import * as Service from "./service";
import { Scr } from "./models/scr.interface";
import { ScrDto } from "./models/scr.dto";
import { checkJwt } from "./middleware/authz.middleware";

const jwtAuthz = require("express-jwt-authz");

class Router {
  constructor(server: express.Express) {
    const router = express.Router();

    router.get(
      "/scrs/:id",
      async (req: express.Request, res: express.Response) => {
        try {
          const id: string = String(req.params.id);
          const scr: Scr = await Service.find(id);
          res.status(200).send(scr);
        } catch (e) {
          res.status(404).send(e.message);
        }
      }
    );

    router.delete(
      "/scrs/:id",
      // checkJwt,
      // jwtAuthz(["delete:scrs"]),
      async (req: express.Request, res: express.Response) => {
        try {
          const id: string = String(req.params.id);
          await Service.remove(id);
          res.sendStatus(200);
        } catch (e) {
          res.status(500).send(e.message);
        }
      }
    );

    router.get("/scrs", async (req: express.Request, res: express.Response) => {
      try {
        const bbox: string = String(req.query.bbox);
        const scrs: Scr[] = await Service.findBbox(bbox);
        res.status(200).send(scrs);
      } catch (e) {
        res.status(404).send(e.message);
      }
    });

    router.post(
      "/scrs",
      // checkJwt,
      // jwtAuthz(["create:scrs"]),
      async (req: express.Request, res: express.Response) => {
        try {
          let scr = new ScrDto();
          Object.assign(scr, req.body);
          const id: string = await Service.create(scr);
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
