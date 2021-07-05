import "reflect-metadata";
import {createConnection, getMongoRepository } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Request, Response} from "express";
import {Routes} from "./routes";
import { pbkdf2Sync, randomBytes } from "crypto";

createConnection().then(async connection => {

    // create express app
    const app = express();
    app.use(bodyParser.json());

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next);
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

            } else if (result !== null && result !== undefined) {
                res.json(result);
            }
        });
    });

    // start express server
    const port = process.env.PORT
    app.listen(port);

    console.log(`😎👊 Server started \nOpen http://localhost:${port}/`);

}).catch(error => console.log(error));
