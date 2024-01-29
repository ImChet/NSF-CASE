-- Add new users for the platform
delimiter //
create procedure registerUser(email varchar(100), userId VARCHAR(255), pass varchar(256))
    begin
        insert into Users(email, userId, pass) values(email, userId, sha2(pass, 256));
    end//
delimiter ;

-- Start a new session for a user
delimiter //
create procedure startSession(userId varchar(20), expiresAt DATETIME)
    begin
        insert into sessions(userId, startedAt, expiresAt) values(userId, NOW(), expiresAt);
    end//
delimiter ;

-- End session for a user
delimiter //
create procedure termSession(currId varchar(20))
    begin
        DELETE FROM sessions WHERE userId=currId;
    end//
delimiter ;