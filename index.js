const express = require('express');
const bodyParser = require('body-parser');
const applink = require('@heroku/applink');
const axios = require('axios');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = express();
const port = process.env.PORT || 3000;

// Initialize the AppLink SDK and attach it to app.locals
app.locals.sdk = applink.init();

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Data Cloud Demo App is running.');
});

/**
 * @param {import('express').Request} request
 * @param {import('express').Response} res
 */
app.post('/api/bookings', async (request, res) => {
    const { guestName } = request.body;
    console.log('getting guest name: ' + guestName);

    if (!guestName) {
        return res.status(400).json({ error: 'Guest name is required' });
    }
    console.log('Getting before trying to query');

    try {
        console.log('getting developer name');
        const orgName = process.env.DATA_CLOUD_ORG_DEVELOPER_NAME;
        console.log('getting SDK');
        // Access the SDK from app.locals
        const appLinkAddon = request.app.locals.sdk.addons.applink;
        console.log('got the SDK');
        console.log(`Getting '${orgName}' org connection from Heroku AppLink add-on...`);
        const org = await appLinkAddon.getAuthorization(orgName);
        console.log('got the Authorization:', org);

        const query = `SELECT Rate_Plan__c , Number_of_Adults__c  ,Room_Number__c , Room_Type__c Type, ssot__TitleName__c  FROM "Reservation__dlm" JOIN "ssot__Individual__dlm" ON "Reservation__dlm"."Contact_ID__c" = "ssot__Individual__dlm"."ssot__Id__c" WHERE ( "ssot__Individual__dlm"."ssot__FirstName__c" || ' ' || "ssot__Individual__dlm"."ssot__LastName__c" ) = '${guestName}'`;

        console.log('Executing query:', query);

        // Construct the direct API request
        const url = `${org.dataCloudApi.domainUrl}/api/v2/query`;
        const token = org.dataCloudApi.accessToken;
        const body = {
            sql: query
        };
        console.log('Direct API Call URL:', url);
        console.log('Direct API Call Token:', token);
        console.log('Direct API Call Body:', body);

        const response = await axios.post(url, body, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Direct API response: ${JSON.stringify(response.data)}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error querying Data Cloud:', error);
        res.status(500).json({ error: 'Failed to fetch bookings from Data Cloud' });
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
}); 