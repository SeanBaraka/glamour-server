import { getMongoRepository } from "typeorm"
import { Service } from "../entity/Service"
import { Attendant } from "../entity/Attendant"
import { Request, Response } from "express"
import { ServiceCost } from "../entity/ServiceCost"
import { AuthController } from "./AuthController"
import { AuthUser } from "../entity/AuthUser"
import { NotificationsHandler } from "./NotificationsHandler"
import { ReservationService } from "../entity/ReservationService"
import { OrderReservation } from "../entity/OrderReservation"

// used for the overall management of the various parts of the system
// i.e. customers, services, reservations, attendants e.t.c
export class ManagementController {
    private serviceRepo = getMongoRepository(Service)
    private attendantRepo = getMongoRepository(Attendant)
    private authRepo = getMongoRepository(AuthUser)
    private reservesRepo = getMongoRepository(ReservationService)
    private ordersRepo = getMongoRepository(OrderReservation)

    // get all customer details
    async servicesList(request: Request, response: Response) {
        const services = (await this.serviceRepo.find()).reverse()
        return services;
    }

    // get all stylists/attendants
    async attendantList(request: Request, response: Response) {
        const attendants = (await this.attendantRepo.find()).reverse()
        return attendants;
    }

    // register stylists into the system
    async registerStaff(request: Request, response: Response) {
        // kkkrrrrrr... let's do this..
        // get the request object from the request body
        const {
            firstname, lastname, gender, telephone,
            address, nationalId, emailAddress, avatar, services
        } = request.body

        // start by checking if one exists, matching some of the given records,
        // we use the nationalId for validation, its a compulsory field and it should be unique
        const attendantExists = await this.attendantRepo.findOne({ nationalId: nationalId })
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
        // upon adding anew member, create a user login entity for the staff member.
        const authController = new AuthController()

        // Generate a random password.
        const password = await this.generatePassword(8)

        const user = await authController.prepareForRegister(firstname, emailAddress, password)

        try {
            const addUser = await this.authRepo.insert(user)
            if (addUser) {
                // send a notification message to the user informing them of account creation
                const notificationHandler = new NotificationsHandler()
                const tel = '+254'+telephone.slice(1)
                const sendMessage = await notificationHandler.sendMessage([tel], `A new account has been created succesfully. Use your email address or firstname. Your password is ${password}. If you did not authorize this, kindly ignore this message.`)

                return {
                    message: 'a new member of staff has been added',
                    status: response.statusCode
                }
            }
        } catch (error) {
            return {
                status: error.code,
                message: error.message
            }
        }

    }

    async getAttendantReservations(request: Request, response: Response) {
        const {attendantId} = request.body
        const orders = await this.ordersRepo.find()
        const reservations = []
        // get the matching attendant
        const attendant = await this.attendantRepo.findOne({nationalId: attendantId})
        if (attendant !== undefined) {
            // if an attendant matching the given record exists
            orders.forEach(order => {
                order.services.forEach(service => {
                    if (service.attendant.nationalId === attendant.nationalId) {
                        const reserveObj = {
                            customer: order.customer,
                            startTime: service.startTime,
                            endTime: service.endTime,
                            service: service.service,
                            status: 'completed'
                        }
                        reservations.push(reserveObj)
                    }
                });
            });
            return reservations
        }
        // return attendant
    }


    // add services
    async registerService(request: Request, response: Response) {
        // now we create services..
        // we have the service name and costing options
        // retrieve the values from the request body
        const { category, name, price, costItems } = request.body
        console.log(category, name, price);

        const service = await this.serviceRepo.findOne({ name: name })
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

    /**
     * Generates a password for the user, with a mixture of uppercase, lower case and numbers
     * @param numberofChars the number of characters the password is to contain
     * @returns a string of characters
     */
    async generatePassword(numberofChars: number): Promise<string> {
        let password = ''
        // placeholder for the characters to be used for generating the password
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstiuvwxyz0123456789"
        const characterArray = []
        for (var i = 0; i < numberofChars; i ++) {
            characterArray.push(characters.charAt(Math.floor(Math.random() * characters.length)))
        }
        // join the characters in the character array
        password = characterArray.join("")
        return password
    }
}