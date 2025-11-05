# Backend Connection Guide

## Network Error Troubleshooting

If you're seeing "Failed to fetch" or "NETWORK_ERROR" with status 0, it means the frontend cannot connect to the backend API server.

## Quick Checks

### 1. Verify Backend Server is Running

The backend should be running on `http://localhost:8080/api`

**Check if backend is running:**
```bash
# Windows PowerShell
Invoke-WebRequest -Uri http://localhost:8080/api/users -Method GET

# Or in browser, try:
http://localhost:8080/api/users
```

### 2. Start Backend Server

If the backend is not running:

**Option A: Using Maven (Recommended)**
```bash
cd SprintSync_App_API
mvn spring-boot:run
```

**Option B: Using the provided script**
```bash
# Windows
cd SprintSync_App_API
start-backend.bat

# Linux/Mac
cd SprintSync_App_API
./mvnw spring-boot:run
```

### 3. Verify Port Configuration

The backend should be running on port **8080**. Check:
- `SprintSync_App_API/src/main/resources/application.properties`
- Look for: `server.port=8080`

### 4. Check CORS Configuration

The backend should allow requests from `http://localhost:3000` (or your frontend port).

Check: `SprintSync_App_API/src/main/java/com/sprintsync/api/config/SecurityConfig.java`
- Should have: `@CrossOrigin(origins = "*")` or allow your frontend origin

### 5. Firewall/Antivirus

Sometimes firewall or antivirus software blocks localhost connections. Try:
- Temporarily disable firewall
- Add exception for port 8080
- Check if antivirus is blocking the connection

## Configuration

### Change API Base URL

If your backend is running on a different port or host:

**Option 1: Environment Variable (Recommended)**
Create a `.env` file in `SprintSync_App/`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

**Option 2: Direct Configuration**
Edit `SprintSync_App/src/services/api/config.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://your-backend-url:port/api',
  // ...
};
```

## Common Issues

### Issue: "Failed to fetch" with status 0
**Cause:** Backend server is not running or not accessible
**Solution:** Start the backend server (see step 2)

### Issue: CORS errors
**Cause:** Backend not allowing frontend origin
**Solution:** Check SecurityConfig.java and ensure CORS is configured

### Issue: Connection refused
**Cause:** Backend running on wrong port or firewall blocking
**Solution:** Verify port 8080 is open and backend is running

### Issue: Timeout errors
**Cause:** Backend is slow or database connection issues
**Solution:** Check backend logs and database connectivity

## Testing Backend Connection

1. **Check if backend is responding:**
   ```bash
   curl http://localhost:8080/api/users
   ```

2. **Check backend logs:**
   Look for startup messages like:
   ```
   Started Application in X.XXX seconds
   ```

3. **Check browser console:**
   - Look for API Request logs showing the full URL
   - Verify the URL matches your backend configuration

## Next Steps

Once the backend is running:
1. The frontend should automatically connect
2. Check browser console for successful API calls
3. Network errors should disappear

For notification issues, ensure:
- Backend is running and accessible
- Database is connected
- Notifications table exists in database

