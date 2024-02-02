-- -- Add new users for the platform procedure
delimiter //
create procedure registerUser(userId VARCHAR(255), pass varchar(256))
    begin
        insert into Users(userId, pass) values(userId, pass);
    end//
delimiter ;

-- Start a new session for a Google user
delimiter //
create procedure startSession(userId varchar(20), expiresAt DATETIME)
    begin
        INSERT INTO Sessions (userId, startedAt, expiresAt) VALUES (userId, Now(), expiresAt);
    end//
delimiter ;

-- End session for a user
-- delimiter //
-- create procedure termSession(currId varchar(20))
--     begin
--         DELETE FROM Sessions WHERE userId=currId;
--     end//
-- delimiter ;