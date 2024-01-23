CREATE TABLE Case_Users
    (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT NOT NULL,
    Email TEXT NOT NULL,
    Pass TEXT NOT NULL, 
    Names TEXT NOT NULL
   
       );

    INSERT INTO Case_Users (Names, ID, Username, Email, Pass) 
    VALUES ('Husky T Blizzard', '123456789', 'HuskTB', 'HuskTB@mtu.edu', 'IamhuskyTB');
   -- ('Johnny Joe', 187876548, 'JohnJ', 'JohnJ@mtu.edu', 'Ienjoybeingasecurityrisk!'),
   -- ('Jamie Jan', 172346589, 'JamieJ', 'JamieJ@mtu.edu', 'JamieWho?');
--);

--Creating Users / User priviledges
--https://devhints.io/mysql


-- How to git commit 
--git pull
--git add -A
--git commit -m "message here"
--git push origin 4-create-database


  --  CREATE VIEW Admin_View as
  --  Select names, id, username, email, password;
   -- Select * from Case_Users