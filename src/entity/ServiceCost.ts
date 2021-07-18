import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

export class ServiceCost {
    @ObjectIdColumn()
    id: ObjectID

    @Column()
    item: string

    @Column()
    cost: number

    constructor(item: string, cost: number) {
        this.item = item,
        this.cost = cost
    }
}