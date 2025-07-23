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
    const { sdk } = req;
    console.log('getting guest name: ' + guestName);

    if (!guestName) {
        return res.status(400).json({ error: 'Guest name is required' });
    }
    console.log('Getting before trying to query');

    try {
        console.log('getting developer name');
        const orgName = process.env.DATA_CLOUD_ORG_DEVELOPER_NAME;
        console.log('getting SDK');
        const appLinkAddon = request.sdk.addons.applink;
        console.log('got the SDK');
        console.log(`Getting '${orgName}' org connection from Heroku AppLink add-on...`);
        const org = await appLinkAddon.getAuthorization(orgName);

        const query = `
            SELECT * 
            FROM Reservation__dlm 
            JOIN ssot__Individual__dlm ON Reservation__dlm.Contact_ID__c = ssot__Individual__dlm.ssot__Id__c
            WHERE ssot__Individual__dlm.ssot__FirstName__c || ' ' || ssot__Individual__dlm.ssot__LastName__c = '${guestName}'
        `;

        const response = await org.dataCloudApi.query(query);
        console.log(`Query response: ${JSON.stringify(response)}`);
        res.json(response);
    } catch (error) {
        console.error('Error querying Data Cloud:', error);
        res.status(500).json({ error: 'Failed to fetch bookings from Data Cloud' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 