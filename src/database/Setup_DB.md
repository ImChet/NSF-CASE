# Setting up the Database on your device
## Dependencies
* `Docker`
* `Docker Compose`(optional)
* `mysql` 

## Give the helper scripts permission to execute
1. `chmod +x dfile_rebuild.sh`
2. `chmod +x run_sql.sh`

## Build using the Dockerfile
1. Modify the `init.sql` file to change the default configurations for the MySQL database.
2. `./dfile_rebuild.sh` will rebuild and run the container
    * `mysql -uCaseAdmin -h1247.0.0.1 --port=3307 -p < init.sql`
        * You will be prompted to enter a password. The password is can be found/modified in `Dockerfile` set as `MYSQL_PASSWORD`

## Build using the Docker Compose file
1. Modify the `init.sql` file to change the default configurations for the MySQL database.
2. `./dcomp_rebuild.sh` will rebuild and run the container
    * `mysql -uCaseAdmin -h1247.0.0.1 --port=3307 -p < init.sql`
        * You will be prompted to enter a password. The password is can be found/modified in `Dockerfile` set as `MYSQL_PASSWORD`

## Useful Comands to know
| Git Workflow | Usage  |
|--------|--------|
| `git pull` | Sync changes with remote  |
| `git add -A` | Add all changes |
| `git commit -m "[message here]"` | Save all changes |
| `git push origin [current branch here]` | Push to remote |


| MySQL Comands | Usage  |
|--------|--------|
| `use CaseDB;` | Switch to the database we are using for the project |
| `SELECT UserFROM mysql.user;` | Show existing users  |
| `SELECT [col_1], [col_n] FROM [table_name]` | General format for querying entries |
| `DROP TABLE [table name]` | Delete table from database |
| `[ctrl] + l` | clear the MySQL terminal |
| `[ctrl] + c` | cancel MySQL command |

### Useful Links
* [Connecting to MySQL]('https://dev.mysql.com/doc/refman/8.0/en/connecting.html')
* [MySQL JSON Functions]('https://dev.mysql.com/doc/refman/8.0/en/json-function-reference.html')

### The following does not work at the moment:
* Automatic population of the SQL database
