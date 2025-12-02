package com.sprintsync.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

import javax.net.ssl.*;
import java.security.cert.X509Certificate;

/**
 * SprintSync API Application
 * 
 * Main Spring Boot application class for the SprintSync project management API.
 * Provides REST endpoints for managing projects, epics, releases, stories, tasks, and more.
 * 
 * @author Mayuresh G
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class SprintSyncApiApplication {

    // Configure SSL trust before Spring initializes (for Aiven PostgreSQL)
    static {
        try {
            TrustManager[] trustAllCerts = new TrustManager[] {
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                }
            };
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
        } catch (Exception e) {
            System.err.println("Warning: SSL trust configuration failed: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        SpringApplication.run(SprintSyncApiApplication.class, args);
    }
}
