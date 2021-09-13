import { pbkdf2Sync, randomBytes } from "crypto";
import { Request, Response } from "express";
import { getMongoRepository } from "typeorm";
import { AuthUser } from "../entity/AuthUser";
import * as jwt from 'jsonwebtoken';
import { Attendant } from "../entity/Attendant";

export class AuthController {
    constructor() { }

    // The authentication controller. Will be responsible for the overall authetnication processes for the app. at branch level.
    // 1. Create user login and registration routes
    // 2. Handle the user login and registration
    // 3. Notify users of a new registration with a randomly generated password
    // 4. Handle JWT tokens for use on the client side. Possibly implement refresh tokens to allow for remember me options.

    // first things first, initialize requiered properties
    private authRepo = getMongoRepository(AuthUser)
    private attendantRepo = getMongoRepository(Attendant)

    async registerUser(request: Request, res: Response) {
        // get the registration object from the request body
        const { username, email, password } = request.body

        const user = await this.prepareForRegister(username, email, password)

        try {
            // attempt to register the user
            const saveuser = await this.authRepo.insertOne(user)
            if (saveuser.insertedCount > 0) {
                // the insertion was a success
                const response = {
                    status: 200,
                    message: `Nice!! A new user has been successfully created.`
                }
                res.send(response)
            }
        } catch (error) {
            // an error occured and we need to log it to avoid breaking the code
            const response = {
                status: 400,
                message: error.message
            }
            res.status(400).send(response)
        }
    }

    /** */
    async loginUser(req: Request, res: Response) {
        // 1. Get the login info of the user
        // 2. Compare with stored records to find a match either of the username or email
        // 3. Get the salt of the stored auth record
        // 4. Compare the password if they are a mactch, generate a JWT token for the user

        // get the login parameters from the request
        const { loginparam, password } = req.body


        // from the login parameters, try to identify the user
        try {
            const findByEmail = await this.authRepo.findOne({ email: loginparam })
            if (findByEmail !== undefined) {
                // a user was found matching the parameters, which in this case was the email address
                const authenticated = await this.authenticateUser(password, findByEmail)
                if (authenticated) {
                    // if the user is authenticated successfully, generate a jwt token and send it to the user
                    const token = await this.generateToken(findByEmail)

                    const response = {
                        status: 200,
                        token: token,
                        message: "Nice!! You have been successfully logged in."
                    }
                    res.status(200).send(response)
                } else {
                    const incorrectPassword = {
                        status: 400,
                        message: "Oops!! You entered an incorrect password"
                    }
                    res.status(400).send(incorrectPassword)
                }
            } else {
                // attempt to find the user by using the username
                const findByUsername = await this.authRepo.findOne({ username: loginparam })
                const authenticated = await this.authenticateUser(password, findByUsername)
                if (authenticated) {
                    const token = await this.generateToken(findByUsername)
                    const response = {
                        status: 200,
                        token: token,
                        message: 'Nice!! You have been successfully logged in.'
                    }
                    res.status(200).send(response)
                } else {
                    const incorrectPassword = {
                        status: 400,
                        message: "Oops!! You entered an incorrect password"
                    }
                    res.status(400).send(incorrectPassword)
                }
            }

        } catch (error) {
            // an error was received and needs to be logged in 
            // if a user is not found matching both the email and username
            const notFound = {
                status: 404,
                message: "A user matching the given credentials was not found"
            }
            // return a user not found message
            res.status(404).send(notFound)
        }
    }

    async getUserInfo(request: Request, res: Response) {
        const authHeader = request.headers.authorization
        const token = authHeader.split(' ')[1]
        const decodedData = jwt.decode(token)
        const username = decodedData.data

        // attempt to find the user based on the username
        const user = await this.authRepo.findOne({username: username})
        if (user !== undefined) {
            const attendantInfo = await this.attendantRepo.findOne({emailAddress: user.email})
            const userdata = {
                email: user.email,
                telephone: attendantInfo.telephone,
                id: attendantInfo.nationalId,
                gender: attendantInfo.gender,
                firstname: attendantInfo.firstname,
                lastname: attendantInfo.lastname 
            }
            return userdata;
        }
    }


    /**
     * Authenticates a given user using their password
     * @param password a string value of the password
     * @param user the user object already stored 
     * @returns a boolean value after validating the password passed and the user's password
     */
    async authenticateUser(password: string, user: AuthUser): Promise<boolean> {
        // attempt to authenticate the user with the given password
        // 1. We will recreate the password, and hope it returns the stored hash
        // 2. IF the generated password does not match the stored one, then return false else true

        const storedHash = user.passwordHash
        const storedSalt = user.salt
        // attempt to recreate the password hash
        const newHash = pbkdf2Sync(password, storedSalt, 1000, 32, 'SHA512').toString('hex')

        // compare the two hashes and return the value
        return newHash == storedHash
    }


    /**
     * Generates a JWT token based on the users information provided
     * @param user the user object that will be assigned a token
     * @returns a signed JWT token
     */
    async generateToken(user: AuthUser): Promise<any> {
        // Generate the user token
        return jwt.sign({data:user.username,secure:randomBytes(32).toString('hex')}, process.env.JWTSECRET)
    }

    /**
     * Prepares user data for registration.
     * @param username username
     * @param email email address
     * @param password password
     * @returns a AuthUser object ready for registration
     */
    async prepareForRegister(username: string, email: string, password: string): Promise<AuthUser> {
        // encrypt the password
        const salt = randomBytes(32).toString('hex')
        const hash = pbkdf2Sync(password, salt, 1000, 32, 'SHA512').toString('hex')

        // create the auth user object
        const user = new AuthUser()
        user.username = username
        user.email = email
        user.salt = salt
        user.passwordHash = hash

        return user;
    }
}