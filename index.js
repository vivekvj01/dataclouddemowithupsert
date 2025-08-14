const express = require('express');
const bodyParser = require('body-parser');
const applink = require('@heroku/applink');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const app = express();
const port = process.env.APP_PORT || process.env.PORT || 3000;
app.locals.sdk = applink.init();
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Data Cloud Demo App is running.');
});

// Step 1: Start the ingestion and return an eventId immediately
app.post('/api/individual', async (request, res) => {
    const { firstName, lastName } = request.body;
    if (!firstName || !lastName) {
        return res.status(400).json({ error: 'First name and last name are required' });
    }

    try {
        const authName = process.env.DATA_CLOUD_ORG_DEVELOPER_NAME;
        
        const appLinkAddon = request.app.locals.sdk.addons.applink;
        const org = await appLinkAddon.getAuthorization(authName);

        const sourceName = 'Heroku';
        const objectName = 'HerokuIndividual';
        const url = `${org.dataCloudApi.domainUrl}/api/v1/ingest/sources/${sourceName}/${objectName}`;
        const token = org.dataCloudApi.accessToken;
        const eventId = uuidv4();
        const eventTime = new Date().toISOString();

        const body = {
            data: [{
                FirstName: firstName,
                LastName: lastName,
                eventId: eventId,
                dateTime: eventTime,
                deviceId: 'Heroku-WebApp',
                eventType: 'ProfileUpdate',
                category: 'Profile',
                sessionId: eventId
            }]
        };
        const bodyAsString = JSON.stringify(body);

        // Fire and forget the ingestion request. We are not waiting for it here.
        axios.post(url, bodyAsString, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).catch(err => {
            // Log errors on the server, but don't block the client response
            console.error('Ingestion API error:', err.message);
        });

        // Immediately respond to the client with the eventId for polling
        res.json({ eventId: eventId });

    } catch (error) {
        console.error('Error starting ingestion process:', error);
        res.status(500).json({ error: 'Failed to start the ingestion process.' });
    }
});

// Step 2: New endpoint for the client to poll for status
app.get('/api/individual/status/:eventId', async (request, res) => {
    const { eventId } = request.params;
    try {
        const authName = process.env.DATA_CLOUD_ORG_DEVELOPER_NAME;
        const appLinkAddon = request.app.locals.sdk.addons.applink;
        const org = await appLinkAddon.getAuthorization(authName);

        const queryUrl = `${org.dataCloudApi.domainUrl}/api/v2/query`;
        const token = org.dataCloudApi.accessToken;
        const query = `SELECT * FROM "ssot__Individual__dlm" WHERE "ssot__Id__c" = '${eventId}' LIMIT 1`;
        
        const queryBody = { sql: query };
        
        const queryResponse = await axios.post(queryUrl, queryBody, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(queryResponse.data);
    } catch (error) {
        console.error(`Error querying status for eventId ${eventId}:`, error.message);
        res.status(500).json({ error: 'Failed to query status.' });
    }
});

app.post('/api/bulk/create-job', async (request, res) => {
    try {
        const authName = process.env.DATA_CLOUD_ORG_DEVELOPER_NAME;
        const appLinkAddon = request.app.locals.sdk.addons.applink;
        const org = await appLinkAddon.getAuthorization(authName);

        const url = `${org.dataCloudApi.domainUrl}/api/v1/ingest/jobs`;
        const token = org.dataCloudApi.accessToken;
        const body = {
            object: "HerokuIndividual",
            operation: "upsert",
            sourceName: "Heroku"
        };

        const response = await axios.post(url, body, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error creating bulk job:', error);
        res.status(500).json({ error: 'Failed to create bulk job.' });
    }
});

app.put('/api/bulk/upload-csv/:jobId', upload.single('csvFile'), async (request, res) => {
    const { jobId } = request.params;
    if (!request.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
        const authName = process.env.DATA_CLOUD_ORG_DEVELOPER_NAME;
        const appLinkAddon = request.app.locals.sdk.addons.applink;
        const org = await appLinkAddon.getAuthorization(authName);

        const url = `${org.dataCloudApi.domainUrl}/api/v1/ingest/jobs/${jobId}/batches`;
        const token = org.dataCloudApi.accessToken;

        const response = await axios.put(url, request.file.buffer, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/csv'
            }
        });

        res.status(response.status).json({ message: 'CSV uploaded successfully.' });
    } catch (error) {
        console.error('Error uploading CSV:', error);
        res.status(500).json({ error: 'Failed to upload CSV.' });
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
        console.log(authName);
        const org = await appLinkAddon.getAuthorization(authName);
         
        //org.accessToken
        //org.domainUrl
        const query = `SELECT Rate_Plan__c , Number_of_Adults__c ,Room_Number__c , Room_Type__c Type, ssot__TitleName__c  FROM "Reservation__dlm" JOIN "ssot__Individual__dlm" ON "Reservation__dlm"."Contact_ID__c" = "ssot__Individual__dlm"."ssot__Id__c" WHERE ( "ssot__Individual__dlm"."ssot__FirstName__c" || ' ' || "ssot__Individual__dlm"."ssot__LastName__c" ) like '${guestName}'`;
        // const result = await org.dataCloudApi.query(query); 
        console.log(org.dataCloudApi.domainUrl);
        console.log(org.dataCloudApi.accessToken);
        // Construct the direct API request as we have a bug with the SDK query method https://gus.lightning.force.com/lightning/_classic/%2Fa07EE00002IrZXXYA3
       // const result = await org.dataCloudApi.query(query); 
        
        //res.json(result);
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
