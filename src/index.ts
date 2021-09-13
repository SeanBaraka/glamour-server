import "reflect-metadata";
import {createConnection, getMongoRepository } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Request, Response} from "express";
import {Routes} from "./routes";
import { pbkdf2Sync, randomBytes } from "crypto";
import * as cors from 'cors'
import { AuthUser } from "./entity/AuthUser";
import { AuthController } from "./controller/AuthController";

createConnection().then(async connection => {

    const authRepo = getMongoRepository(AuthUser)
    // create express app
    const app = express();
    app.use(bodyParser.json());
    app.use(cors());	
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


    // check if there exists an admin user
    const adminUsername = 'admin'
    const adminEmail = 'admin@glamour.com'
    const adminPass = 'admin12345'

    const admin = await authRepo.findOne({username: adminUsername})
    console.log(admin)
    if (admin === undefined) {
        const register = new AuthController()
        const admin = await register.prepareForRegister(adminUsername, adminEmail, adminPass)
        const registerAdmin = await authRepo.save(admin)
        if (registerAdmin) {
            console.log('>😎 admin user created')
        }
        
    }
    // start express server
    const port = process.env.PORT
    app.listen(port);

    console.log(`😎👊 Server started \nOpen http://localhost:${port}/`);

}).catch(error => console.log(error));
