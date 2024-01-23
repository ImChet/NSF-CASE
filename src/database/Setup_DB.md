# Setting up the Database on your device
## Dependencies
* `Docker`
* `Docker Compose`(optional)

## Give the helper scripts permission to execute
1. `chmod +x dcomp_rebuild.sh`
2. `chmod +x dfile_rebuild.sh`

## Usage
* Modify the `init.sql` file to change the default configurations for the SQLites database.
* **Recommended**: `dfile_rebuild.sh` will build, run, and enter container  running the SQLite database using only `Dockerfile` 
* Use `dcomp_rebuild.sh` will build, run, and enter container running the SQLite database using `Dockerfile` and `docker-compose.yml` files.
    * *If you use this method, you might have to prune the volumes created. There is a bug where the volumes are not uniformly named.*
    * Once the bugs are ironed out, this file could be used to build the frontend as a docker container too.

