-- USE THIS FILE TO CREATE CONFIGS FOR DATABASE

-- Create Users table
CREATE TABLE Case_Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL
);

-- Create Answers table
CREATE TABLE Answers (
    mod_name PRIMARY KEY TEXT NOT NULL, 
    mod_data TEXT NOT NULL
);

-- Insert Answers into database
-- ALL ANSWERS FOR THE MODULES GO HERE IN JSON FORMAT
INSERT INTO Answers
    SELECT key, value FROM (
        SELECT * FROM json_tree('{ 
            "module 1" : {
                "Q1" : ["21"],
                "Q2" : ["Network scanning"],
                "Q3" : ["NMAP can perform host discovery", "NMAP can be used to identify services on a network"],
                "Q4" : ["FTP"]
            },
            "module 2": {
                "Q1" : ["21"],
                "Q2" : ["Network scanning"],
                "Q3" : ["NMAP can perform host discovery", "NMAP can be used to identify services on a network"],
                "Q4" : ["FTP"]
            }
        }'
        )
    ) WHERE key LIKE '%module%';