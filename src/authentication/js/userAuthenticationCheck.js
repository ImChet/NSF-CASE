// Function to send log message to server
function sendLogToServer(message, level = 'info') {
    // Send a log message to the server using a POST request
    fetch('http://localhost:3000/client-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, level }),
    }).catch(error => console.error('Failed to send log to server:', error));
}

// Window onload event handler
window.onload = function () {
    // Send a log message to the server indicating the check for session ID
    console.log('Checking for session ID...', 'info'); // Added log

    const sessionId = localStorage.getItem('sessionId');

    if (!sessionId) {
        // If no session ID is found, log an error and redirect to the sign-in page
        console.log('No session ID found, redirecting to sign-in page...', 'warn'); // Added log
        console.log('Redirecting to sign-in page...', 'info'); // Added log
        window.location.href = '/src/authentication/html/signin.html';
        return;
    }

    // Send a log message to the server indicating the found session ID
    console.log('Session ID found: ' + sessionId, 'info'); // Added log
    console.log('Session ID found, starting session check with session ID: ' + sessionId, 'info');

    // Send a request to the server to verify the session for the user
    fetch('http://localhost:3000/verifySession', {
        method: 'GET',
        headers: { 'X-Session-ID': sessionId }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                console.log(`Error during session verification: ${text}`, 'error');
                throw new Error(`Session verification failed with status: ${response.status} and body: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.authenticated) {
            console.log('User is authenticated. Displaying content.', 'info');
            document.body.style.display = "block";
        } else {
            console.log('User not authenticated. Redirecting to signin.', 'warn');
            console.log('Redirecting to sign-in page...', 'info');
            window.location.href = '/src/authentication/html/signin.html';
        }
    })
    .catch(error => {
        console.log('Error during session verification process: ' + error.message, 'error');
        window.location.href = '/src/authentication/html/signin.html';
    });
};