import { Column, Entity, getMongoRepository, ManyToOne, ObjectID, ObjectIdColumn } from "typeorm";
import { Customer } from "./Customer";
import { ReservationService } from "./ReservationService";
import { Service } from "./Service";

@Entity('reservation_orders')
export class OrderReservation {
    @ObjectIdColumn()
    id: ObjectID

    @Column(type => Customer)
    customer: Customer

    @Column(type => ReservationService)
    services: ReservationService[]

}