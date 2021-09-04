import { AuthController } from "./controller/AuthController";
import { CustomerController } from "./controller/CustomerController";
import { ManagementController } from "./controller/ManagementController";

export const Routes = [
    {
        method: 'post',
        route: '/auth/register/',
        controller: AuthController,
        action: 'registerUser'
    },
    {
        method: 'post',
        route: '/auth/login',
        controller: AuthController,
        action: 'loginUser'
    },
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
    },
    {
        method: 'post',
        route: '/customer/reservation/create',
        controller: CustomerController,
        action: 'createReservation'
    },
    {
        method: 'get',
        route: '/reservations/list',
        controller: CustomerController,
        action: 'getReservationList'
    },
    {
        method: 'get',
        route: '/staff/all',
        controller: ManagementController,
        action: 'attendantList'
    },
    {
        method: 'get',
        route: '/services/all',
        controller: ManagementController,
        action: 'servicesList'
    },
    {
        method: 'post',
        route: '/add/new/staff',
        controller: ManagementController,
        action: 'registerStaff'
    },
    {
        method: 'post',
        route: '/add/new/service',
        controller: ManagementController,
        action: 'registerService'
    }
];
