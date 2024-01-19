const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs'); // Import the Node.js File System module

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sessions = {}; // Object to store client sessions

// Function to load modules from /config/module-terminal-responses.json
function loadModules() {
    try {
        const modulesConfig = fs.readFileSync('./config/module-terminal-responses.json', 'utf-8');
        return JSON.parse(modulesConfig);
    } catch (error) {
        console.error('Error loading modules:', error);
        return {};
    }
}

const modules = loadModules(); // Load modules from JSON configuration

wss.on('connection', (ws) => {
    const sessionId = uuidv4(); // Generate a unique session ID for each client
    const session = {
        id: sessionId,
        ws,
        authenticated: false, // Flag to track if a client is authenticated (you can add authentication logic)
    };

    sessions[sessionId] = session; // Store the session in the sessions object

    console.log(`Server: Client {${sessionId}} connected.`);

    ws.send(`Successfully connected to the server.`); // Send a welcome message to the client

    ws.on('message', (message) => {
        const command = message.toString(); // Convert the received message to a string
        console.log(`Server: Received command from Client {${session.id}} - ${command}, prepping response now...`);

        const response = processCommand(command, session); // Process the received command
        ws.send(response); // Send the response back to the client
    });

    ws.on('close', () => {
        console.log(`Server: Client {${sessionId}} disconnected`);
        delete sessions[sessionId]; // Remove the session when the client disconnects
    });
});

// Function to process commands
function processCommand(command, session) {
    for (const moduleName in modules) {
        if (modules.hasOwnProperty(moduleName)) {
            const module = modules[moduleName];
            if (command in module.commands) {
                console.log(`Server: Sending response to Client {${session.id}} based on ${command} in ${moduleName}...`);
                return module.commands[command]; // Return the response for the command
            }
        }
    }

    console.log('Invalid command format: Command not found');
    return 'Invalid command'; // Return an error message for an invalid command
}

app.use(express.static('public')); // Serve static files from the 'public' directory

server.listen(3000, () => {
    console.log('Server: Listening on port 3000');
});
