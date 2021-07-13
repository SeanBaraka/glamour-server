import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity('service_costing')
export class ServiceCost {
    @ObjectIdColumn()
    id: ObjectID

    @Column()
    item: string

    @Column()
    cost: number
}