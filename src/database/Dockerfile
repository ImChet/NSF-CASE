FROM alpine:latest

# Install SQLite
RUN apk --no-cache add sqlite
RUN apk add sqlite-dev
RUN apk add vim

# Create a directory to store the database
VOLUME /home/db/
WORKDIR /home/db/

# Copy your SQLite config file into the container
COPY init.sql /home/db/

# Create a user group 'admins'
RUN addgroup -S admins

# Create a user 'admin-user' under 'admins'
RUN adduser -S -D -h /home/db/ admin-user admins

# Chown all the files to the app user.
RUN chown -R admin-user:admins /home/db/*

# Switch to 'admin-user'
USER admin-user

# Add permissions
RUN sh -c "touch /home/db/case.sqlite"
RUN chmod +x /home/db/case.sqlite
RUN sh -c "sqlite3 case.sqlite < init.sql"


# Expose the port if needed
# EXPOSE 1433