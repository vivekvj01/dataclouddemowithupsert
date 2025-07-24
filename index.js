const express = require('express');
const bodyParser = require('body-parser');
const applink = require('@heroku/applink');
const axios = require('axios');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = express();
const port = process.env.PORT || 3000;
app.locals.sdk = applink.init();
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Data Cloud Demo App is running.');
});

app.post('/api/individual', async (request, res) => {
    const { firstName, lastName } = request.body;

    if (!firstName || !lastName) {
        return res.status(400).json({ error: 'First name and last name are required' });
    }

    try {
        const authName = process.env.DATA_CLOUD_ORG_DEVELOPER_NAME;
        const appLinkAddon = request.app.locals.sdk.addons.applink;
        const org = await appLinkAddon.getAuthorization(authName);

        const result = await org.dataCloudApi.upsert('ssot__Individual__dlm', {
            data: [{
                ssot__FirstName__c: firstName,
                ssot__LastName__c: lastName
            }]
        });

        res.json(result);
    } catch (error) {
        console.error('Error upserting to Data Cloud:', error);
        res.status(500).json({ error: 'Failed to create individual in Data Cloud' });
    }
});

/**
 * @param {import('express').Request} request
 * @param {import('express').Response} res
 */
app.post('/api/bookings', async (request, res) => {
    const { guestName } = request.body;
    if (!guestName) {
        return res.status(400).json({ error: 'Guest name is required' });
    }
    try {
        const authName = process.env.DATA_CLOUD_ORG_DEVELOPER_NAME;
        const appLinkAddon = request.app.locals.sdk.addons.applink;
        const org = await appLinkAddon.getAuthorization(authName);
        //org.accessToken
        //org.domainUrl
        const query = `SELECT Rate_Plan__c , Number_of_Adults__c ,Room_Number__c , Room_Type__c Type, ssot__TitleName__c  FROM "Reservation__dlm" JOIN "ssot__Individual__dlm" ON "Reservation__dlm"."Contact_ID__c" = "ssot__Individual__dlm"."ssot__Id__c" WHERE ( "ssot__Individual__dlm"."ssot__FirstName__c" || ' ' || "ssot__Individual__dlm"."ssot__LastName__c" ) = '${guestName}'`;
        // const result = await org.dataCloudApi.query(query); 
        console.log(org.dataCloudApi.domainUrl);
        console.log(org.dataCloudApi.accessToken);
        // Construct the direct API request as we have a bug with the SDK query method https://gus.lightning.force.com/lightning/_classic/%2Fa07EE00002IrZXXYA3
        const url = `${org.dataCloudApi.domainUrl}/api/v2/query`;
        const token = org.dataCloudApi.accessToken;
        const body = {
            sql: query
        };
        const response = await axios.post(url, body, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error querying Data Cloud:', error);
        res.status(500).json({ error: 'Failed to fetch bookings from Data Cloud' });
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
}); 