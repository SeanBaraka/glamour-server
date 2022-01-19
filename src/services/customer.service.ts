import { Customer } from "../entity/Customer";

export async function getCustomerByPhone(phone: string) {
    return await Customer.findOne({
        where: {
            telephone: {$regex: phone, $options: '$i'}
        }
    })
}