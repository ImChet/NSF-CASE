-- Use this to create file configurations
-- create the databases
CREATE DATABASE IF NOT EXISTS CaseDB;
USE CaseDB;

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    userId varchar(30) UNIQUE NOT NULL,
    pass varchar(255) NOT NULL,
    email varchar(100) NOT NULL
);

-- -- Insert into Users table
-- INSERT INTO Users(username, pass, email) VALUES("Jane Doe", "hello", "email@mtu.edu");

-- Create Sessions table
CREATE TABLE sessions (
    sessionId INTEGER AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(255) UNIQUE NOT NULL,
    expiresAt DATETIME NOT NULL,
    FOREIGN KEY(userId) references Users(userId)
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
        "Q1" : ["21"],
        "Q2" : ["Network scanning"],
        "Q3" : ["NMAP can perform host discovery", "NMAP can be used to identify services on a network"],
        "Q4" : ["FTP"]
    }'
);