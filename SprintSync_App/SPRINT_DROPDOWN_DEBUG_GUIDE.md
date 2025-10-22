# Sprint Dropdown Debugging Guide

## 🐛 Issue: Sprint Dropdown Showing No Records

### **What I've Added to Help Debug:**

#### **1. Console Logging** 🔍
Added comprehensive debug logging that runs every time the state changes:

```typescript
console.log('=== SCRUM PAGE DEBUG ===');
console.log('Projects:', projects);
console.log('Projects Count:', projects.length);
console.log('Selected Project:', selectedProject);
console.log('Sprints Data Raw:', sprintsData);
console.log('Sprints Data Structure:', {
  hasData: !!sprintsData,
  hasDataProp: !!sprintsData?.data,
  dataType: Array.isArray(sprintsData?.data) ? 'array' : typeof sprintsData?.data,
  dataLength: Array.isArray(sprintsData?.data) ? sprintsData.data.length : 'N/A'
});
console.log('Sprints Loading:', sprintsLoading);
console.log('Sprints Array:', sprints);
console.log('Sprints Count:', sprints.length);
console.log('Selected Sprint:', selectedSprint);
```

**What to Check in Console:**
1. Are projects loading? (Projects Count should be > 0)
2. Is a project selected? (Selected Project should have an ID)
3. Is sprints data being fetched? (Sprints Data Raw should show response)
4. What's the data structure? (Should be an array)
5. Are sprints being extracted? (Sprints Count should match API response)

---

#### **2. Visual Indicators** 👁️

**Sprint Count Badge:**
- Shows loading spinner while fetching
- Displays count: "X sprint(s)"
- Only visible when project is selected

**Refresh Button:**
- Manual refresh of sprints data
- Shows spinner while loading
- Helps verify if issue is with caching

**Empty State Message:**
- Shows "No sprints available" in dropdown placeholder
- Shows detailed message in Sprint Management tab
- Provides "Create First Sprint" button

---

#### **3. Conditional API Calls** 🎯

Fixed hooks to only call API when valid IDs exist:

```typescript
// useSprints.ts
export function useSprintsByProject(projectId: string, params?: PaginationParams) {
  return useApi(
    () => projectId && projectId !== 'SKIP' 
      ? sprintApiService.getSprintsByProject(projectId, params) 
      : Promise.resolve({ 
          data: [] as Sprint[], 
          success: true, 
          message: '', 
          status: 200 
        }),
    [projectId, JSON.stringify(params)],
    !!(projectId && projectId !== 'SKIP') // Only execute if projectId is valid
  );
}
```

**Benefits:**
- ✅ Prevents API calls with empty/invalid IDs
- ✅ Returns empty array instead of error
- ✅ No 404 errors in console
- ✅ Better user experience

---

## 📊 Debugging Steps

### **Step 1: Open Browser Console**
Press `F12` or `Ctrl+Shift+I` to open DevTools

### **Step 2: Navigate to Scrum Page**
The console should show:
```
=== SCRUM PAGE DEBUG ===
Projects: Array(X) [...]
Projects Count: X
Selected Project: PROJ0000000000001
...
```

### **Step 3: Check Network Tab**
Look for these API calls:
```
✅ GET http://localhost:8080/api/projects
✅ GET http://localhost:8080/api/sprints/project/PROJ0000000000001
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": "SPRT0000000000001",
      "projectId": "PROJ0000000000001",
      "name": "Sprint 1",
      "goal": "Initial sprint",
      "status": "ACTIVE",
      "startDate": "2025-10-01",
      "endDate": "2025-10-15",
      "capacityHours": 160,
      "velocityPoints": 0,
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "status": 200,
  "success": true,
  "message": "Success"
}
```

### **Step 4: Verify Data Extraction**
Check console for:
```
Sprints Data Structure: {
  hasData: true,
  hasDataProp: true,
  dataType: 'array',
  dataLength: 1  // Should match number of sprints
}
Sprints Array: Array(1) [...]
Sprints Count: 1
```

---

## 🔍 Common Issues & Solutions

### **Issue 1: No Sprints in Database**
**Symptom:** API returns empty array `[]`

**Solution:** 
1. Click "Create Sprint" button
2. Or use Sprint Management tab
3. Backend may not have sample data

**How to Check:**
```sql
SELECT * FROM sprints WHERE project_id = 'YOUR_PROJECT_ID';
```

---

### **Issue 2: Wrong Project ID**
**Symptom:** Console shows project ID but sprints count is 0

**Solution:**
- Check if the project ID in the database matches
- Verify the project actually has sprints
- Check the `project_id` foreign key in sprints table

**Debug:**
```javascript
// In console
console.log('API URL:', `http://localhost:8080/api/sprints/project/${selectedProject}`);
```

---

### **Issue 3: API Returns Different Structure**
**Symptom:** Console shows data exists but sprints array is empty

**Possible Causes:**
- API returns paginated response (with `content` field)
- API returns different field name
- Data extraction logic mismatch

**Current Extraction:**
```typescript
const sprints = selectedProject ? (sprintsData?.data || []) : [];
```

**If API returns paginated:**
```typescript
// Check console for sprintsData structure
// If it has sprintsData.data.content, update to:
const sprints = selectedProject ? (sprintsData?.data?.content || sprintsData?.data || []) : [];
```

---

### **Issue 4: Hook Not Calling API**
**Symptom:** No network request in Network tab

**Possible Causes:**
- `selectedProject` is empty/undefined
- Hook's `immediate` flag is false
- Component unmounted before fetch

**Solution:**
Check the `immediate` parameter in useApi:
```typescript
useApi(
  () => apiCall(),
  [dependencies],
  true  // <- Should be true for immediate execution
);
```

---

## 🧪 Testing Checklist

Run these tests in order:

### **Test 1: Projects Load**
- [ ] Open Scrum page
- [ ] Check console: "Projects Count: X" (should be > 0)
- [ ] Check project dropdown shows options
- [ ] Verify auto-selection works

### **Test 2: Sprint API Called**
- [ ] Select a project (or wait for auto-select)
- [ ] Open Network tab
- [ ] Look for: `GET /api/sprints/project/{projectId}`
- [ ] Check response status (should be 200)
- [ ] Check response body (should have sprints array)

### **Test 3: Sprints Display**
- [ ] Check console: "Sprints Count: X"
- [ ] Check sprint dropdown
  - Shows "Loading..." initially
  - Shows "No sprints available" if empty
  - Shows sprint list if data exists
- [ ] Verify sprint count badge appears

### **Test 4: Manual Refresh**
- [ ] Click refresh button (🔄)
- [ ] Verify API call in Network tab
- [ ] Check if sprints update

### **Test 5: Create Sprint**
- [ ] Go to Sprint Management tab
- [ ] Click "Create Sprint"
- [ ] Fill form and submit
- [ ] Verify new sprint appears in dropdown

---

## 🔧 Quick Fixes

### **If Sprints Still Don't Show:**

#### **Option 1: Check API Response Format**
Add this to console:
```javascript
// In browser console after page loads
window.sprintsDebug = sprintsData;
console.log('Full sprints data:', window.sprintsDebug);
```

#### **Option 2: Verify Backend Has Data**
```bash
# In database
SELECT id, name, project_id, status FROM sprints LIMIT 10;
```

#### **Option 3: Test API Directly**
```bash
# In terminal or Postman
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/sprints/project/PROJ0000000000001
```

#### **Option 4: Check Response Wrapper**
The backend might wrap response differently. Check if it's:
```json
// Option A: Direct array
[{sprint1}, {sprint2}]

// Option B: Wrapped in data
{ "data": [{sprint1}, {sprint2}] }

// Option C: Paginated
{ "data": { "content": [{sprint1}], "totalElements": 1 } }
```

Update extraction accordingly in ScrumPage.tsx line 170.

---

## 📝 Debug Output Guide

### **Good Output (Working):**
```
=== SCRUM PAGE DEBUG ===
Projects: Array(5) [...]
Projects Count: 5
Selected Project: PROJ0000000000001
Sprints Data Raw: { data: Array(3), success: true, ... }
Sprints Data Structure: {
  hasData: true,
  hasDataProp: true,
  dataType: 'array',
  dataLength: 3
}
Sprints Loading: false
Sprints Array: Array(3) [...]
Sprints Count: 3
Selected Sprint: SPRT0000000000001
```

### **Bad Output (No Data):**
```
=== SCRUM PAGE DEBUG ===
Projects: Array(5) [...]
Projects Count: 5
Selected Project: PROJ0000000000001
Sprints Data Raw: { data: [], success: true, ... }
Sprints Data Structure: {
  hasData: true,
  hasDataProp: true,
  dataType: 'array',
  dataLength: 0  // <- Issue: No sprints in database
}
Sprints Loading: false
Sprints Array: []
Sprints Count: 0  // <- Empty
Selected Sprint: ''
```

### **Bad Output (Wrong Structure):**
```
Sprints Data Raw: { data: { content: [...], totalPages: 5 }, ... }
Sprints Data Structure: {
  hasData: true,
  hasDataProp: true,
  dataType: 'object',  // <- Should be 'array'
  dataLength: 'N/A'
}
Sprints Array: []  // <- Extraction failed
Sprints Count: 0
```

**Fix:** Update line 170:
```typescript
const sprints = selectedProject ? (sprintsData?.data?.content || sprintsData?.data || []) : [];
```

---

## ✅ Current Implementation Status

### **Features Added:**
- ✅ Console debugging for all state changes
- ✅ Visual sprint count badge
- ✅ Manual refresh button
- ✅ Empty state with helpful message
- ✅ "Create First Sprint" quick action
- ✅ Conditional API calls (no calls with invalid IDs)
- ✅ Loading states throughout

### **What to Look For:**
1. **Console Logs**: Check structure of `sprintsData`
2. **Network Tab**: Verify API is being called with correct URL
3. **Response**: Check if backend returns empty array or has data
4. **Database**: Verify sprints exist for the project

---

## 🚀 Next Steps

Based on the console output:

### **If `Sprints Count: 0` and API returns empty array:**
→ **Database has no sprints for this project**
   - Solution: Create sprints using the UI
   - Or: Run database migration/seeding script

### **If `Sprints Data Structure` shows wrong type:**
→ **API response format doesn't match expectation**
   - Solution: Update data extraction logic
   - Check backend controller response structure

### **If API not called:**
→ **Hook condition not met**
   - Solution: Verify `selectedProject` has value
   - Check hook's `immediate` parameter

### **If API returns 404:**
→ **Backend endpoint doesn't exist or wrong URL**
   - Solution: Verify backend is running
   - Check `SprintController` has `/project/{projectId}` endpoint
   - Verify URL construction in `sprintApi.ts`

---

## 📞 Support

With the debug logging in place, you should be able to:
1. **See exactly what data is returned** from the API
2. **Identify where the issue is** (frontend vs backend vs database)
3. **Get clear error messages** if something fails

Check the browser console and share the debug output to identify the exact issue! 🎯

