import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";
import { Attendant } from "./Attendant";
import { Service } from "./Service";

export enum ReservationStatus {
    PENDING = 0,
    COMPLETED = 1,
    CANCELLED = 2
}

@Entity('reservation_services')
export class ReservationService {
    @ObjectIdColumn()
    id: ObjectID

    @Column(type => Attendant)
    attendant: Attendant

    @Column()
    date: Date

    @Column()
    service: string

    @Column()
    startTime: string

    @Column()
    endTime: string

    @Column({default: ReservationStatus.PENDING})
    status: number

    constructor (attendant: Attendant, date: Date, service: string, startTime: string, endTime: string) {
        this.attendant = attendant
        this.date = date
        this.service = service
        this.startTime = startTime
        this.endTime = endTime
    }
}