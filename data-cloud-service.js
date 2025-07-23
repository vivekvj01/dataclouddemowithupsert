const { Salesforce } = require('@heroku/salesforce-sdk');

class DataCloudService {
    constructor() {
        this.dataCloud = null;
    }

    async init() {
        if (process.env.NODE_ENV === 'production') {
            // In a Heroku environment, AppLink will provide the necessary configuration
            this.dataCloud = await Salesforce.init();
        } else {
            // For local development, use credentials from a .env file
            require('dotenv').config();
            this.dataCloud = new Salesforce({
                loginUrl: process.env.SF_LOGIN_URL,
                username: process.env.SF_USERNAME,
                password: process.env.SF_PASSWORD,
                clientId: process.env.SF_CLIENT_ID,
                clientSecret: process.env.SF_CLIENT_SECRET,
            });
            await this.dataCloud.login();
        }
    }

    async query(queryString) {
        if (!this.dataCloud) {
            await this.init();
        }
        return this.dataCloud.query(queryString);
    }
}

module.exports = new DataCloudService(); 