-- Use this to create file configurations 
-- create the databases
CREATE DATABASE IF NOT EXISTS CaseDB;
USE CaseDB;


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
        "Q1" : ["21"],
        "Q2" : ["Network scanning"],
        "Q3" : ["NMAP can perform host discovery", "NMAP can be used to identify services on a network"],
        "Q4" : ["FTP"]
    }'
);