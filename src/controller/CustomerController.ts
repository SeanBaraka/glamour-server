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
            
        } catch (error: any) {
            console.log(error.message)
        }
    }
}