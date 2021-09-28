import { Request, Response } from "express";
import { getMongoRepository } from "typeorm";
import { Attendant } from "../entity/Attendant";
import { Customer } from "../entity/Customer";
import { OrderReservation } from "../entity/OrderReservation";
import { ReservationService, ReservationStatus } from "../entity/ReservationService";
import { Service } from "../entity/Service";
import { NotificationsHandler } from "./NotificationsHandler";

export class CustomerController {
    
    // initialize the database repositories needed
    private customerRepo = getMongoRepository(Customer)
    private servicesRepo = getMongoRepository(Service)
    private attendantRepo = getMongoRepository(Attendant)
    private reserveServiceRepo = getMongoRepository(ReservationService)
    private reserveOrderRepo = getMongoRepository(OrderReservation)


    // get a list of all customers
    async getAll(request: Request, response: Response) {
        // this one is simple, just get all customers
        return this.customerRepo.find();
    }

    // get a single customer, meeting the given criteria
    async getCustomer(request: Request, response: Response) {
        const param = request.body.searchParam
        
        // we asssume the param is the name of the customer
        const findByFirstName = await this.customerRepo.findOne({
            where: {
                firstname: {$regex: param, $options: '$i'}
            }
        })

        if (findByFirstName !== undefined) {
            return findByFirstName
        } else {
            const findByLastName = await this.customerRepo.findOne({
                where: {
                    lastname: {$regex: param, $options: '$i'}
                }
            });
            // if a match for the last name is found,
            if (findByLastName !== undefined) {
                return findByLastName;
            } else {
                // assumming that neither the firstname or lastnames match,
                // we should try the full name
                const allCustomers = await this.customerRepo.find();
               // const desiredCustomer = allCustomers.find(customer => customer.firstname.includes(param) || customer.lastname.includes(param));
                const validCustomers = allCustomers.filter(x => x.firstname !== '' && x.lastname !== '')
                const desiredCustomer = validCustomers.find(cust => cust.firstname.toLowerCase().includes(param.toLowerCase()) || cust.lastname.toLowerCase().includes(param.toLowerCase()))
                if (desiredCustomer == undefined) {
                    return {
                        error: 'Customer Not Found',
                        message: 'customer does not exist',
                        status: 404
                    }
                } else {
                    return desiredCustomer
                }
            }
        }
    }

    async registerCustomer(request: Request, response: Response) {
        // we are adding a new customer record
        const newCustomer = new Customer()
        // populate the details from the request body object
        newCustomer.firstname = request.body.firstname
        newCustomer.lastname = request.body.lastname
        newCustomer.telephone = request.body.telephone
        newCustomer.address = request.body.address
        
        // attempt to add the customer
        try {
            const addAttempt = await this.customerRepo.insert(newCustomer) // add the record
            if (addAttempt) {
                const success  = {
                    "message": "new customer added successfully",
                    "status": 200
                }
                return success;
            }
            
        } catch (error) {
            console.log(error.message)
        }
    }

    async createReservation(request: Request, response: Response) {
        // create a reservation object
        const reservationRequest = request.body
        const reservation = new OrderReservation() // create a reservation instance

        const customerId = reservationRequest.customer
        const services: any[] = Array.from(reservationRequest.services)

        // find a customer associated with the reservation 
        const customer = await this.customerRepo.findOne(customerId)
        reservation.customer = customer // attach the customer to the reservation instance
        reservation.services = []

        // for each of the services selected, find if it exists on the database, else create an instance
        for await (const service of services) {
            // for each service from the request. create an instance of reservation service.
            // we will push this instance to the reservation object.
            // first, check if the attendant exists if not, create a new record
            let serviceAttendant = await this.attendantRepo.findOne({where: {firstname: service.attendant}})
            if (!serviceAttendant) {
                serviceAttendant = new Attendant(service.attendant, '', 'female')
                const addAttendant = await this.attendantRepo.save(serviceAttendant)
            }
            let reserveService = new ReservationService(serviceAttendant, service.date, service.order, service.startTime, service.endTime)
            // set the status to pending
            reserveService.status = ReservationStatus.PENDING
            const savedReservation = await this.reserveServiceRepo.save(reserveService)
            reservation.services.push(savedReservation) // add the reservation to the reservation object
        }
        const addReservationOrder = await this.reserveOrderRepo.save(reservation) // save the reservation order
        
        try {
            // after saving the reservation... notify the user that one has been created for them
            
            const telephone = '+254'+addReservationOrder.customer.telephone.slice(1)
            let date;
            let startTime = ''
            const services = []
            
            addReservationOrder.services.forEach((service, index) => {
                services.push(service.service)
                if (index === 0) {
                    date = service.date
                    startTime = service.startTime
                }
            })
            // attaching the services and coming up with a decent message
            const servicesList = services.join(', ')
            const hourMark = parseInt(startTime.split(':')[0])
            let timeOfDay = ''
            hourMark < 12 ? timeOfDay = `${startTime} AM` : timeOfDay = `${hourMark - 12} PM`
            const hourMarkMinus = hourMark - 12
            if (hourMarkMinus == 0) timeOfDay = `12 PM`
            const messageOptions = {
                recipients: [telephone],
                message: `Hello ${addReservationOrder.customer.firstname}, Your reservation has been scheduled at ${timeOfDay} on ${date}. Please be at GLAMOUR before ${timeOfDay} for ${servicesList}`
            }
            const notification = new NotificationsHandler()
            const sendMessage = await notification.sendMessage(messageOptions.recipients, messageOptions.message)
            const successMessage = {
                message: 'Reservations Created Successfully',
                status: 200,
                details: {
                    customer: addReservationOrder.customer.firstname
                }
            }
            return successMessage
        } catch(error) {
            console.log(error)
            const errorMessage = {
                message: 'Error'
            }
            return errorMessage;
        }
        
    }

    async getReservationList(request: Request, response: Response) {
        // uhm, where do we start
        const reserveList = (await this.reserveOrderRepo.find()).reverse()
        return reserveList
    }

}
