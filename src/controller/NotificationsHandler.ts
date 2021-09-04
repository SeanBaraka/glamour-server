export class NotificationsHandler {
    constructor() {}

    // Africastalking API integration.
    // first we send the notification messages
    private credentials = {
        apiKey: process.env.ATKEY,
        username: 'glamour'
    }

    private AfricasTalking = require('africastalking')(this.credentials);

    private SMS = this.AfricasTalking.SMS

    async sendMessage(recipients: any[], message: string): Promise<any> {
        const options = {
            // the numbers to send the message to
            to: recipients,
            // Set your message
            message: message,

            // Sms short code here
            // from: '111'
        }
    
        // sending the message from here
        const messageSent = await this.SMS.send(options)
        return messageSent
    }
}