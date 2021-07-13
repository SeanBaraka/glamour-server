import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity('attendants')
export class Attendant {
    @ObjectIdColumn()
    id: ObjectID

    @Column()
    firstname: string

    @Column()
    lastname: string

    @Column()
    gender: string

    @Column({ nullable: true})
    nationalId: string

    @Column({ nullable: true})
    address: string

    @Column({ nullable: true})
    telephone: string

    @Column({ nullable: true})
    emailAddress: string

    @Column({ nullable: true })
    avatar: string

    constructor(firstname: string, lastname: string, gender: string) {
        this.firstname = firstname
        this.lastname = lastname
        this.gender = gender
    }
}