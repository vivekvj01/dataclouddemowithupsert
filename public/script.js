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

        const data = await response.json();
        
        if (data.records && data.records.length > 0) {
            let html = '<h2>Bookings</h2><ul>';
            data.records.forEach(record => {
                html += `<li>${JSON.stringify(record)}</li>`;
            });
            html += '</ul>';
            resultsDiv.innerHTML = html;
        } else {
            resultsDiv.innerHTML = 'No bookings found for this guest.';
        }
    } catch (error) {
        resultsDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}); 