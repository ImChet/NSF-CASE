const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path'); // Added for handling file paths

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Update the database path to point to 'case.db' within the 'database' folder
const dbPath = path.join(__dirname, 'src', 'database', 'case.sqlite'); // Corrected path for the database

// Open the database and handle any errors
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
        throw err; // If we can't connect to the database, the server shouldn't start
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL)");
        });
    }
});

// Handle user registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Hash the password before storing it
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Registration failed');
        }

        // Insert user into the 'users' table
        db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash], function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Registration failed');
            }

            console.log(`User registered with ID: ${this.lastID}`);
            res.redirect('/signin.html');
        });
    });
});

// Handle user sign-in
app.post('/signin', (req, res) => {
    const { username, password } = req.body;

    // Retrieve the hashed password from the database
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Sign-in failed');
        }

        if (!row) {
            return res.status(401).send('Invalid credentials');
        }

        // Compare the provided password with the hashed password from the database
        bcrypt.compare(password, row.password, (err, result) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Sign-in failed');
            }

            if (result) {
                console.log(`User signed in with ID: ${row.id}`);
                res.redirect('/index.html'); // Ensure that index.html is correctly served from the public directory
            } else {
                res.status(401).send('Invalid credentials');
            }
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
