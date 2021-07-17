import { getMongoRepository } from "typeorm"
import { Service } from "../entity/Service"
import { Customer } from "../entity/Customer"
import { Attendant } from "../entity/Attendant"
import { Request, Response } from "express"

// used for the overall management of the various parts of the system
// i.e. customers, services, reservations, attendants e.t.c
export class ManagementController {
    private customerRepo = getMongoRepository(Customer)
    private serviceRepo = getMongoRepository(Service)
    private attendantRepo = getMongoRepository(Attendant)

    // get all customer details
    async servicesList(request: Request, response: Response) {
       const services = (await this.serviceRepo.find()).reverse()
       return services;
    }

    // get all stylists/attendants
    async attendantList (request: Request, response: Response) {
        const attendants = (await this.attendantRepo.find()).reverse()
        return attendants;
    }
}