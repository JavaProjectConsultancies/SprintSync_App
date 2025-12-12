package com.sprintsync.api;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

/**
 * Servlet Initializer for WAR deployment to external Tomcat server.
 * 
 * This class extends SpringBootServletInitializer to configure the application
 * when deployed as a WAR file to an external servlet container like Tomcat.
 * 
 * @author SprintSync Team
 * @version 1.0.0
 */
public class ServletInitializer extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(SprintSyncApiApplication.class);
    }
}
