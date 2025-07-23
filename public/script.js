document.getElementById('searchButton').addEventListener('click', async () => {
    const guestName = document.getElementById('guestName').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Loading...';

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ guestName }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch bookings');
        }

        const result = await response.json();

        if (result.done === false || (result.data && result.data.length > 0)) {
            // Create a mapping from column order to column name
            const columnMap = {};
            for (const key in result.metadata) {
                columnMap[result.metadata[key].placeInOrder] = key;
            }
            const columns = Object.values(columnMap);

            // Mappings for prettier column headers
            const headerMappings = {
                'Rate_Plan__c': 'Plan',
                'Number_of_Adults__c': 'Number of Adults',
                'Room_Number__c': 'Room Number',
                'Room_Type__c': 'Type',
                'ssot__TitleName__c': 'Title',
                'ssot__FirstName__c': 'First Name',
                'ssot__LastName__c': 'Last Name',
                'Check_in_Date__c': 'Check-in Date',
                'Check_out_Date__c': 'Check-out Date',
                'Total_Price__c': 'Total Price',
                'Reservation_Status__c': 'Status'
            };

            // Convert array of arrays to array of objects
            const records = result.data.map(row => {
                const record = {};
                row.forEach((value, index) => {
                    record[columns[index]] = value;
                });
                return record;
            });

            // Generate an HTML table
            let html = '<h2>Bookings</h2><table><thead><tr>';
            columns.forEach(column => {
                const header = headerMappings[column] || column;
                html += `<th>${header}</th>`;
            });
            html += '</tr></thead><tbody>';

            records.forEach(record => {
                html += '<tr>';
                columns.forEach(column => {
                    html += `<td>${record[column] !== null ? record[column] : ''}</td>`;
                });
                html += '</tr>';
            });

            html += '</tbody></table>';
            resultsDiv.innerHTML = html;
        } else {
            resultsDiv.innerHTML = `No bookings found for ${guestName}`;
        }
    } catch (error) {
        resultsDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        console.error('Fetch error:', error);
    }
}); 