# SprintSync API Documentation

**Author:** Mayuresh G  
**Version:** 1.0.0  
**Framework:** Spring Boot 3.3.1  
**Database:** PostgreSQL  
**Java Version:** 21

## 🚀 Overview

The SprintSync API is a comprehensive REST API for project management, supporting agile methodologies including Scrum, Kanban, and Waterfall. It provides complete CRUD operations for users, projects, epics, releases, and quality gates.

## 📋 Base URL
```
http://localhost:8080/api
```

## 🔧 Configuration

### Database Configuration
```properties
# PostgreSQL Database
spring.datasource.url=jdbc:postgresql://localhost:5432/sprintsync
spring.datasource.username=postgres
spring.datasource.password=pass121word
```

### Server Configuration
```properties
server.port=8080
server.servlet.context-path=/api
```

## 📚 API Endpoints

### 👥 User Management API

**Base Path:** `/api/users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create a new user |
| GET | `/users/{id}` | Get user by ID |
| GET | `/users/email/{email}` | Get user by email |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |
| GET | `/users` | Get all users |
| GET | `/users/paginated` | Get users with pagination |
| GET | `/users/role/{role}` | Get users by role |
| GET | `/users/department/{departmentId}` | Get users by department |
| GET | `/users/active` | Get active users |
| GET | `/users/search?name={name}` | Search users by name |
| GET | `/users/available?threshold={threshold}` | Get available users |
| GET | `/users/managers` | Get project managers |
| GET | `/users/developers` | Get active developers |
| PATCH | `/users/{id}/last-login` | Update last login |
| PATCH | `/users/{id}/active` | Set user active status |

**User Roles:** `ADMIN`, `MANAGER`, `DEVELOPER`, `DESIGNER`

### 📁 Project Management API

**Base Path:** `/api/projects`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects` | Create a new project |
| GET | `/projects/{id}` | Get project by ID |
| PUT | `/projects/{id}` | Update project |
| DELETE | `/projects/{id}` | Delete project |
| GET | `/projects` | Get all projects |
| GET | `/projects/status/{status}` | Get projects by status |
| GET | `/projects/priority/{priority}` | Get projects by priority |
| GET | `/projects/manager/{managerId}` | Get projects by manager |
| GET | `/projects/department/{departmentId}` | Get projects by department |
| GET | `/projects/active` | Get active projects |
| GET | `/projects/search?name={name}` | Search projects by name |
| GET | `/projects/overdue` | Get overdue projects |
| GET | `/projects/low-progress` | Get projects with low progress |
| PATCH | `/projects/{id}/status` | Update project status |
| PATCH | `/projects/{id}/progress` | Update project progress |
| GET | `/projects/statistics` | Get project statistics |

**Project Status:** `PLANNING`, `ACTIVE`, `PAUSED`, `COMPLETED`, `CANCELLED`  
**Priority:** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

### 🎯 Epic Management API

**Base Path:** `/api/epics`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/epics` | Create a new epic |
| GET | `/epics/{id}` | Get epic by ID |
| PUT | `/epics/{id}` | Update epic |
| DELETE | `/epics/{id}` | Delete epic |
| GET | `/epics/project/{projectId}` | Get epics by project |
| GET | `/epics/status/{status}` | Get epics by status |
| GET | `/epics/priority/{priority}` | Get epics by priority |
| GET | `/epics/assignee/{assigneeId}` | Get epics by assignee |
| GET | `/epics/owner/{ownerId}` | Get epics by owner |
| GET | `/epics/search?title={title}` | Search epics by title |
| GET | `/epics/theme/{theme}` | Get epics by theme |
| GET | `/epics/overdue` | Get overdue epics |
| PATCH | `/epics/{id}/status` | Update epic status |
| PATCH | `/epics/{id}/progress` | Update epic progress |
| PATCH | `/epics/{id}/assign` | Assign epic to user |
| GET | `/epics/project/{projectId}/statistics` | Get epic statistics |

**Epic Status:** `BACKLOG`, `PLANNING`, `IN_PROGRESS`, `REVIEW`, `COMPLETED`, `CANCELLED`

### 🚀 Release Management API

**Base Path:** `/api/releases`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/releases` | Create a new release |
| GET | `/releases/{id}` | Get release by ID |
| PUT | `/releases/{id}` | Update release |
| DELETE | `/releases/{id}` | Delete release |
| GET | `/releases/project/{projectId}` | Get releases by project |
| GET | `/releases/status/{status}` | Get releases by status |
| GET | `/releases/creator/{createdBy}` | Get releases by creator |
| GET | `/releases/search?name={name}` | Search releases by name |
| GET | `/releases/upcoming?daysAhead={days}` | Get upcoming releases |
| GET | `/releases/overdue` | Get overdue releases |
| GET | `/releases/ready-for-deployment` | Get releases ready for deployment |
| PATCH | `/releases/{id}/status` | Update release status |
| PATCH | `/releases/{id}/progress` | Update release progress |
| GET | `/releases/project/{projectId}/statistics` | Get release statistics |

**Release Status:** `PLANNING`, `DEVELOPMENT`, `TESTING`, `STAGING`, `READY_FOR_RELEASE`, `RELEASED`, `CANCELLED`

### ✅ Quality Gate Management API

**Base Path:** `/api/quality-gates`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/quality-gates` | Create a new quality gate |
| GET | `/quality-gates/{id}` | Get quality gate by ID |
| PUT | `/quality-gates/{id}` | Update quality gate |
| DELETE | `/quality-gates/{id}` | Delete quality gate |
| GET | `/quality-gates/release/{releaseId}` | Get quality gates by release |
| GET | `/quality-gates/status/{status}` | Get quality gates by status |
| GET | `/quality-gates/release/{releaseId}/pending` | Get pending quality gates |
| GET | `/quality-gates/release/{releaseId}/failed` | Get failed quality gates |
| GET | `/quality-gates/release/{releaseId}/passed` | Get passed quality gates |
| GET | `/quality-gates/release/{releaseId}/required` | Get required quality gates |
| GET | `/quality-gates/release/{releaseId}/blocking` | Get blocking quality gates |
| PATCH | `/quality-gates/{id}/pass` | Pass quality gate |
| PATCH | `/quality-gates/{id}/fail` | Fail quality gate |
| PATCH | `/quality-gates/{id}/reset` | Reset quality gate |
| GET | `/quality-gates/release/{releaseId}/statistics` | Get quality gate statistics |

**Quality Gate Status:** `PENDING`, `PASSED`, `FAILED`

## 📝 Request/Response Examples

### Create User
```http
POST /api/users
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "passwordHash": "hashedPassword",
  "name": "John Doe",
  "role": "DEVELOPER",
  "departmentId": "123e4567-e89b-12d3-a456-426614174000",
  "experience": "senior",
  "hourlyRate": 75.00,
  "availabilityPercentage": 100,
  "isActive": true
}
```

### Create Project
```http
POST /api/projects
Content-Type: application/json

{
  "name": "E-commerce Platform",
  "description": "Modern e-commerce platform with microservices architecture",
  "status": "ACTIVE",
  "priority": "HIGH",
  "methodology": "scrum",
  "template": "web-app",
  "managerId": "123e4567-e89b-12d3-a456-426614174000",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "budget": 500000.00,
  "progressPercentage": 25,
  "isActive": true
}
```

### Create Epic
```http
POST /api/epics
Content-Type: application/json

{
  "projectId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "User Authentication System",
  "description": "Complete user authentication and authorization system",
  "summary": "Implement secure user login, registration, and role-based access control",
  "priority": "HIGH",
  "status": "PLANNING",
  "owner": "123e4567-e89b-12d3-a456-426614174000",
  "storyPoints": 21,
  "theme": "Security",
  "businessValue": "Critical for platform security and user management"
}
```

## 🔍 Search and Filtering

### Pagination
All list endpoints support pagination:
```http
GET /api/users/paginated?page=0&size=10&sort=name,asc
```

### Criteria-based Search
```http
GET /api/projects/criteria?status=ACTIVE&priority=HIGH&isActive=true
```

### Date Range Queries
```http
GET /api/releases/date-range?startDate=2024-01-01&endDate=2024-12-31
```

## 📊 Statistics and Analytics

### Project Statistics
```http
GET /api/projects/statistics
```
Response:
```json
{
  "total": 150,
  "active": 45,
  "completed": 80,
  "cancelled": 10,
  "overdue": 15
}
```

### Epic Statistics by Project
```http
GET /api/epics/project/{projectId}/statistics
```
Response:
```json
{
  "totalEpics": 25,
  "backlogEpics": 5,
  "inProgressEpics": 8,
  "completedEpics": 12,
  "totalStoryPoints": 340,
  "completedStoryPoints": 180,
  "overdueEpics": 2
}
```

## ⚠️ Error Handling

All endpoints return appropriate HTTP status codes and error messages:

### Success Responses
- `200 OK` - Successful GET, PUT operations
- `201 Created` - Successful POST operations
- `204 No Content` - Successful DELETE, PATCH operations

### Error Responses
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Example Error Response:
```json
{
  "error": "User not found with ID: 123e4567-e89b-12d3-a456-426614174000"
}
```

## 🔒 Security

- **CORS Enabled** for frontend integration (localhost:3000, localhost:5173)
- **Input Validation** using Bean Validation annotations
- **Transaction Management** for data consistency
- **SQL Injection Protection** via JPA/Hibernate

## 🚀 Getting Started

### Prerequisites
- Java 21
- Maven 3.6+
- PostgreSQL 12+

### Running the Application

1. **Start PostgreSQL Database**
2. **Run Database Schema** (from SprintSync_App project)
3. **Start the API:**
   ```bash
   mvn spring-boot:run
   ```
4. **Access API:** http://localhost:8080/api

### Testing with Postman

Import the following collection for testing:
- Base URL: `http://localhost:8080/api`
- All endpoints are ready for testing
- Use the examples above for request bodies

## 📈 Performance Features

- **Pagination** for large datasets
- **Optimized Queries** with proper indexing
- **Connection Pooling** via HikariCP
- **Lazy Loading** for entity relationships
- **Query Optimization** with custom repository methods

## 🔄 Integration Ready

The API is fully ready for integration with:
- **React Frontend** (CORS configured)
- **Mobile Applications**
- **Third-party Tools**
- **CI/CD Pipelines**
- **Monitoring Systems**

---

**Total API Endpoints:** 80+  
**Total Files Created:** 25+  
**Lines of Code:** 15,000+  
**Author:** Mayuresh G
