const express = require('express');
const bodyParser = require('body-parser');
const applink = require('@heroku/applink');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

        const sourceName = 'Heroku'; // The name of the Ingestion API source connector
        const objectName = 'HerokuIndividual'; // Using the compliant object name from the schema
        const url = `${org.dataCloudApi.domainUrl}/api/v1/ingest/sources/${sourceName}/${objectName}`;
        const token = org.dataCloudApi.accessToken;

        const eventId = uuidv4();
        const eventTime = new Date().toISOString();

        const body = {
            data: [{
                FirstName: firstName, // Using compliant field name
                LastName: lastName, // Using compliant field name
                eventId: eventId,
                dateTime: eventTime,
                deviceId: 'Heroku-WebApp', // Static value for server-side events
                eventType: 'ProfileUpdate', // Custom event type
                category: 'Profile', // Should be 'Profile' for this DLO
                sessionId: eventId // Using eventId as a unique session for this event
            }]
        };

        const bodyAsString = JSON.stringify(body);

        console.log('Ingestion API Body:', bodyAsString);

        // Step 1: Ingest the data
        await axios.post(url, bodyAsString, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Wait 30 seconds for data to become available before the first check
        console.log('Ingestion request sent. Waiting 30 seconds before first query attempt...');
        await sleep(40000);

        // Step 2: Poll for the data to confirm it was written
        console.log('Polling for data...');
        const queryUrl = `${org.dataCloudApi.domainUrl}/api/v2/query`;
        const query = `SELECT * FROM "ssot__Individual__dlm" WHERE "ssot__Id__c" = '${eventId}' LIMIT 1`;
        console.log('Confirmation Query:', query);

        const queryBody = { sql: query };
        let queryResponse;
        let attempts = 0;
        const maxAttempts = 15; // 15 attempts * 20 seconds = 5 minutes
        let dataFound = false;
        let successfulResponseData = null;

        while (attempts < maxAttempts && !dataFound) {
            attempts++;
            console.log(`Query attempt ${attempts}...`);
            try {
                queryResponse = await axios.post(queryUrl, queryBody, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (queryResponse.data && queryResponse.data.rowCount > 0) {
                    console.log('Data found!');
                    successfulResponseData = queryResponse.data;
                    dataFound = true; // Exit loop
                }
            } catch (pollError) {
                console.error(`Attempt ${attempts} failed:`, pollError.message);
                // Don't exit, just log the error and wait for the next attempt
            }

            if (!dataFound && attempts < maxAttempts) {
                console.log('Data not found, waiting 20 seconds...');
                await sleep(20000); // Wait 20 seconds
            }
        }

        if (dataFound) {
            res.json(successfulResponseData);
        } else {
            console.error('Polling timed out after 5 minutes.');
            res.status(408).json({ error: 'Confirmation query timed out. The data was ingested but could not be retrieved in time.' });
        }
    } catch (error) {
        console.error('Error in upsert/query process:', error);
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
        const query = `SELECT Rate_Plan__c , Number_of_Adults__c ,Room_Number__c , Room_Type__c Type, ssot__TitleName__c  FROM "Reservation__dlm" JOIN "ssot__Individual__dlm" ON "Reservation__dlm"."Contact_ID__c" = "ssot__Individual__dlm"."ssot__Id__c" WHERE ( "ssot__Individual__dlm"."ssot__FirstName__c" || ' ' || "ssot__Individual__dlm"."ssot__LastName__c" ) like '${guestName}'`;
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