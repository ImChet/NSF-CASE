// Import required libraries and modules
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const winston = require('winston');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { stringify } = require('querystring');
const saltRounds = 10; // Adjust based on security requirements

// Create an Express app
const app = express();
const client = new OAuth2Client("398792302857-gj4s9331t22kljn6inunra5tblqlmmpe.apps.googleusercontent.com");

// Database connection pool setup
// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'chet',
//     password: 'P@ssw0rd',
//     database: 'myappdb'
// });

const pool = mysql.createPool({
    host: 'localhost',
    user: 'CaseAdmin',
    password: 'CasePassword',
    database: 'CaseDB',
    port: 3307
});


// Initialize Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'server.log' })
    ],
});

// // Function to initialize the database and create the required table
// const initializeDatabase = async () => {
//     try {
//         // Create or recreate the sessions table with required schema
//         await pool.query(`
//             DROP TABLE IF EXISTS sessions;
//         `);
//         await pool.query(`
//             CREATE TABLE sessions (
//                 sessionId INT AUTO_INCREMENT PRIMARY KEY,
//                 userId VARCHAR(255) NOT NULL,
//                 expiresAt DATETIME NOT NULL
//             );
//         `);
//         logger.info('Database initialized successfully');
//     } catch (error) {
//         logger.error('Error initializing the database:', error);
//         throw error;
//     }
// };


initializeDatabaseConnection = async () => {
       try {
        // Connect to the Database CaseDB
        await pool.query(`
            USE CaseDB;
        `);
        // Example of Call procedure
        // await pool.query('CALL registerUser("email@mtu.edu", "John Doe", "Password");')
        logger.info('Database connection successfull.');
    } catch (error) {
        logger.error('Error connecting to the database:', error);
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
            logger.info('Received token for verification:', token);

            try {
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: "398792302857-gj4s9331t22kljn6inunra5tblqlmmpe.apps.googleusercontent.com",
                });
                const payload = ticket.getPayload();

                logger.info('Token verified successfully. User ID:', payload['sub']);

                // Log session creation
                // const [result] = await pool.query('INSERT INTO sessions (userId, expiresAt) VALUES (?, ?)', [payload['sub'], new Date(Date.now() + 3600 * 1000)]);
                const [result] = await pool.query('INSERT INTO Sessions (userId, startedAt, expiresAt) VALUES (?, ?, ?)', [payload['sub'], new Date(Date.now()), new Date(Date.now() + 12 * 3600 * 1000)]); // 12 Hours
                const sessionId = result.insertId;

                logger.info('Session created with ID:', sessionId);
                res.json({ verified: true, sessionId: sessionId });
            } catch (error) {
                logger.error('Token verification failed:', error);
                res.status(401).json({ verified: false, error: error.message });
            }
        });

        // VerifySession middleware
        const verifySession = async (req, res, next) => {
            const sessionId = req.headers['x-session-id'];
            if (!sessionId) {
                logger.warn('Session ID required');
                return res.status(401).json({ message: 'Session ID required' });
            }

            // Log session ID being checked
            logger.info('Checking session ID:', sessionId);

            // const [sessions] = await pool.query('SELECT * FROM sessions WHERE sessionId = ? AND expiresAt > NOW()', [sessionId]);
            const [sessions] = await pool.query('SELECT * FROM Sessions WHERE sessionId = ? AND expiresAt > NOW()', [sessionId]);
            console.log()
            if (sessions.length === 0) {
                logger.warn('Invalid or expired session');
                return res.status(401).json({ message: 'Invalid or expired session' });
            }

            logger.info('Session verified successfully');
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
                // const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
                const [users] = await pool.query('SELECT * FROM Users WHERE userId = ?', [username]);
                if (users.length > 0) {
                    return res.status(409).json({ success: false, message: 'Username already exists' });
                }

                // Hash the password
                bcrypt.hash(password, saltRounds, async (err, hashedPassword) => {
                    if (err) {
                        logger.error('Error hashing password:', err);
                        return res.status(500).json({ success: false, message: 'Error registering new user' });
                    }

                    try {
                        // Insert the new user with a parameterized query
                        // await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
                        await pool.query('INSERT INTO Users (userId, pass) VALUES (?, ?)', [username, hashedPassword]);
                        res.status(201).json({ success: true, message: 'User registered successfully' });
                    } catch (error) {
                        logger.error('Error registering new user:', error);
                        res.status(500).json({ success: false, message: 'Error registering new user' });
                    }
                });
            } catch (error) {
                logger.error('Error checking username:', error);
                res.status(500).json({ success: false, message: 'Error registering new user' });
            }
        });

        // Non-Google Sign In Endpoint
        app.post('/signin', async (req, res) => {
            const { username, password } = req.body;
            logger.info(`Attempting to sign in user: ${username}`);

            // const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
            const [users] = await pool.query('SELECT * FROM Users WHERE userId = ?', [username]);
            if (users.length === 0) {
                return res.status(401).json({ authenticated: false, message: 'Invalid username or password' });
            }

            const user = users[0];
            const decodedPassword = decodeURIComponent(password);
            bcrypt.compare(decodedPassword, user.pass, async (err, result) => {
                if (err) {
                    logger.error('Error during password comparison:', err);
                    return res.status(500).json({ authenticated: false, message: 'Error during sign in' });
                }

                if (!result) {
                    logger.warn(`Authentication failed for user ${username}`);
                    return res.status(401).json({ authenticated: false, message: 'Invalid username or password' });
                }

                // const [sessionResult] = await pool.query('INSERT INTO sessions (userId, expiresAt) VALUES (?, ?)', [user.id, new Date(Date.now() + 3600 * 1000)]);
                const [sessionResult] = await pool.query('INSERT INTO Sessions (userId, startedAt, expiresAt) VALUES (?, ?, ?)', [user.id, new Date(Date.now()), new Date(Date.now() + 12 * 3600 * 1000)]); // 12 Hours

                const sessionId = sessionResult.insertId;
                logger.info(`User signed in successfully: ${username}`);
                logger.info(`Session created for user ${user.id} with ID: ${sessionId}`);
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
                // const [sessions] = await pool.query('SELECT * FROM sessions WHERE sessionId = ?', [sessionId]);
                const [sessions] = await pool.query('SELECT * FROM Sessions WHERE sessionId = ?', [sessionId]);

                if (sessions.length === 0) {
                    // Session not found, return an error response
                    return res.status(401).json({ message: 'Invalid session ID' });
                }

                // Delete the session to sign the user out
                // await pool.query('DELETE FROM sessions WHERE sessionId = ?', [sessionId]);
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

        // Logger
        app.post('/client-logs', express.json(), async (req, res) => {
            const { message, level, userId } = req.body;
            const sessionUserId = await getUserIdFromSessionId(req.headers['x-session-id']);
            
            switch (level) {
                case 'info':
                    // Log to the server.log file
                    logger.info(message, { userId: sessionUserId });
                    break;
                case 'warn':
                    // Log to the server.log file
                    logger.warn(message, { userId: sessionUserId });
                    break;
                case 'error':
                    // Log to the server.log file
                    logger.error(message, { userId: sessionUserId });
                    break;
                default:
                    // Log to the server.log file
                    logger.log('info', message, { userId: sessionUserId });
            }
            res.status(204).end();  // No content to send back
        });

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
