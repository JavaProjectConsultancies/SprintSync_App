# SprintSync Deployment Guide

This package contains the complete build for the SprintSync application (v1.0).

## Directory Structure
- `backend/`: Contains the Java Spring Boot WAR file.
- `frontend/`: Contains the static build files for the React application.
- `database/`: Contains the SQL schema and setup script.

## Deployment Steps

### 1. Database Setup
1. Ensure PostgreSQL is installed and running.
2. Navigate to the `database` folder.
3. Run `install_db.bat` to create the database schema.
   - You will be prompted for the database name (default: `sprintsync`) and user.
   - Ensure the database instance actually exists (you can create it via `createdb sprintsync` if needed beforehand) or verify if the script creates it (schema.sql usually creates tables). *Note: You might need to create the database itself first if schema.sql only contains table definitions.*

### 2. Backend Deployment
1. Navigate to the `backend` folder.
2. Deploy the `sprintsync-api-1.0.0.war` file to your Tomcat server or run it standalone if configured with embedded Tomcat:
   ```cmd
   java -jar sprintsync-api-1.0.0.war
   ```
   *(Note: Ensure your `application.properties` or environment variables are configured to point to your PostgreSQL database).*

### 3. Frontend Deployment
1. The `frontend/dist` folder contains static HTML, CSS, and JS files.
2. Serve these files using a web server like Nginx, Apache, or IIS.
3. **Important**: Configure your web server to redirect all 404 requests to `index.html` to support Client-Side Routing (SPA).
   - **Nginx Example**:
     ```nginx
     location / {
         try_files $uri $uri/ /index.html;
     }
     ```

## Configuration
- Update the Backend connection settings (Database URL, User, Password) via environment variables or by providing an external `application.properties` file.
