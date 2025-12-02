#!/bin/bash
# Quick fix script to add estimated_hours column to stories table
# This fixes the 500 error on /api/stories endpoint

echo ""
echo "============================================"
echo "Fixing stories table - Adding estimated_hours column"
echo "============================================"
echo ""

# Database connection details from application.properties
DB_HOST="pg-36c174e-sprintsync.c.aivencloud.com"
DB_PORT="23096"
DB_NAME="defaultdb"
DB_USER="avnadmin"
DB_PASSWORD="AVNS_fo7-HjILanrHp67LRuC"

echo "Connecting to database..."
echo ""

# Set password for psql
export PGPASSWORD="$DB_PASSWORD"

# Run the SQL fix
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f run_fix.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "============================================"
    echo "SUCCESS! Column added successfully."
    echo "Please restart your Spring Boot application."
    echo "============================================"
else
    echo ""
    echo "============================================"
    echo "ERROR: Failed to add column."
    echo "Please check your database connection."
    echo "============================================"
fi

# Unset password
unset PGPASSWORD

