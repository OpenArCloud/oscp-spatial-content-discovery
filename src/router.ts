import * as express from 'express'
import cors from 'cors'
import * as Service from "./service";
import { SCR } from "./scr.interface";

class Router {

    constructor(server: express.Express) {
        const router = express.Router()


        router.get("/scrs", async (req: express.Request, res: express.Response) => {
          
          try {
            const bbox: string = String(req.query.bbox);
            const scrs: SCR[] = await Service.findBbox(bbox);

            res.status(200).send(scrs);
          } catch (e) {
            res.status(404).send(e.message);
          }
        });

        router.options('*', cors());
        server.use('/', router)
    }
}

export default Router;