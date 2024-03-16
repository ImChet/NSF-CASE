# Explanation of how the backend works
1. The `docker-compose.yml` and `Dockerfile` are responsible for spinning up a databaase that can be used to test and develop locally.
    * To simplify this process the developer can use `dfile_rebuild.sh` or `dcomp_rebuild.sh` help scripts which automatically rebuild the containers.
2. Any `.sql` files in the `sql/` folder will be run on the database while the container is being built.
    * `init.sql` creates the tables and initializes the tables with any data that should ALWAYS be in the tables (such as the answers to modules).
    * `procedures.sql` creates stored procedures and functions that streamline the processes within `server.js`.

## SQL Documentation
### `init.sql`
* Creates the database
* Creates the tables
* Adds any default entries (such as the answers to modules)

### `procedures.sql`
* `checkUserExists(username VARCHAR(255))` 
    * **USAGE:** 
        * Backend: `CALL checkUserExists("Blizzard T Husky");`
        * Frontend: ```await pool.query(`CALL checkUserExists("${userId}")`);```
            * In the non-Google sign-in functions, the variable is called `username`.
    * **Returns:**
        * 0 (does not exist)
        * 1 (does exist)
* `registerUser(userId VARCHAR(255), pass varchar(256))`
    * **USAGE:** 
        * Backend: `CALL registerUser("Blizzard T Husky", "hashed password");`
        * Frontend: ```await pool.query(`CALL registerUser("${userId}", "${hashPassword}")`);```
            * In the non-Google sign-in functions, the variable is called `username`.
* `startSession(id varchar(255), len INTEGER)`
    * **USAGE:** 
        * Backend: `SELECT startSession("Blizzard T Husky", 4);`
        * Frontend: ```await pool.query(`SELECT startSession("${userId}", SESSION_LENGTH)`);```
            * In the non-Google sign-in functions, the variable is called `username`.
    * Returns
        * `sessionId` 
