-- Verify if user exists
delimiter //
create procedure checkUserExists(username VARCHAR(255))
    begin
        SELECT userId FROM Users WHERE userId=username;
    end//
delimiter ;

-- Add new users for the platform procedure
delimiter //
create procedure registerUser(userId VARCHAR(255), pass varchar(256))
    begin
        insert into Users(userId, pass) values(userId, pass);
    end//
delimiter ;

-- Start a new session for a Google user
DELIMITER //
CREATE FUNCTION startSession(id varchar(255), len INTEGER) 
    RETURNS VARCHAR(20) 
    DETERMINISTIC
    BEGIN
        -- Determine if session exists
        declare sessId INTEGER DEFAULT NULL;
        SELECT sessionId INTO sessId FROM Sessions WHERE userId=id;

        -- Start session or extend existing session on above query
        IF sessId IS NOT NULL THEN
            UPDATE Sessions SET expiresAt=DATE_ADD(NOW(),interval len hour) WHERE sessionId=sessId;
        ELSE
            INSERT INTO Sessions (userId, startedAt, expiresAt) VALUES (id, Now(), DATE_ADD(NOW(),interval len hour));
        END IF;

        SELECT sessionId INTO sessId FROM Sessions WHERE userId=id;        
        RETURN (sessId);
    END//
DELIMITER ;

-- Validate user answers
DELIMITER //
CREATE FUNCTION checkAnswers(mname VARCHAR(40), mdata JSON) 
    RETURNS INTEGER
    DETERMINISTIC
    BEGIN
        DECLARE result INTEGER;
        DECLARE ans JSON;

        -- Store the answers in the ans variable
        SELECT mod_data INTO ans FROM Answers WHERE mod_name = mname;

        -- Compare JSON objects
        SELECT mdata = ans INTO result;

        -- Return 1 if correct 0 if incorrect
        RETURN result;    
    END //
DELIMITER ;

-- Utility function that can be used if we want to just retrieve the answers
DELIMITER //
CREATE FUNCTION getAnswers(mname VARCHAR(40)) 
    RETURNS JSON
    DETERMINISTIC
    BEGIN
        -- Store the answers in the ans variable
        DECLARE ans JSON DEFAULT NULL;
        SELECT mod_data INTO ans FROM Answers WHERE mod_name = mname;

        -- Return 1 if correct NULL if incorrect
        RETURN ans;    
    END //
DELIMITER ;
