# Use MySQL as the base image
FROM mysql:latest

# Set Environment Variables
# All environment variables can be found here:
# https://dev.mysql.com/doc/refman/8.0/en/docker-mysql-more-topics.html#docker_var_mysql-log-console
# CHANGE ALL OF THIS IN PROD BUILD
ENV MYSQL_LOG_CONSOLE=true
ENV MYSQL_ROOT_PASSWORD="password"
ENV MYSQL_DATABASE="cybercase_db"

# Copy custom configurations from local
COPY mysqld.cnf /etc/mysql/conf.d/mysqld.cnf
COPY sql/init.sql /docker-entrypoint-initdb.d/init.sql
COPY sql/procedures.sql /docker-entrypoint-initdb.d/procedures.sql

# Expose MySQL port
EXPOSE 3306

# Create container user account
RUN useradd -ms /bin/bash admin
WORKDIR /home/admin/

# Switch to admin user
USER admin