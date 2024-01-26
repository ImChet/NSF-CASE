# Use MySQL as the base image
FROM mysql:latest

# Set Environment Variables
# All environment variables can be found here:
# https://dev.mysql.com/doc/refman/8.0/en/docker-mysql-more-topics.html#docker_var_mysql-log-console
# CHANGE ALL OF THIS IN PROD BUILD
ENV MYSQL_LOG_CONSOLE=true
ENV MYSQL_ROOT_PASSWORD="password"
ENV MYSQL_DATABASE="CaseDB"
ENV MYSQL_USER="CaseAdmin"
ENV MYSQL_PASSWORD="CasePassword"

EXPOSE 3306

# MySQL User
USER mysql