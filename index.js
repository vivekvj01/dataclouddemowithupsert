const express = require('express');
const bodyParser = require('body-parser');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Data Cloud Demo App is running.');
});

app.post('/api/bookings', async (req, res) => {
    const { guestName } = req.body;
    const { logger, sdk } = req;
    logger.info('getting guest name' + guestName);

    if (!guestName) {
        return res.status(400).json({ error: 'Guest name is required' });
    }
logger.info('Getting before trying to query');

    try {
    logger.info('getting developer name ');
        const orgName = process.env.DATA_CLOUD_ORG_DEVELOPER_NAME;
        logger.info('gettomg SDK');
        const appLinkAddon = sdk.addons.applink;
        logger.info('gettomg SDK');
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