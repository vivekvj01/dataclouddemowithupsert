const express = require('express');
const bodyParser = require('body-parser');
const dataCloudService = require('./data-cloud-service');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Data Cloud Demo App is running.');
});

app.post('/api/bookings', async (req, res) => {
    const { guestName } = req.body;

    if (!guestName) {
        return res.status(400).json({ error: 'Guest name is required' });
    }

    try {
        const query = `
            SELECT * 
            FROM Reservation__dlm 
            JOIN ssot__Individual__dlm ON Reservation__dlm.Contact_ID__c = ssot__Individual__dlm.ssot__Id__c
            WHERE ssot__Individual__dlm.ssot__FirstName__c || ' ' || ssot__Individual__dlm.ssot__LastName__c = '${guestName}'
        `;

        const result = await dataCloudService.query(query);
        res.json(result);
    } catch (error) {
        console.error('Error querying Data Cloud:', error);
        res.status(500).json({ error: 'Failed to fetch bookings from Data Cloud' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 