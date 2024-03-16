# Stop processes
docker-compose down
docker volume rm database_db    # Docker on my device automatically names the volume database_db; not sure how to change that

# Rebuild
docker-compose up -d --build case