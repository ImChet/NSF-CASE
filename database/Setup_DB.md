# Setting up the Database on your device
## Dependencies
* `Docker`
* `Docker Compose`(optional)
* `mysql[3.8]`

## Give the helper scripts permission to execute
1. `chmod +x dfile_rebuild.sh`
2. `chmod +x dcomp_rebuild.sh`

## Build using the Dockerfile
1. Modify the `init.sql` file to change the default configurations for the MySQL database.
2. `./dfile_rebuild.sh` will rebuild and run the container

## Build using the Docker Compose file 
1. Modify the `init.sql` file to change the default configurations for the MySQL database.
2. `./dcomp_rebuild.sh` will rebuild and run the container

## Useful Comands to know

|Connection| Usage|
|--------|--------|
| `mysql -uCaseAdmin -h127.0.0.1 --port=3307 -p` | Connect to MySQL database from local machine; Enter password when prompted. **You must have mysql installed to use this method** |
| `docker exec -it case /bin/sh` | Connect to Docker container from local machine | 
| `mysql -uCaseAdmin -h127.0.0.1 -p`| Connect MySQL database from inside the container; Enter password when prompted.| 


| MySQL Comands | Usage  |
|--------|--------|
| `use CaseDB;` | Switch to the database we are using for the project |
| `SELECT UserFROM mysql.user;` | Show existing users  |
| `SELECT [col_1], [col_n] FROM [table_name]` | General format for querying entries |
| `DROP TABLE [table name]` | Delete table from database |
| `[ctrl] + l` | clear the MySQL terminal |
| `[ctrl] + c` | cancel MySQL command |

| Git Workflow | Usage  |
|--------|--------|
| `git pull` | Sync changes with remote  |
| `git add -A` | Add all changes |
| `git commit -m "[message here]"` | Save all changes |
| `git push origin [current branch here]` | Push to remote |

### Useful Links
* [Connecting to MySQL]('https://dev.mysql.com/doc/refman/8.0/en/connecting.html')
* [MySQL JSON Functions]('https://dev.mysql.com/doc/refman/8.0/en/json-function-reference.html')

### The following does not work at the moment:
* Automatic population of the SQL database
