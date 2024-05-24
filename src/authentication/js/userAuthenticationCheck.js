const DEBUG = true;
// ALL console.log is being sent to browser development console, not server console. Be careful in sending important information to console.


// Function to send log message to server
function sendLogToServer(message, level = 'info') {
    // Send a log message to the server using a POST request
    fetch('/client-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, level }),
    }).catch(error => console.error('Failed to send log to server:', error));
}

// Window onload event handler
window.onload = function () {
    // Send a log message to the server indicating the check for session ID
    console.log('Checking for session ID...'); // Added log. 

    const sessionId = localStorage.getItem('sessionId');

    if (DEBUG === true)
        console.log(`Found sessionId from localStorage to be: ${sessionId}`)

    if (!sessionId) {
        // We assume this is guest sign in mode
        console.log('Guest usage assumed'); // Added log
        document.getElementById("signInButton").style = "display: block";
        document.getElementById("signOutButton").style = "display: none";
        return;
    }
    
    // Send a log message to the server indicating the found session ID
    console.log('Session ID found: ' + sessionId); // Added log
    console.log('Session ID found, starting session check with session ID: ' + sessionId);

    // Send a request to the server to verify the session for the user
    fetch('/verifySession', {
        method: 'GET',
        headers: { 'x-session-id': sessionId }
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
            
            // Switch what is being displayed
            document.getElementById("signOutButton").style = "display: block";
            document.getElementById("signInButton").style = "display: none";
        } else {
            console.log('User not authenticated. Redirecting to signin.', 'warn');
        }
    })
    .catch(error => {
        console.log('Error during session verification process: ' + error.message, 'error');
    });
};
