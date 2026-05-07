package com.sprintsync.api.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import jakarta.annotation.PostConstruct;

/**
 * Emergency database migration fixer to resolve the entry_type constraint issue.
 * Runs on startup to ensure the database is in the correct state regardless of Flyway status.
 */
@Configuration
public class DatabaseMigrationFixer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixDatabaseSchema() {
        System.out.println("DEBUG: Running multi-schema database migration fix...");
        try {
            // 1. Find ALL schemas where the 'time_entries' table exists with an 'entry_type' column
            String findColumnsSql = "SELECT table_schema, data_type FROM information_schema.columns " +
                                   "WHERE table_name = 'time_entries' AND column_name = 'entry_type'";
            
            java.util.List<java.util.Map<String, Object>> results = jdbcTemplate.queryForList(findColumnsSql);
            
            if (results.isEmpty()) {
                System.out.println("DEBUG: No 'time_entries' table with 'entry_type' column found in any schema.");
                return;
            }

            for (java.util.Map<String, Object> row : results) {
                String schema = (String) row.get("table_schema");
                String dataType = (String) row.get("data_type");
                
                System.out.println("DEBUG: Processing schema: " + schema);

                // Drop the check constraint in this schema
                try {
                    jdbcTemplate.execute("ALTER TABLE " + schema + ".time_entries DROP CONSTRAINT IF EXISTS chk_entry_type");
                    System.out.println("DEBUG: Successfully dropped constraint chk_entry_type in schema " + schema);
                } catch (Exception e) {
                    System.out.println("DEBUG: Note: Could not drop constraint in " + schema + " (it might not exist): " + e.getMessage());
                }

                // Convert to VARCHAR if it's an enum or other type
                if (dataType != null && !dataType.equalsIgnoreCase("character varying") && !dataType.equalsIgnoreCase("varchar")) {
                    System.out.println("DEBUG: entry_type in " + schema + " is currently " + dataType + ". Converting to VARCHAR(50)...");
                    jdbcTemplate.execute("ALTER TABLE " + schema + ".time_entries ALTER COLUMN entry_type TYPE VARCHAR(50) USING entry_type::text");
                    System.out.println("DEBUG: Successfully converted " + schema + ".time_entries.entry_type to VARCHAR(50)");
                } else {
                    System.out.println("DEBUG: entry_type in " + schema + " is already VARCHAR/text.");
                }
            }
            
            System.out.println("DEBUG: Multi-schema database migration fix completed successfully.");
        } catch (Exception e) {
            System.err.println("DEBUG: Failed to run database migration fix: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
