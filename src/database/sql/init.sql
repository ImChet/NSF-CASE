-- Use this to create file configurations 
-- create the databases
CREATE DATABASE IF NOT EXISTS cybercase_db;
USE cybercase_db;
SELECT "created cybercase_db";

-- create custom user
CREATE USER `cybercase_admin` IDENTIFIED BY 'NS=+KLPN445^^IO#$HGTJ14567';
GRANT USAGE ON *.* TO `cybercase_admin`@`%`;
GRANT ALL PRIVILEGES on `cybercase_db`.* to `cybercase_admin`@`%`;


-- Create Logs table
CREATE TABLE IF NOT EXISTS Logs (
    log_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    log_time DATETIME NOT NULL,
    log_data JSON NOT NULL
);


-- Create Users table INCREASE USERNAME SIZE
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    userId varchar(30) UNIQUE NOT NULL, 
    pass varchar(255) NOT NULL
);

-- Create Sessions table
CREATE TABLE Sessions (
    sessionId INTEGER AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(255) UNIQUE NOT NULL,
    startedAt DATETIME NOT NULL,
    expiresAt DATETIME NOT NULL,
    CONSTRAINT user_fk FOREIGN KEY (userId) REFERENCES Users(userId)
);

-- Create Commands Table
CREATE TABLE Commands (
    mod_name varchar(40) PRIMARY KEY NOT NULL,
    command_data JSON NOT NULL
);

-- Create Answers table
CREATE TABLE IF NOT EXISTS Answers (
    mod_name varchar(40) PRIMARY KEY NOT NULL, 
    mod_data JSON NOT NULL
);

-- Insert Answers into database
-- Here is an example of how to insert data into the database
INSERT INTO Answers VALUES("module 1",
    '{ 
        "Q1" : ["Exploiting the EternalBlue vulnerability"],
        "Q2" : ["Ransomware"],
        "Q3" : ["It served as a backdoor for malware installation"],
        "Q4" : ["Activation of a hardcoded kill switch"],
        "Q5" : ["Disabling SMBv1 and applying security patches"],
        "Q6" : ["u46U0o"]
    }'
);

INSERT INTO Answers VALUES("module 2",
    '{ 
        "Q1" : ["Phishing email to Target contractor"],
        "Q2" : ["Took advantage of default username/password combinations on an administrative server"],
        "Q3" : ["Command and control server, used by attackers to maintain communication with and exfiltrate data from compromised systems within a target network"],
        "Q4" : ["Netcat is a networking utility for reading and writing to network connections using TCP or UDP"],
        "Q5" : ["Netcat was utilized to download additional hacking tools, mainly to conduct reconnaissance within the network"],
        "Q6" : ["Train employees to recognize phishing emails and the next steps they should take if they believe they have received a phishing email"],
        "Q7" : ["HivRzt"]
    }'
);