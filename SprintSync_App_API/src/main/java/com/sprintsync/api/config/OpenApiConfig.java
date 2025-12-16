package com.sprintsync.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI/Swagger Configuration for SprintSync API.
 * Provides comprehensive API documentation with JWT authentication support.
 * 
 * Access Swagger UI at: http://localhost:8080/swagger-ui.html
 * Access OpenAPI JSON at: http://localhost:8080/api-docs
 * 
 * @author SprintSync Team
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI sprintSyncOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        
        return new OpenAPI()
            .info(new Info()
                .title("SprintSync API")
                .description("""
                    ## SprintSync Project Management API
                    
                    This API provides endpoints for managing:
                    - **Projects** - Create and manage projects
                    - **Sprints** - Plan and track sprints
                    - **Stories** - Manage user stories and requirements
                    - **Tasks & Subtasks** - Track work items
                    - **Users & Teams** - User management and team assignments
                    - **Dashboards** - Analytics and reporting
                    - **Backlogs** - Backlog management
                    
                    ### Authentication
                    Most endpoints require JWT authentication. Use the `/api/auth/login` endpoint 
                    to obtain a token, then click the **Authorize** button above and enter your token.
                    
                    ### Schema
                    This API uses the `sprintsync` database schema.
                    """)
                .version("1.0.0")
                .contact(new Contact()
                    .name("SprintSync Team")
                    .email("support@sprintsync.com")
                    .url("https://sprintsync.com"))
                .license(new License()
                    .name("Proprietary")
                    .url("https://sprintsync.com/license")))
            .servers(List.of(
                new Server()
                    .url("http://localhost:" + serverPort)
                    .description("Local Development Server"),
                new Server()
                    .url("http://localhost:8080")
                    .description("Default Server")))
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                    .name(securitySchemeName)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Enter your JWT token obtained from /api/auth/login")));
    }
}
