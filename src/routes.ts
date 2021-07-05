import { CustomerController } from "./controller/CustomerController";

export const Routes = [
    {
        method: 'post',
        route: '/customers/register',
        controller: CustomerController,
        action: 'registerCustomer'
    }
];