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

INSERT INTO Answers VALUES("module 3",
    '{ 
        "Q1" : ["An attempt to disrupt the operations of a server, service, or network by flooding it with traffic"],
        "Q2" : ["By sending spoofed DNS queries with the target IP address as the source to the resolvers"],
        "Q3" : ["Utilizing packet manipulation tools/libraries in python, c, etc."],
        "Q4" : ["Rate limiting involves setting limits on the number of requests or packets a server can receive within a certain time frame"],
        "Q5" : ["As a result of increased awareness and improved security implemented by organizations, ISPs, and security companies"]
    }'
);

INSERT INTO Answers VALUES("module 4",
    '{ 
        "Q1" : ["January 2019"],
        "Q2" : ["Infrastructure monitoring and management platform"],
        "Q3" : ["Attackers compromised the software supply chain through the Orion update mechanism"],
        "Q4" : ["SolarWinds unknowingly signed and pushed the malware themselves when they updated Orion"],
        "Q5" : ["Russian SVR"],
        "Q6" : ["An executive order was issued by President Biden to deter and protect from future attacks of this nature"],
        "Q7" : ["Supply chain attacks can be extremely hard to detect if they are performed correctly"]
    }'
);

INSERT INTO Answers VALUES("module 5",
    '{ 
        "Q1" : ["APT is a sophisticated and complex cyberattack carried out by a skilled and determined adversary"],
        "Q2" : ["Spear phishing is a targeted form of phishing that uses emails tailored to a specific individual or organization, while regular phishing uses generic emails sent out at random"],
        "Q3" : ["Behavioral analysis involves monitoring and analyzing user activity and system behavior to detect deviations from normal traffic, which can indicate a potential attack"],
        "Q4" : ["Yes, data encryption can ensure that sensitive information remains protected even in the case that attackers gain access to the system"],
        "Q5" : ["Yes, MFA requires multiple forms of verification, such as passwords and biometrics, making it a solid defense in preventing unauthorized access to sensitive systems like Anthems"]
    }'
);

INSERT INTO Answers VALUES("module 6",
    '{ 
       "Q1" : ["Apache Struts is an open-source framework for developing web applications in Java"],
       "Q2" : ["You should update to the latest secure patch as soon as possible to mitigate potential exploitation"],
       "Q3" : ["Immediate action is crucial to minimize damage of the breach by containing the incident and preventing further access"],
       "Q4" : ["The vulnerability exploited incorrect exception handling of specially crafted HTTP requests"],
       "Q5" : ["Social Security numbers, drivers license numbers, and biometric data"]
    }'
);