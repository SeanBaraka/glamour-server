import { getMongoRepository } from "typeorm"
import { Service } from "../entity/Service"
import { Attendant } from "../entity/Attendant"
import { Request, Response } from "express"
import { ServiceCost } from "../entity/ServiceCost"

// used for the overall management of the various parts of the system
// i.e. customers, services, reservations, attendants e.t.c
export class ManagementController {
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

    // register stylists into the system
    async registerStaff (request: Request, response: Response) {
        // kkkrrrrrr... let's do this..
        // get the request object from the request body
        const { 
            firstname, lastname, gender, telephone, 
            address, nationalId, emailAddress, avatar
        } = request.body

        // start by checking if one exists, matching some of the given records,
        // we use the nationalId for validation, its a compulsory field and it should be unique
        const attendantExists = await this.attendantRepo.findOne({nationalId: nationalId})
        if (attendantExists !== undefined) {
            return {
                error: 'sorry, a similar attendant is registered with the same ID number',
                status: 400
            }
        }
        // add a new record, and populate the values appropriately
        const newAttendant = new Attendant(firstname, lastname, gender)
        newAttendant.address = address
        newAttendant.emailAddress = emailAddress
        newAttendant.avatar = avatar
        newAttendant.nationalId = nationalId
        newAttendant.telephone = telephone

        // attempt to add 
        const addAttempt = await this.attendantRepo.save(newAttendant);
        if (addAttempt == undefined) {
            return {
                error: 'something occured and request could not be completed',
                status: response.statusCode
            }
        }
        return {
            message: 'a new member of staff has been added',
            status: response.statusCode
        }
    }


    // add services
    async registerService (request: Request, response: Response) {
        // now we create services..
        // we have the service name and costing options
        // retrieve the values from the request body
        const { category, name, price, costItems } = request.body
        console.log(category, name, price);
        
        const service = await this.serviceRepo.findOne({name: name})
        if (service === undefined) {
            const serviceToAdd = new Service(name, price, category)
            const costItemsList: any[] = Array.from(costItems)
            if (costItemsList.length > 0) {
                for (const costItem of costItemsList) {
                    const serviceCost = new ServiceCost(costItem.name, costItem.price)
                    serviceToAdd.costItems.push(serviceCost)
                }
            }

            // attempt to add the service
            try {
                const addAttempt = await this.serviceRepo.save(serviceToAdd);
                return {
                    message: 'a new service has been registered successfully',
                    status: 200
                }
            } catch (error) {
                return {
                    error: error,
                    status: response.statusCode
                }
            }
        } else {
            return {
                error: 'a similar service exists'
            }
        }
    }
}