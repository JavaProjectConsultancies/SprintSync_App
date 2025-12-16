# SprintSync Deployment Guide

## Build Information
- **Build Date**: December 12, 2025
- **Version**: 1.0.0

---

## Directory Structure

```
Deployment_Builds/
├── Backend/
│   └── sprintsync-api.war          # Spring Boot WAR file
├── Frontend/
│   ├── index.html                   # Main HTML entry point
│   └── assets/                      # JS, CSS, and other static assets
├── Database/
│   └── *.sql                        # Flyway migration scripts
└── DEPLOYMENT_GUIDE.md              # This file
```

---

## Prerequisites

### Server Requirements
- **Java**: JDK 17 or higher
- **Application Server**: Apache Tomcat 10.1+ (or any Jakarta EE compatible server)
- **Web Server**: Nginx or Apache HTTP Server (for frontend)
- **Database**: PostgreSQL 14+ (already configured with Aiven Cloud)

---

## Backend Deployment (Tomcat)

### Option 1: Deploy to Standalone Tomcat

1. **Copy WAR file to Tomcat webapps folder:**
   ```bash
   cp Backend/sprintsync-api.war $TOMCAT_HOME/webapps/
   ```

2. **Start/Restart Tomcat:**
   ```bash
   $TOMCAT_HOME/bin/startup.sh    # Linux/Mac
   $TOMCAT_HOME/bin/startup.bat   # Windows
   ```

3. **Verify deployment:**
   - The API will be available at: `http://your-server:8080/sprintsync-api/api/`
   - Health check: `http://your-server:8080/sprintsync-api/api/actuator/health`

### Option 2: Rename WAR for Root Context

To deploy at root path (`/api` instead of `/sprintsync-api/api`):

1. **Rename the WAR file:**
   ```bash
   mv Backend/sprintsync-api.war Backend/ROOT.war
   ```

2. **Copy to Tomcat webapps:**
   ```bash
   cp Backend/ROOT.war $TOMCAT_HOME/webapps/
   ```

3. **API will be available at:** `http://your-server:8080/api/`

---

## Frontend Deployment (Nginx)

### Nginx Configuration

1. **Copy frontend files to web server directory:**
   ```bash
   cp -r Frontend/* /var/www/sprintsync/
   ```

2. **Create Nginx configuration (`/etc/nginx/sites-available/sprintsync`):**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/sprintsync;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Frontend - Single Page Application routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy - Forward API requests to Tomcat backend
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90s;
        proxy_connect_timeout 90s;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/sprintsync /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## Database Configuration

The application is already configured to use **Aiven PostgreSQL Cloud Database**:

- **Host**: pg-36c174e-sprintsync.c.aivencloud.com
- **Port**: 23096
- **Database**: defaultdb
- **Username**: avnadmin

### Flyway Migrations
The WAR file includes all database migration scripts. Flyway will automatically run migrations on application startup.

### Manual Migration (if needed)
To run migrations manually, execute SQL files from the `Database/` folder in order:
```bash
psql -h pg-36c174e-sprintsync.c.aivencloud.com -p 23096 -U avnadmin -d defaultdb -f Database/V20251206173500__add_project_id_to_activity_logs.sql
```

---

## Environment-Specific Configuration

### Updating API URL for Production

If your production server has a different domain, update the frontend configuration:

1. Create a `.env.production` file before building:
   ```
   VITE_API_BASE_URL=https://your-production-domain.com/api
   ```

2. Or configure Nginx to proxy `/api/` requests to your backend server (recommended - see above config)

### Updating CORS Settings

Edit `application.properties` inside the WAR or use environment variables:
```properties
app.cors.allowed-origins=https://your-production-domain.com
```

---

## API Endpoints Summary

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | User authentication |
| `POST /api/auth/register` | User registration |
| `GET /api/users` | List all users |
| `GET /api/projects` | List all projects |
| `GET /api/departments/all` | List all departments |
| `GET /api/actuator/health` | Health check |

---

## Troubleshooting

### Common Issues

1. **404 Error on API calls**
   - Ensure the WAR is deployed correctly
   - Check if the context path matches your frontend configuration
   - Verify Nginx proxy settings

2. **CORS Errors**
   - Update `app.cors.allowed-origins` in application.properties
   - Ensure Nginx is forwarding correct headers

3. **Database Connection Issues**
   - Verify PostgreSQL is accessible from the server
   - Check firewall rules for port 23096

4. **Frontend routing issues**
   - Ensure Nginx `try_files` directive is configured for SPA routing

---

## Quick Start Commands

```bash
# Backend - Tomcat
cp Backend/sprintsync-api.war /opt/tomcat/webapps/
systemctl restart tomcat

# Frontend - Nginx
cp -r Frontend/* /var/www/sprintsync/
systemctl reload nginx

# Check logs
tail -f /opt/tomcat/logs/catalina.out
tail -f /var/log/nginx/error.log
```

---

## Support

For any deployment issues, check:
1. Tomcat logs: `$TOMCAT_HOME/logs/catalina.out`
2. Nginx logs: `/var/log/nginx/error.log`
3. Application logs in Tomcat logs directory
