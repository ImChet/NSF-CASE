// Import required libraries and modules
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const winston = require('winston');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { stringify } = require('querystring');
const saltRounds = 10; // Adjust based on security requirements

process.env.TZ = 'UTC'; // UTC Time Zone

// Create an Express app
const app = express();
const client = new OAuth2Client("398792302857-gj4s9331t22kljn6inunra5tblqlmmpe.apps.googleusercontent.com");

const pool = mysql.createPool({
    host: 'localhost',
    user: 'CaseAdmin',
    password: 'CasePassword',
    database: 'CaseDB',
    port: 3307
});

// Database Logger Function
async function logToDatabase(logLevel, logMessage, additionalInfo = {}) {
    const logData = JSON.stringify({ level: logLevel, message: logMessage, ...additionalInfo });
    const logTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format current time for MySQL

    try {
        // Insert log entry without specifying log_id, as it's auto-incremented
        await pool.query('INSERT INTO Logs (log_time, log_data) VALUES (?, ?)', [logTime, logData]);
    } catch (error) {
        console.error('Error logging to database:', error);
    }
}


initializeDatabaseConnection = async () => {
       try {
        // Connect to the Database CaseDB
        await pool.query(`USE CaseDB;`);
        // Clear leftover Sessions from last spin-up to prevent conflicts
        await pool.query(`TRUNCATE Sessions;`);
        logToDatabase('info', 'Database connection successfull.')
    } catch (error) {
        logToDatabase('error', `Error connecting to the database: ${error}`)
        throw error;
    }
};



// Initialize the database and create the required table
initializeDatabaseConnection()
    .then(() => {
        // Start the server only after the database is initialized
        app.use(express.json());
        app.use(cors({ origin: 'http://localhost:5500', credentials: true }));

        // VerifyToken endpoint
        app.post('/verifyToken', async (req, res) => {
            const token = req.body.token;
            logToDatabase('info', `Received token for verification: ${token}`)
            try {
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: "398792302857-gj4s9331t22kljn6inunra5tblqlmmpe.apps.googleusercontent.com",
                });
                const payload = ticket.getPayload();
                
                logToDatabase('info', `Token verified successfully. UserId: ${payload['sub']}`)

                const [result] = await pool.query('INSERT INTO Sessions (userId, startedAt, expiresAt) VALUES (?, ?, ?)', [payload['sub'], new Date(Date.now()), new Date(Date.now() + 4 * 3600 * 1000)]); // 4 Hours
                const sessionId = result.insertId;
                logToDatabase('info', `SessionID created: ${sessionId}, for userId: ${payload['sub']}`)

                res.json({ verified: true, sessionId: sessionId });
            } catch (error) {
                logToDatabase('error', `Token verification failed: ${error}`)
                res.status(401).json({ verified: false, error: error.message });
            }
        });

        // VerifySession middleware
        const verifySession = async (req, res, next) => {
            const sessionId = req.headers['x-session-id'];
            if (!sessionId) {
                logToDatabase('warn', "Session ID required")
                return res.status(401).json({ message: 'Session ID required' });
            }
            // Log session ID being checked
            logToDatabase('info', `Checking session ID: ${sessionId}`)

            const [sessions] = await pool.query('SELECT * FROM Sessions WHERE sessionId = ? AND expiresAt > NOW()', [sessionId]);
            if (sessions.length === 0) {
                logToDatabase('warn', "Invalid or expired session")
                return res.status(401).json({ message: 'Invalid or expired session' });
            }
            logToDatabase('info', `Session verified successfully for sessionId: ${sessionId}`)
            next();
        };

        app.get('/verifySession', verifySession, (req, res) => {
            res.json({ authenticated: true });
        });

        // Function to check password complexity
        function isPasswordComplex(password) {
            // Complexity requirements logic
            // Example: Password must be at least 8 characters long and contain at least one letter and one digit.
            const minLength = 8;
            const hasLetter = /[a-zA-Z]/.test(password);
            const hasDigit = /\d/.test(password);

            return password.length >= minLength && hasLetter && hasDigit;
        }

        // Non-Google Register Endpoint
        app.post('/register', async (req, res) => {
            const { username, password } = req.body;

            // Check password complexity using the same logic as client-side
            if (!isPasswordComplex(password)) {
                return res.status(400).json({ success: false, message: 'Password does not meet complexity requirements.' });
            }

            try {
                // Check if username exists
                const [users] = await pool.query('SELECT * FROM Users WHERE userId = ?', [username]);
                if (users.length > 0) {
                    return res.status(409).json({ success: false, message: 'Username already exists' });
                }

                // Hash the password
                bcrypt.hash(password, saltRounds, async (err, hashedPassword) => {
                    if (err) {
                        logToDatabase('error', `Error hashing password: ${err}`)
                        return res.status(500).json({ success: false, message: 'Error registering new user' });
                    }

                    try {
                        // Insert the new user with a parameterized query
                        await pool.query('INSERT INTO Users (userId, pass) VALUES (?, ?)', [username, hashedPassword]);
                        res.status(201).json({ success: true, message: 'User registered successfully' });
                    } catch (error) {
                        logToDatabase('error', `Error registering new user: ${error}`)
                        res.status(500).json({ success: false, message: 'Error registering new user' });
                    }
                });
            } catch (error) {
                logToDatabase('error', `Error checking username: ${error}`)
                res.status(500).json({ success: false, message: 'Error registering new user' });
            }
        });

        // Non-Google Sign In Endpoint
        app.post('/signin', async (req, res) => {
            const { username, password } = req.body;
            logToDatabase('info', `Attempting to sign in user: ${username}`)

            const [users] = await pool.query('SELECT * FROM Users WHERE userId = ?', [username]);
            if (users.length === 0) {
                return res.status(401).json({ authenticated: false, message: 'Invalid username or password' });
            }

            const user = users[0];
            const decodedPassword = decodeURIComponent(password);
            bcrypt.compare(decodedPassword, user.pass, async (err, result) => {
                if (err) {
                    logToDatabase('error', `Error during password comparison: ${err}`)
                    return res.status(500).json({ authenticated: false, message: 'Error during sign in' });
                }

                if (!result) {
                    logToDatabase('warn', `Authentication failed for user ${username}`)
                    return res.status(401).json({ authenticated: false, message: 'Invalid username or password' });
                }
                const [sessionResult] = await pool.query('INSERT INTO Sessions (userId, startedAt, expiresAt) VALUES (?, ?, ?)', [user.id, new Date(Date.now()), new Date(Date.now() + 4 * 3600 * 1000)]); // 4 Hours
                const sessionId = sessionResult.insertId;
                logToDatabase('info', `User signed in successfully: ${username}`)
                logToDatabase('info', `Session created for user: ${username}, userId: ${user.id}, sessionId: ${sessionId}`)
                res.json({ authenticated: true, sessionId: sessionId });
            });
        });

        // Sign-out Endpoint
        app.post('/signout', async (req, res) => {
            const sessionId = req.headers['x-session-id'];
            if (!sessionId) {
                return res.status(401).json({ message: 'Session ID required for sign out' });
            }

            try {
                // Check if the session exists in the sessions table
                const [sessions] = await pool.query('SELECT * FROM Sessions WHERE sessionId = ?', [sessionId]);

                if (sessions.length === 0) {
                    // Session not found, return an error response
                    return res.status(401).json({ message: 'Invalid session ID' });
                }

                // Delete the session to sign the user out
                await pool.query('DELETE FROM Sessions WHERE sessionId = ?', [sessionId]);

                // Check if the session was associated with a Google account
                if (sessions[0].userId.startsWith('google:')) {
                    // Handle sign-out for Google users (you may need to implement Google sign-out logic here)
                    // For Google sign-out, you can revoke the access token or perform any necessary actions.
                    // Example:
                    // await revokeGoogleAccessToken(sessions[0].userId.substring(7)); // Remove 'google:' prefix
                    // Return a success response
                    return res.status(200).json({ message: 'Sign-out successful' });
                } else {
                    // Handle sign-out for local users (clear their session)
                    // Local users can be signed out by deleting the session from the sessions table.
                    // Return a success response
                    return res.status(200).json({ message: 'Sign-out successful' });
                }
            } catch (error) {
                // Handle errors
                console.error('Error during sign-out:', error);
                return res.status(500).json({ message: 'Error during sign-out' });
            }
        });

        // Execute Command endpoint
        app.post('/execute-command', async (req, res) => {
            const { command } = req.body; // Extract the command from the request body
        
            // Define responses or actions for each command
            const commandResponses = {
                'hello': 'Hello, world!\r\n',
                'date': () => `Current Date and Time: ${new Date().toString()}\r\n`,
                // Add other commands and their responses or functions here
            };
        
            if (command in commandResponses) {
                const response = commandResponses[command];
                // If the command response is a function, execute it to get the response
                const result = typeof response === 'function' ? response() : response;
                res.send(result);
            } else {
                res.send(`Command not recognized: ${command}\r\n`);
            }
        });


        app.listen(3000, () => {
            console.log('Server running on port 3000');
        });

        // Client-Logs Endpoint
        app.post('/client-logs', express.json(), async (req, res) => {
            const { message, level } = req.body;
            
            await logToDatabase(level, message);

            res.status(204).end();  // No content to send back
        })

        /**
         * Retrieve the user ID associated with a given session ID from the database.
         * This function queries the database to find the user ID linked to the provided session ID.
         * @param {string} sessionId - The unique session identifier.
         * @returns {string|null} The user ID if found, or null if not found.
         */
        async function getUserIdFromSessionId(sessionId) {
            // Implement the logic to retrieve the user ID associated with the session from the database
            // Example: const [session] = await pool.query('SELECT userId FROM sessions WHERE sessionId = ?', [sessionId]);
            // Then, return the userId from the session
            return sessionId?.userId || null;
        }
    })
    .catch((error) => {
        // Handle initialization error
        console.error('Failed to initialize the database:', error);
    });