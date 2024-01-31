// Function to send log message to server
function sendLogToServer(message, level = 'info') {
    // Send a log message to the server using a POST request
    fetch('http://localhost:3000/client-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, level}),
    }).catch(error => console.error('Failed to send log to server:', error));
}

// Window onload event handler
window.onload = function () {
    // Initialize Google accounts and render the sign-in button
    google.accounts.id.initialize({
        client_id: "398792302857-gj4s9331t22kljn6inunra5tblqlmmpe.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById("googleButton"),
        { theme: "filled_black", size: "large", text: "continue_with", click_listener: onGoogleSignInButtonClick }
    );
    // google.accounts.id.prompt();
}

// Function to handle Google sign-in button click
function onGoogleSignInButtonClick() {
    // sendLogToServer(); // You can add functionality here if needed
}

// Function to parse JWT token
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);}).join(''));
    return JSON.parse(jsonPayload);
}

// Function to handle Google credential response
function handleCredentialResponse(response) {
    sendLogToServer("Google Sign-In was successful. Received JWT ID token:", response.credential);
    fetch('http://localhost:3000/verifyToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
    })
    .then(response => {
        sendLogToServer("Received response from /verifyToken", response);
        if (!response.ok) {
            throw new Error('Network response was not ok, status: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        sendLogToServer("/verifyToken response data:", data);
        if (data.verified) {
            sendLogToServer('Token verified by server, proceeding to onSuccess');
            onSuccess(response, data); // Pass the data to onSuccess
        } else {
            throw new Error('Token verification failed on the server');
        }
    })
    .catch((error) => {
        console.error('Error during the token verification process:', error);
        onFailure(error);
    });
}

// Function to handle success after Google sign-in
function onSuccess(response, data) {
    const userInfo = parseJwt(response.credential);
    sendLogToServer('Google Sign-In successful. User info:', userInfo);
    sendLogToServer('Session ID received from server:', data.sessionId);
    localStorage.setItem('sessionId', data.sessionId);
    window.location.href = '/src/home/html/index.html';
}

// Function to handle failure after Google sign-in
function onFailure(error) {
    sendLogToServer('Error during sign in: ' + error.message);
    // Handle failure, e.g., redirect to a login error page or display an error message
}
