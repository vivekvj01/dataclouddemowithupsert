function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.getElementById('search-form').addEventListener('submit', async (event) => {
    event.preventDefault();
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
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));

        if (data && data.data && data.data.length > 0) {
            // Create a mapping from column order to column name
            const columnMap = {};
            for (const key in data.metadata) {
                if (data.metadata[key].placeInOrder !== undefined) {
                    columnMap[data.metadata[key].placeInOrder] = key;
                }
            }
            const columns = Object.values(columnMap);

            // Convert array of arrays to array of objects
            const records = data.data.map(row => {
                const record = {};
                row.forEach((value, index) => {
                    record[columns[index]] = value;
                });
                return record;
            });

            let html = '<table><thead><tr>';
            columns.forEach(column => {
                html += `<th>${column}</th>`;
            });
            html += '</tr></thead><tbody>';

            records.forEach(record => {
                html += '<tr>';
                columns.forEach(column => {
                    let value = record[column];
                    // Format 'Number of Adults' to be an integer
                    if (column === 'Number_of_Adults__c' && value !== null) {
                        value = parseInt(value, 10);
                    }
                    html += `<td>${value !== null ? value : ''}</td>`;
                });
                html += '</tr>';
            });

            html += '</tbody></table>';
            resultsDiv.innerHTML = html;
        } else {
            resultsDiv.innerHTML = 'No bookings found for this guest.';
        }
    } catch (error) {
        resultsDiv.innerHTML = `Error: ${error.message}`;
        console.error('Fetch error:', error);
    }
});

document.getElementById('create-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const resultDiv = document.getElementById('create-result');
    resultDiv.innerHTML = 'Creating individual...';

    try {
        const response = await fetch('/api/individual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result && result.data && result.data.length > 0) {
            const resultDiv = document.getElementById('create-result');
            // Create a mapping from column order to column name
            const columnMap = {};
            for (const key in result.metadata) {
                if (result.metadata[key].placeInOrder !== undefined) {
                    columnMap[result.metadata[key].placeInOrder] = key;
                }
            }
            const columns = Object.values(columnMap);

            // Convert array of arrays to array of objects
            const records = result.data.map(row => {
                const record = {};
                row.forEach((value, index) => {
                    record[columns[index]] = value;
                });
                return record;
            });

            const displayColumns = {
                'ssot__FirstName__c': 'First Name',
                'ssot__LastName__c': 'Last Name',
                'ssot__ExternalSourceId__c': 'Source',
                'ssot__DataSourceObjectId__c': 'Data Source Object'
            };

            let html = '<h3>Individual Created/Updated Successfully</h3><table><thead><tr>';
            html += '<th>Status</th>'; // Header for the checkmark column
            Object.values(displayColumns).forEach(header => {
                html += `<th>${header}</th>`;
            });
            html += '</tr></thead><tbody>';

            records.forEach(record => {
                html += '<tr>';
                html += '<td style="color: green; font-size: 1.5rem; text-align: center;">✓</td>'; // Green checkmark
                Object.keys(displayColumns).forEach(columnKey => {
                    const value = record[columnKey];
                    html += `<td>${value !== null ? value : ''}</td>`;
                });
                html += '</tr>';
            });

            html += '</tbody></table>';
            resultDiv.innerHTML = html;
        } else {
            resultDiv.innerHTML = 'Individual created, but no data was returned from the confirmation query.';
        }

    } catch (error) {
        document.getElementById('create-result').innerHTML = `Error: ${error.message}`;
        console.error('Create individual error:', error);
    }
}); 