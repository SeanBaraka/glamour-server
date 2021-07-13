import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";
import { ServiceCost } from "./ServiceCost";

@Entity('services_offered')
export class Service {
    @ObjectIdColumn()
    id: ObjectID

    @Column()
    name: string

    @Column({ nullable: true})
    price: number

    @Column(type => ServiceCost)
    costItems: ServiceCost[]

    constructor(name: string, price: number) {
        this.name = name;
        this.price = price
    }
}