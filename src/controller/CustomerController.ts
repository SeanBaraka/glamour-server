import { Request, Response } from "express";
import { getMongoRepository } from "typeorm";
import { Customer } from "../entity/Customer";

export class CustomerController {
    
    // initialize the database repositories needed
    private customerRepo = getMongoRepository(Customer)

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
                firstname: param
            }
        })

        if (findByFirstName !== undefined) {
            return findByFirstName
        } else {
            const findByLastName = await this.customerRepo.findOne({
                where: {
                    lastname: param
                }
            });
            // if a match for the last name is found,
            if (findByLastName !== undefined) {
                return findByLastName;
            } else {
                // assumming that neither the firstname or lastnames match,
                // we should try the full name
                const allCustomers = await this.customerRepo.find();
                console.log(allCustomers)
               // const desiredCustomer = allCustomers.find(customer => customer.firstname.includes(param) || customer.lastname.includes(param));
		const validCustomers = allCustomers.filter(x => x.firstname !== '' && x.lastname !== '')
		const desiredCustomer = validCustomers.find(cust => cust.firstname.includes(param) || cust.lastname.includes(param))
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
            console.log(addAttempt);
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
        //
    }
}
