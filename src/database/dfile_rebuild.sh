#/bin/sh

# Remove previous image
docker stop case
docker rm case
docker image rm case
docker volume rm db

# Rebuild
docker volume create db
docker build -t case .
docker run --name="case" -itd  -v db:/home/db/ case

# Enter build
docker exec -it --user admin-user case /bin/sh