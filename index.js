const express = require('express');
const bodyParser = require('body-parser');
const applink = require('@heroku/applink');

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
        console.log('got the Authorization:', org.dataCloudApi.accessToken);
        const query = "SELECT * FROM Reservation__dll LIMIT 10";

        console.log('Executing query:', query);

        console.log('org.dataCloudApi:', org.dataCloudApi);
        const response = await org.DataApi.query(query);
        console.log(`Query response: ${JSON.stringify(response)}`);
        res.json(response);
    } catch (error) {
        console.error('Error querying Data Cloud:', error);
        res.status(500).json({ error: 'Failed to fetch bookings from Data Cloud' });
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
}); 