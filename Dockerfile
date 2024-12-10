# Use the official PostgreSQL image as the base image
FROM postgres:latest

# Set environment variables for database configuration
ENV POSTGRES_USER=root
ENV POSTGRES_PASSWORD=root
ENV POSTGRES_DB=timer

# Copy any custom configuration or initialization scripts into the container
# COPY init.sql /docker-entrypoint-initdb.d/

# Expose the PostgreSQL port
EXPOSE 5432

# Start the PostgreSQL server when the container launches
CMD ["postgres"]
