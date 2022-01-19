import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, ObjectID, ObjectIdColumn, OneToOne} from "typeorm";

export enum Gender {
    MALE = 'male',
    FEMALE = 'female'
}

@Entity('our_customers')
export class Customer extends BaseEntity{
    @ObjectIdColumn()
    id: ObjectID

    @Column()
    firstname: String

    @Column()
    lastname: String

    @Column()
    telephone: String

    @Column()
    address: String

    @Column({
        type: "enum",
        enum: Gender
    })
    gender: Gender

}
