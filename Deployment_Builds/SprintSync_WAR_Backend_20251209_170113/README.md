# SprintSync Backend WAR Deployment Package

## 📦 Package Contents

```
SprintSync_WAR_Backend_20251209_170113/
├── Backend/
│   └── sprintsync-api.war          # Spring Boot WAR file (~62 MB)
└── Database/
    ├── sprintsync_dump.sql         # Complete database backup
    └── migration/                  # Flyway migration scripts
```

---

## 🚀 Deployment Instructions

### Option 1: Tomcat Server (Recommended)
```bash
# 1. Copy WAR to Tomcat webapps
cp Backend/sprintsync-api.war /path/to/tomcat/webapps/

# 2. Start Tomcat
cd /path/to/tomcat/bin
./startup.sh

# 3. Access at:
http://localhost:8080/sprintsync-api/
```

### Option 2: Standalone (Embedded Tomcat)
```bash
# Spring Boot WAR can run standalone
java -jar Backend/sprintsync-api.war

# Access at:
http://localhost:8080/
```

### Option 3: Other Servlet Containers
- **JBoss/WildFly**: Deploy to `standalone/deployments/`
- **GlassFish**: Deploy via Admin Console
- **Jetty**: Copy to `webapps/`

---

## 🗄️ Database Setup

```bash
# 1. Restore database dump
psql -h <host> -U <user> -d <dbname> -f Database/sprintsync_dump.sql

# 2. Or use migrations (if starting fresh)
# Flyway will auto-run migrations from Database/migration/
```

---

## ⚙️ Configuration

**Database Connection**:
- Update `application.properties` inside WAR, OR
- Use external config file:

```bash
java -jar sprintsync-api.war --spring.config.location=/path/to/application.properties
```

**Required Properties**:
```properties
spring.datasource.url=jdbc:postgresql://YOUR_HOST:5432/YOUR_DB
spring.datasource.username=YOUR_USER
spring.datasource.password=YOUR_PASSWORD
```

---

## ✅ Verification

After deployment, test the API:
```bash
curl http://localhost:8080/api/health
# Should return: {"status":"UP"}
```

---

## 📝 Notes

- **Java Version**: Requires Java 17+
- **WAR vs JAR**: WAR format for traditional servlet containers
- **Embedded Mode**: WAR can still run standalone like JAR
- **Database**: PostgreSQL schema and data included in dump

---

**Build Date**: 2025-12-09  
**Location**: `c:\Users\snakhate\Music\SprintSync_App\Deployment_Builds\SprintSync_WAR_Backend_20251209_170113`
