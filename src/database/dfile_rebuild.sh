#/bin/sh
# Remove previous image
docker stop case
docker rm case
docker image rm case
docker volume rm db

# Rebuild
docker volume create db
docker build -t case .
docker run --name="case" -p 3307:3306 -itd -v db:/var/lib/mysql case