const express = require('express');
const bodyParser = require('body-parser');
const { sdk } = require('@heroku/app-link');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(sdk());

app.get('/', (req, res) => {
    res.send('Data Cloud Demo App is running.');
});

app.post('/api/bookings', async (req, res) => {
    const { guestName } = req.body;
    const { logger, sdk } = req;

    if (!guestName) {
        return res.status(400).json({ error: 'Guest name is required' });
    }

    try {
        const orgName = process.env.DATA_CLOUD_ORG_DEVELOPER_NAME;
        const appLinkAddon = sdk.addons.applink;

        logger.info(`Getting '${orgName}' org connection from Heroku AppLink add-on...`);
        const org = await appLinkAddon.getAuthorization(orgName);

        const query = `
            SELECT * 
            FROM Reservation__dlm 
            JOIN ssot__Individual__dlm ON Reservation__dlm.Contact_ID__c = ssot__Individual__dlm.ssot__Id__c
            WHERE ssot__Individual__dlm.ssot__FirstName__c || ' ' || ssot__Individual__dlm.ssot__LastName__c = '${guestName}'
        `;
        
        logger.info(`Querying org '${orgName}' (${org.id}): ${query}`);
        const response = await org.dataApi.query(query);
        logger.info(`Query response: ${JSON.stringify(response.data || {})}`);
        res.json(response.data);
    } catch (error) {
        logger.error('Error querying Data Cloud:', error);
        res.status(500).json({ error: 'Failed to fetch bookings from Data Cloud' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 