// Import required libraries and modules
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const winston = require('winston');
const mysql = require('mysql2/promise');
const cors = require('cors');

// Create an Express app
const app = express();
const client = new OAuth2Client("398792302857-gj4s9331t22kljn6inunra5tblqlmmpe.apps.googleusercontent.com");

// Database connection pool setup
const pool = mysql.createPool({
    host: 'localhost',
    user: 'chet',
    password: 'P@ssw0rd',
    database: 'myappdb'
});

// Initialize Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'server.log' })
    ],
});

// Function to initialize the database and create the required table
const initializeDatabase = async () => {
    try {
        // Create or recreate the sessions table with required schema
        await pool.query(`
            DROP TABLE IF EXISTS sessions;
        `);
        await pool.query(`
            CREATE TABLE sessions (
                sessionId INT AUTO_INCREMENT PRIMARY KEY,
                userId VARCHAR(255) NOT NULL,
                expiresAt DATETIME NOT NULL
            );
        `);
        logger.info('Database initialized successfully');
    } catch (error) {
        logger.error('Error initializing the database:', error);
        throw error;
    }
};

// Initialize the database and create the required table
initializeDatabase()
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
                const [result] = await pool.query('INSERT INTO sessions (userId, expiresAt) VALUES (?, ?)', [payload['sub'], new Date(Date.now() + 3600 * 1000)]);
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

            const [sessions] = await pool.query('SELECT * FROM sessions WHERE sessionId = ? AND expiresAt > NOW()', [sessionId]);
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

        async function getUserIdFromSessionId(sessionId) {
            // Implement the logic to retrieve the userId associated with the session from the database
            // For example: const [session] = await pool.query('SELECT userId FROM sessions WHERE sessionId = ?', [sessionId]);
            // Then, return the userId from the session
            return sessionId?.userId || null;
        }
    })
    .catch((error) => {
        // Handle initialization error
        console.error('Failed to initialize the database:', error);
    });
