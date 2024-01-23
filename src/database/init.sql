-- Create a table to store user information
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
);

-- Insert sample users with hashed passwords
INSERT INTO users (username, password) VALUES ('Husky T Blizzard', 'hashed_password_for_Husky');
INSERT INTO users (username, password) VALUES ('John Doe', 'hashed_password_for_John');
INSERT INTO users (username, password) VALUES ('Jane Doe', 'hashed_password_for_Jane');