import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity('user_logins')
export class AuthUser {
    @ObjectIdColumn()
    id: ObjectID

    @Column()
    email: string

    @Column()
    username: string

    @Column()
    salt: string

    @Column("text")
    passwordHash: string

    @Column({default: true})
    isActive: boolean
}