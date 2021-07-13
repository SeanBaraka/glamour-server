import { CustomerController } from "./controller/CustomerController";

export const Routes = [
    {
        method: 'post',
        route: '/customer/registration/',
        controller: CustomerController,
        action: 'registerCustomer'
    },
    {
        method: 'post',
        route: '/customer/search',
        controller: CustomerController,
        action: 'getCustomer'
    },
    {
        method: 'get',
        route: '/customer/list',
        controller: CustomerController,
        action: 'getAll'
    }
];
