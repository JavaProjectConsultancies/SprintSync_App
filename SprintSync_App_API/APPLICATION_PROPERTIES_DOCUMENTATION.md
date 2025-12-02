# SprintSync API - Application Properties Documentation

## Overview

This document provides comprehensive documentation for the `application.properties` configuration file used in the SprintSync API. The SprintSync API is a Spring Boot 3.3.1 application built with Java 17, providing RESTful endpoints for project management functionality.

## Table of Contents

1. [Application Configuration](#application-configuration)
2. [Database Configuration](#database-configuration)
3. [Connection Pooling (HikariCP)](#connection-pooling-hikaricp)
4. [JPA/Hibernate Configuration](#jpahibernate-configuration)
5. [Flyway Migration Configuration](#flyway-migration-configuration)
6. [Cache Configuration](#cache-configuration)
7. [Security Configuration](#security-configuration)
8. [Jackson JSON Configuration](#jackson-json-configuration)
9. [Server Configuration](#server-configuration)
10. [DevTools Configuration](#devtools-configuration)
11. [Management/Actuator Configuration](#managementactuator-configuration)
12. [Logging Configuration](#logging-configuration)
13. [API Documentation Configuration](#api-documentation-configuration)
14. [CORS Configuration](#cors-configuration)
15. [Environment-Specific Configuration](#environment-specific-configuration)
16. [Best Practices](#best-practices)
17. [Security Considerations](#security-considerations)

---

## Application Configuration

### `spring.application.name=sprintsync-api`

**Purpose**: Sets the application name, which is used for:
- Service registration (if using service discovery)
- Spring Boot Actuator endpoints
- Default Spring Cloud configuration

**Recommendation**: Keep this value unique across your microservices ecosystem.

---

## Database Configuration

### `spring.datasource.url`
```
jdbc:postgresql://pg-36c174e-sprintsync.c.aivencloud.com:23096/defaultdb
```

**Purpose**: JDBC connection URL for PostgreSQL database hosted on Aiven Cloud.

**Format**: `jdbc:postgresql://[host]:[port]/[database]`

**Components**:
- **Host**: `pg-36c174e-sprintsync.c.aivencloud.com` (Aiven Cloud PostgreSQL instance)
- **Port**: `23096` (PostgreSQL default port)
- **Database**: `defaultdb`

**Recommendations**:
- For production, use environment variables or secrets management (e.g., AWS Secrets Manager, HashiCorp Vault)
- Consider using connection string with SSL parameters for secure connections:
  ```
  jdbc:postgresql://host:port/db?ssl=true&sslmode=require
  ```

### `spring.datasource.username=avnadmin`

**Purpose**: Database username for authentication.

**Security Note**: ⚠️ **Never commit credentials to version control**. Use environment variables or secrets management in production.

### `spring.datasource.password=AVNS_fo7-HjILanrHp67LRuC`

**Purpose**: Database password for authentication.

**Security Note**: ⚠️ **CRITICAL**: This password is exposed in the file. In production, use:
- Environment variables: `spring.datasource.password=${DB_PASSWORD}`
- Spring Cloud Config Server
- External secrets management

### `spring.datasource.driver-class-name=org.postgresql.Driver`

**Purpose**: Specifies the JDBC driver class for PostgreSQL.

**Note**: Spring Boot can auto-detect this from the connection URL, but explicit declaration is recommended for clarity.

---

## Connection Pooling (HikariCP)

HikariCP is the default connection pool provider in Spring Boot 2.x+. These configurations optimize database connection management.

### `spring.datasource.hikari.maximum-pool-size=10`

**Purpose**: Maximum number of database connections in the pool.

**Why This Value?**: 
- Reduced from default (typically 10-20) to prevent PostgreSQL connection exhaustion
- Aiven Cloud has connection limits per plan
- Balances performance with resource constraints

**Recommendation**: 
- **Development**: 5-10 connections
- **Production**: 10-20 connections (adjust based on load and database limits)
- Monitor active connections to find optimal value

### `spring.datasource.hikari.minimum-idle=2`

**Purpose**: Minimum number of idle connections maintained in the pool.

**Benefit**: Keeps connections ready for immediate use, reducing connection establishment latency.

**Recommendation**: Set to 2-5 for small applications, 5-10 for high-traffic applications.

### `spring.datasource.hikari.connection-timeout=30000`

**Purpose**: Maximum time (milliseconds) to wait for a connection from the pool.

**Value**: 30 seconds (30000 ms)

**What Happens**: If no connection is available within this time, a `SQLException` is thrown.

**Recommendation**: 
- **Development**: 10000-30000 ms
- **Production**: 20000-60000 ms (depending on load)

### `spring.datasource.hikari.idle-timeout=300000`

**Purpose**: Maximum time (milliseconds) a connection can remain idle before being removed from the pool.

**Value**: 5 minutes (300000 ms)

**Benefit**: Helps prevent connection leaks and frees unused resources.

**Recommendation**: Set to 300000-600000 ms (5-10 minutes).

### `spring.datasource.hikari.max-lifetime=600000`

**Purpose**: Maximum lifetime (milliseconds) of a connection in the pool.

**Value**: 10 minutes (600000 ms)

**Why Reduced**: 
- Prevents stale connections that may have been closed by the database
- Aiven Cloud may close idle connections, so shorter lifetime prevents errors

**Recommendation**: 
- **Cloud databases**: 300000-900000 ms (5-15 minutes)
- **On-premise**: 1800000-3600000 ms (30-60 minutes)

### `spring.datasource.hikari.leak-detection-threshold=60000`

**Purpose**: Time (milliseconds) after which a connection is considered "leaked" if not returned to the pool.

**Value**: 60 seconds (60000 ms)

**Benefit**: Helps identify connection leaks in the application code.

**Recommendation**: 
- **Development**: 60000 ms (1 minute) - helps catch leaks quickly
- **Production**: 600000 ms (10 minutes) - less overhead, but still detects leaks

### `spring.datasource.hikari.connection-test-query=SELECT 1`

**Purpose**: SQL query executed to validate a connection before use.

**Alternative**: Modern HikariCP can use `isValid()` method, but explicit query is more compatible.

**Recommendation**: Keep `SELECT 1` for maximum compatibility.

### `spring.datasource.hikari.validation-timeout=5000`

**Purpose**: Maximum time (milliseconds) to wait for connection validation.

**Value**: 5 seconds (5000 ms)

**Benefit**: Prevents long waits when database is unavailable.

---

## JPA/Hibernate Configuration

### `spring.jpa.hibernate.ddl-auto=none`

**Purpose**: Controls automatic database schema management.

**Value**: `none` (no automatic schema generation)

**Options**:
- `none`: No action (recommended for production)
- `validate`: Validates schema without making changes
- `update`: Updates schema based on entities
- `create`: Creates schema on startup, drops on shutdown
- `create-drop`: Creates on startup, drops on shutdown

**Why `none`?**: 
- Flyway handles schema migrations
- Prevents accidental data loss
- Production best practice

### `spring.jpa.show-sql=false`

**Purpose**: Logs SQL statements to console.

**Production**: `false` (reduces log noise, improves performance)

**Development**: Can be `true` for debugging

**Alternative**: Use `logging.level.org.hibernate.SQL=DEBUG` for more control.

### `spring.jpa.open-in-view=false`

**Purpose**: Controls whether JPA EntityManager is available for the entire HTTP request.

**Value**: `false` (recommended)

**Why `false`?**:
- Prevents lazy loading exceptions in view layer
- Better transaction boundaries
- Improved performance (shorter connection usage)
- Recommended Spring Boot best practice

### `spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect`

**Purpose**: Specifies the SQL dialect for Hibernate.

**Why Explicit?**: 
- Ensures PostgreSQL-specific optimizations
- Correct handling of PostgreSQL data types
- Auto-detected, but explicit is clearer

### `spring.jpa.properties.hibernate.format_sql=true`

**Purpose**: Formats SQL statements in logs for readability.

**Benefit**: Easier debugging when SQL logging is enabled.

### `spring.jpa.properties.hibernate.jdbc.time_zone=UTC`

**Purpose**: Sets the timezone for JDBC operations.

**Why UTC?**: 
- Standard practice for backend applications
- Avoids timezone conversion issues
- Consistent across different deployment environments

**Note**: Ensure application servers are also set to UTC.

### Batch Processing Configuration

#### `spring.jpa.properties.hibernate.jdbc.batch_size=20`

**Purpose**: Number of SQL statements to batch together.

**Benefit**: Improves insert/update performance significantly.

**Recommendation**: 
- **Small inserts**: 20-50
- **Large bulk operations**: 50-100
- **PostgreSQL**: 20-50 is typically optimal

#### `spring.jpa.properties.hibernate.order_inserts=true`

**Purpose**: Orders INSERT statements for better batching.

**Benefit**: Groups similar INSERTs together, improving batch efficiency.

#### `spring.jpa.properties.hibernate.order_updates=true`

**Purpose**: Orders UPDATE statements for better batching.

**Benefit**: Groups similar UPDATEs together, improving batch efficiency.

#### `spring.jpa.properties.hibernate.jdbc.batch_versioned_data=true`

**Purpose**: Enables batching for versioned entities (using `@Version`).

**Benefit**: Improves performance for optimistic locking scenarios.

### `spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true`

**Purpose**: Enables non-contextual creation of LOB (Large Object) instances.

**Why Needed**: Required for PostgreSQL when using certain BLOB/CLOB operations.

---

## Flyway Migration Configuration

Flyway manages database schema versioning and migrations.

### `spring.flyway.enabled=true`

**Purpose**: Enables Flyway database migration.

**Note**: Set to `false` if using a different migration tool or manual schema management.

### `spring.flyway.locations=classpath:db/migration`

**Purpose**: Location of Flyway migration scripts.

**Default**: `classpath:db/migration`

**Migration Files**: Located in `src/main/resources/db/migration/`

**Naming Convention**: `V[version]__[description].sql`
- Example: `V1__create_users_table.sql`
- Example: `V2__add_email_index.sql`

### `spring.flyway.baseline-on-migrate=true`

**Purpose**: Creates baseline for existing database without Flyway metadata.

**When Needed**: 
- Migrating existing database to Flyway
- First-time setup with existing schema

**Production**: Set to `false` after initial setup.

### `spring.flyway.validate-on-migrate=true`

**Purpose**: Validates migration scripts before execution.

**Benefit**: Prevents corrupted migrations from being applied.

**Production**: Always `true` for safety.

---

## Cache Configuration

The application uses Caffeine cache for high-performance in-memory caching.

### `spring.cache.type=caffeine`

**Purpose**: Specifies Caffeine as the cache provider.

**Why Caffeine?**:
- High-performance in-memory cache
- Better than default (ConcurrentHashMap)
- Production-ready with eviction policies

### `spring.cache.cache-names`
```
projects,projects-summary,users,departments,domains,epics,releases,stories,tasks
```

**Purpose**: Defines named cache regions.

**Usage**: Each cache name can have different configurations and is used with `@Cacheable("cache-name")`.

**Cacheable Entities**:
- `projects`: Project data
- `projects-summary`: Aggregated project summaries
- `users`: User information
- `departments`: Department data
- `domains`: Domain/area information
- `epics`: Epic-level work items
- `releases`: Release information
- `stories`: User stories
- `tasks`: Task data

### `spring.cache.caffeine.spec=maximumSize=1000,expireAfterWrite=30m`

**Purpose**: Caffeine cache specification.

**Parameters**:
- `maximumSize=1000`: Maximum number of entries per cache
- `expireAfterWrite=30m`: Entries expire 30 minutes after being written

**Recommendations**:
- **Maximum Size**: Adjust based on available memory and data size
- **Expiration**: 
  - **Static data** (departments, domains): 60m-120m
  - **Dynamic data** (tasks, stories): 15m-30m
  - **Frequently changing**: 5m-15m

**Advanced Configuration**:
```
maximumSize=1000,expireAfterWrite=30m,expireAfterAccess=10m,recordStats
```
- `expireAfterAccess`: Expires entries not accessed within time
- `recordStats`: Enables cache statistics

---

## Security Configuration

### `spring.security.user.name=admin`

**Purpose**: Default Spring Security username.

**Note**: This is for basic authentication only. The application uses JWT for API authentication.

**Usage**: Typically used for actuator endpoints or development testing.

### `spring.security.user.password=admin123`

**Purpose**: Default Spring Security password.

**Security Note**: ⚠️ **Change in production** and use environment variables:
```
spring.security.user.password=${ADMIN_PASSWORD}
```

**Recommendation**: 
- Use strong passwords in production
- Store in environment variables or secrets management
- Consider disabling default user and using custom authentication

---

## Jackson JSON Configuration

Jackson handles JSON serialization/deserialization.

### `spring.jackson.serialization.write-dates-as-timestamps=false`

**Purpose**: Controls date/time serialization format.

**Value**: `false` (ISO-8601 format: `"2024-01-15T10:30:00Z"`)

**Why `false`?**: 
- ISO-8601 is standard and more readable
- Better frontend compatibility
- Timezone information included

**Alternative**: `true` uses numeric timestamps (milliseconds since epoch).

### `spring.jackson.deserialization.fail-on-unknown-properties=false`

**Purpose**: Controls behavior when JSON contains unknown properties.

**Value**: `false` (ignores unknown properties)

**Why `false`?**: 
- Allows API evolution without breaking clients
- More forgiving for partial updates
- Better backward compatibility

**Alternative**: `true` throws exception on unknown properties (stricter).

---

## Server Configuration

### `server.port=8080`

**Purpose**: HTTP server port.

**Default**: `8080`

**Production**: 
- Use environment variable: `server.port=${SERVER_PORT:8080}`
- Use standard ports: `80` (HTTP), `443` (HTTPS) behind reverse proxy

### `server.error.include-message=always`

**Purpose**: Includes error messages in error responses.

**Options**: 
- `always`: Always include message
- `on-param`: Include if `message` parameter present
- `never`: Never include message

**Security Consideration**: In production, consider `on-param` or `never` to avoid exposing sensitive information.

### `server.error.include-binding-errors=always`

**Purpose**: Includes binding errors (validation errors) in error responses.

**Recommendation**: `always` for development, `on-param` for production.

### `server.compression.enabled=true`

**Purpose**: Enables HTTP response compression.

**Benefit**: Reduces bandwidth usage and improves performance.

**Note**: Only compresses responses larger than `min-response-size`.

### `server.compression.mime-types`
```
application/json,application/xml,text/html,text/xml,text/plain,application/javascript,text/css
```

**Purpose**: MIME types to compress.

**Standard Types**: Includes JSON, XML, HTML, JavaScript, CSS.

**Additional**: Consider adding `application/font-woff`, `application/font-woff2` for font files.

### `server.compression.min-response-size=1024`

**Purpose**: Minimum response size (bytes) to trigger compression.

**Value**: 1024 bytes (1 KB)

**Recommendation**: 
- **Small APIs**: 1024 bytes
- **Large payloads**: 2048-4096 bytes
- Too low = unnecessary CPU overhead
- Too high = misses small compressible files

---

## DevTools Configuration

Spring Boot DevTools provides development-time features.

### `spring.devtools.restart.enabled=false`

**Purpose**: Enables automatic application restart on classpath changes.

**Production**: Always `false` (DevTools excluded from production builds)

**Development**: `true` for faster development cycle.

### `spring.devtools.livereload.enabled=true`

**Purpose**: Enables LiveReload server for automatic browser refresh.

**Port**: Default port `35729`

**Usage**: Works with LiveReload browser extensions.

**Production**: Automatically disabled (DevTools excluded).

---

## Management/Actuator Configuration

Spring Boot Actuator provides production-ready monitoring and management features.

### `management.endpoints.web.exposure.include=health,info,metrics`

**Purpose**: Endpoints to expose via HTTP.

**Exposed Endpoints**:
- `health`: Application health status
- `info`: Application information
- `metrics`: Application metrics

**Available Endpoints** (not exposed for security):
- `env`: Environment variables
- `beans`: Spring beans
- `configprops`: Configuration properties
- `loggers`: Logging configuration

**Production**: Only expose necessary endpoints to reduce attack surface.

### `management.endpoint.health.show-details=when-authorized`

**Purpose**: Controls health endpoint detail visibility.

**Options**:
- `never`: Never show details
- `when-authorized`: Show details to authenticated users
- `always`: Always show details

**Recommendation**: `when-authorized` for production, `always` for development.

**Security Note**: Health details may expose sensitive system information.

---

## Logging Configuration

### Application Logging

#### `logging.level.com.sprintsync.api=INFO`

**Purpose**: Logging level for application code.

**Value**: `INFO` (production), `DEBUG` (development)

**Levels** (from least to most verbose):
- `ERROR`: Only errors
- `WARN`: Warnings and errors
- `INFO`: Informational messages (recommended for production)
- `DEBUG`: Detailed debugging information
- `TRACE`: Very detailed tracing

#### `logging.level.org.springframework.security=INFO`

**Purpose**: Spring Security logging level.

**Recommendation**: `INFO` for production, `DEBUG` for troubleshooting authentication issues.

### Hibernate Logging

#### `logging.level.org.hibernate.SQL=false`

**Purpose**: Logs SQL statements executed by Hibernate.

**Production**: `false` (reduces log volume, improves performance)

**Development**: `DEBUG` for SQL debugging

#### `logging.level.org.hibernate.type.descriptor.sql.BasicBinder=false`

**Purpose**: Logs parameter binding in SQL statements.

**Production**: `false`

**Development**: `TRACE` for detailed SQL parameter debugging

### Logging Patterns

#### `logging.pattern.console`
```
%d{yyyy-MM-dd HH:mm:ss} - %msg%n
```

**Format**: `[timestamp] - [message]`

**Example**: `2024-01-15 10:30:45 - Application started successfully`

**Customization**: Add log level, thread, logger name:
```
%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

#### `logging.pattern.file`
```
%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

**Format**: `[timestamp] [thread] [level] [logger] - [message]`

**Components**:
- `%d{...}`: Date/time with pattern
- `[%thread]`: Thread name
- `%-5level`: Log level (left-aligned, 5 chars)
- `%logger{36}`: Logger name (max 36 chars)
- `%msg%n`: Message and newline

---

## API Documentation Configuration

SpringDoc OpenAPI (Swagger) provides interactive API documentation.

### `springdoc.api-docs.path=/api-docs`

**Purpose**: Path for OpenAPI JSON specification.

**Access**: `http://localhost:8080/api-docs`

**Default**: `/v3/api-docs`

**JSON Format**: OpenAPI 3.0 specification

### `springdoc.swagger-ui.path=/swagger-ui.html`

**Purpose**: Path for Swagger UI.

**Access**: `http://localhost:8080/swagger-ui.html`

**Default**: `/swagger-ui.html`

**Features**: Interactive API testing and documentation.

### `springdoc.swagger-ui.operationsSorter=method`

**Purpose**: Sorts API operations in Swagger UI.

**Options**:
- `method`: Sort by HTTP method (GET, POST, PUT, DELETE)
- `alpha`: Sort alphabetically
- Custom function

**Recommendation**: `method` groups operations logically.

---

## CORS Configuration

Cross-Origin Resource Sharing (CORS) allows frontend applications to access the API.

### `app.cors.allowed-origins`
```
http://localhost:3000,http://localhost:5173
```

**Purpose**: Allowed frontend origins.

**Current Origins**:
- `http://localhost:3000`: React development server (default)
- `http://localhost:5173`: Vite development server

**Production**: Replace with production frontend URLs:
```
app.cors.allowed-origins=https://app.sprintsync.com,https://www.sprintsync.com
```

**Security Note**: Never use `*` (wildcard) with credentials. Specify exact origins.

### `app.cors.allowed-methods`
```
GET,POST,PUT,DELETE,OPTIONS
```

**Purpose**: Allowed HTTP methods.

**Standard**: Includes common REST methods.

**Additional**: Add `PATCH` if used:
```
GET,POST,PUT,PATCH,DELETE,OPTIONS
```

### `app.cors.allowed-headers=*`

**Purpose**: Allowed request headers.

**Value**: `*` (all headers allowed)

**Production**: Specify exact headers for security:
```
Authorization,Content-Type,X-Requested-With
```

### `app.cors.allow-credentials=true`

**Purpose**: Allows cookies and authorization headers in CORS requests.

**Requirement**: When `true`, `allowed-origins` cannot be `*`.

**Use Case**: Required for JWT authentication cookies or session-based auth.

**Note**: These are custom properties. Ensure `SecurityConfig.java` reads and applies them.

---

## Environment-Specific Configuration

### Development vs. Production Differences

| Configuration | Development | Production |
|---------------|-------------|------------|
| `spring.jpa.show-sql` | `true` | `false` |
| `logging.level.com.sprintsync.api` | `DEBUG` | `INFO` |
| `logging.level.org.hibernate.SQL` | `DEBUG` | `false` |
| `spring.devtools.restart.enabled` | `true` | `false` |
| `server.error.include-message` | `always` | `on-param` |
| `management.endpoint.health.show-details` | `always` | `when-authorized` |
| `app.cors.allowed-origins` | `localhost:*` | Production URLs |
| Database credentials | Hardcoded (dev only) | Environment variables |

### Using Profile-Specific Properties

Create separate files for different environments:

**application-dev.properties** (Development):
```properties
spring.jpa.show-sql=true
logging.level.com.sprintsync.api=DEBUG
app.cors.allowed-origins=http://localhost:3000,http://localhost:5173
```

**application-prod.properties** (Production):
```properties
spring.jpa.show-sql=false
logging.level.com.sprintsync.api=INFO
app.cors.allowed-origins=https://app.sprintsync.com
spring.datasource.password=${DB_PASSWORD}
```

**Activate Profile**: 
- Environment variable: `SPRING_PROFILES_ACTIVE=prod`
- Command line: `java -jar app.jar --spring.profiles.active=prod`
- `application.properties`: `spring.profiles.active=prod`

---

## Best Practices

### 1. Security

✅ **DO**:
- Use environment variables for sensitive data (passwords, API keys)
- Use Spring Cloud Config or secrets management in production
- Restrict CORS origins to specific domains
- Use HTTPS in production
- Regularly rotate database credentials

❌ **DON'T**:
- Commit credentials to version control
- Use `*` for CORS with credentials
- Expose all actuator endpoints in production
- Use weak passwords

### 2. Database Configuration

✅ **DO**:
- Use connection pooling (HikariCP)
- Set appropriate pool sizes based on load
- Use connection validation
- Configure connection timeouts
- Monitor connection pool metrics

❌ **DON'T**:
- Create connections manually (use connection pool)
- Set pool size too high (exhausts database connections)
- Ignore connection leaks
- Use default connection pool settings in production

### 3. Performance

✅ **DO**:
- Enable HTTP compression
- Use caching for frequently accessed data
- Configure batch processing for bulk operations
- Use connection pooling efficiently
- Monitor and tune cache sizes

❌ **DON'T**:
- Enable verbose logging in production
- Use `open-in-view=true` (causes performance issues)
- Ignore connection pool metrics
- Over-cache frequently changing data

### 4. Logging

✅ **DO**:
- Use appropriate log levels per environment
- Structure log messages for parsing
- Include correlation IDs for request tracing
- Use async appenders for high-volume logging
- Rotate log files regularly

❌ **DON'T**:
- Log sensitive information (passwords, tokens, PII)
- Use DEBUG/TRACE in production
- Log SQL with parameters in production
- Ignore log file sizes

### 5. Configuration Management

✅ **DO**:
- Use profiles for environment-specific config
- Externalize configuration
- Document configuration changes
- Use version control for non-sensitive config
- Validate configuration on startup

❌ **DON'T**:
- Hardcode environment-specific values
- Mix environment configurations
- Duplicate configuration across files
- Ignore deprecated properties

---

## Security Considerations

### Critical Security Items

1. **Database Credentials**
   - ⚠️ Currently hardcoded in `application.properties`
   - ✅ Use environment variables: `spring.datasource.password=${DB_PASSWORD}`
   - ✅ Use secrets management in production

2. **CORS Configuration**
   - ⚠️ Currently allows `localhost` origins
   - ✅ Update for production frontend URLs
   - ✅ Never use wildcard (`*`) with credentials

3. **Actuator Endpoints**
   - ✅ Currently only exposes `health`, `info`, `metrics`
   - ✅ Keep sensitive endpoints (`env`, `configprops`) hidden
   - ✅ Use authentication for actuator endpoints in production

4. **Error Messages**
   - ⚠️ `server.error.include-message=always` may expose sensitive info
   - ✅ Consider `on-param` or `never` in production

5. **Logging**
   - ✅ Ensure no sensitive data in logs
   - ✅ Review log levels for information leakage

### Recommended Production Security Configuration

```properties
# Use environment variables
spring.datasource.password=${DB_PASSWORD}
spring.security.user.password=${ADMIN_PASSWORD}

# Restrict CORS
app.cors.allowed-origins=${FRONTEND_URLS}

# Secure error handling
server.error.include-message=on-param
server.error.include-binding-errors=on-param

# Secure actuator
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=when-authorized

# Production logging
logging.level.com.sprintsync.api=INFO
logging.level.org.hibernate.SQL=false
```

---

## Environment Variables Reference

### Recommended Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DB_PASSWORD` | Database password | `strong-password-123` |
| `DB_HOST` | Database host | `pg-36c174e-sprintsync.c.aivencloud.com` |
| `DB_PORT` | Database port | `23096` |
| `DB_NAME` | Database name | `defaultdb` |
| `DB_USERNAME` | Database username | `avnadmin` |
| `SERVER_PORT` | Application port | `8080` |
| `SPRING_PROFILES_ACTIVE` | Active profile | `prod` |
| `FRONTEND_URLS` | CORS allowed origins | `https://app.sprintsync.com` |
| `ADMIN_PASSWORD` | Admin user password | `secure-admin-pass` |

### Using Environment Variables in Properties

```properties
spring.datasource.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:defaultdb}
spring.datasource.username=${DB_USERNAME:avnadmin}
spring.datasource.password=${DB_PASSWORD}
server.port=${SERVER_PORT:8080}
app.cors.allowed-origins=${FRONTEND_URLS:http://localhost:3000}
```

**Syntax**: `${VARIABLE_NAME:default_value}`
- `VARIABLE_NAME`: Environment variable name
- `:default_value`: Optional default if variable not set

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failures

**Symptoms**: `SQLException: Connection refused` or timeout errors

**Solutions**:
- Verify database host and port are correct
- Check network connectivity to database
- Verify credentials are correct
- Check database connection limits
- Review HikariCP connection pool settings

#### 2. Connection Pool Exhaustion

**Symptoms**: `HikariPool - Connection is not available` errors

**Solutions**:
- Reduce `maximum-pool-size` if hitting database limits
- Check for connection leaks (enable leak detection)
- Increase `connection-timeout` if needed
- Monitor active connections

#### 3. CORS Errors in Frontend

**Symptoms**: `Access-Control-Allow-Origin` errors in browser console

**Solutions**:
- Verify frontend URL is in `app.cors.allowed-origins`
- Check that `allow-credentials=true` if using cookies
- Ensure CORS configuration is applied in `SecurityConfig`
- Verify HTTP method is allowed

#### 4. Flyway Migration Failures

**Symptoms**: Application fails to start with Flyway errors

**Solutions**:
- Check migration script syntax
- Verify migration version numbers are sequential
- Check for conflicting migrations
- Review `spring.flyway.baseline-on-migrate` setting
- Check database user has necessary permissions

#### 5. Performance Issues

**Symptoms**: Slow response times, high database load

**Solutions**:
- Enable HTTP compression
- Review cache configuration and hit rates
- Optimize Hibernate batch settings
- Review logging levels (reduce verbose logging)
- Check connection pool metrics
- Enable query caching if appropriate

---

## Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [HikariCP Configuration](https://github.com/brettwooldridge/HikariCP)
- [Flyway Documentation](https://flywaydb.org/documentation/)
- [Spring Data JPA Documentation](https://spring.io/projects/spring-data-jpa)
- [Caffeine Cache](https://github.com/ben-manes/caffeine)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [SpringDoc OpenAPI](https://springdoc.org/)

---

## Changelog

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Initial | Initial documentation for application.properties |

---

## Contact

For questions or issues related to configuration:
- Review this documentation first
- Check Spring Boot official documentation
- Consult with the development team
- Review configuration logs on application startup

---

**Document Version**: 1.0.0  
**Last Updated**: January 2024  
**Maintained By**: SprintSync Development Team





