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

        if (data && data.data && data.data.length > 0) {
            const columns = data.metadata.columnNames;
            const records = data.data.map(row => {
                const record = {};
                columns.forEach((col, index) => {
                    record[col] = row[index];
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
        resultDiv.innerHTML = `Success: ${JSON.stringify(result, null, 2)}`;
    } catch (error) {
        resultDiv.innerHTML = `Error: ${error.message}`;
        console.error('Create individual error:', error);
    }
}); 