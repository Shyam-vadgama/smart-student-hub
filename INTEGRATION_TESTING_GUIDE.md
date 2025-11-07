# 🧪 Integration Testing Guide

## Quick Start - Testing Your Integration System

### Navigation to Integrations
1. Login as **Principal**
2. You'll see the **navbar at the top** with search, notifications, and profile
3. On the left, you'll see the **collapsible sidebar** with menu items
4. The main content area has **tabs**: Departments, HOD Assignments, Announcements, **Integrations**
5. Click on the **"Integrations" tab** to access the integration management UI

---

## 🌐 Free Open-Source APIs for Testing

### 1. **JSONPlaceholder** (Best for Quick Testing)
**URL:** `https://jsonplaceholder.typicode.com`
**Auth:** None required
**Perfect for:** Testing basic integration flow

**Configuration:**
```
Integration Name: JSONPlaceholder Test
Type: student-management
Base URL: https://jsonplaceholder.typicode.com
Auth Type: api-key (leave API key empty)
Endpoints:
  - Students: /users
  - Marks: /posts
  - Subjects: /albums
```

**Test it:**
```bash
curl https://jsonplaceholder.typicode.com/users
```

---

### 2. **ReqRes** (Realistic User Data)
**URL:** `https://reqres.in/api`
**Auth:** None required
**Perfect for:** Student/Faculty data simulation

**Configuration:**
```
Integration Name: ReqRes API
Type: student-management
Base URL: https://reqres.in/api
Auth Type: api-key (leave empty)
Endpoints:
  - Students: /users
  - Faculty: /users?page=2
```

**Test it:**
```bash
curl https://reqres.in/api/users
```

---

### 3. **DummyJSON** (Rich Mock Data)
**URL:** `https://dummyjson.com`
**Auth:** None required
**Perfect for:** Comprehensive testing with realistic data

**Configuration:**
```
Integration Name: DummyJSON
Type: student-management
Base URL: https://dummyjson.com
Auth Type: api-key (leave empty)
Endpoints:
  - Students: /users
  - Marks: /posts
  - Subjects: /products
```

**Test it:**
```bash
curl https://dummyjson.com/users
```

---

### 4. **OpenWeatherMap** (API Key Testing)
**URL:** `https://api.openweathermap.org/data/2.5`
**Auth:** API Key required (free tier available)
**Perfect for:** Testing API key authentication

**Get Free API Key:**
1. Sign up at https://openweathermap.org/api
2. Get your API key from dashboard

**Configuration:**
```
Integration Name: Weather API Test
Type: custom
Base URL: https://api.openweathermap.org/data/2.5
Auth Type: api-key
API Key: YOUR_API_KEY
Endpoints:
  - Custom: /weather?q=London&appid=YOUR_API_KEY
```

---

### 5. **GitHub API** (Bearer Token Testing)
**URL:** `https://api.github.com`
**Auth:** Bearer token (optional for public data)
**Perfect for:** Testing bearer authentication

**Configuration:**
```
Integration Name: GitHub API
Type: custom
Base URL: https://api.github.com
Auth Type: bearer (leave empty for public data)
Endpoints:
  - Students: /users
  - Custom: /repos/microsoft/vscode
```

**Test it:**
```bash
curl https://api.github.com/users
```

---

### 6. **The Cat API** (Fun Testing)
**URL:** `https://api.thecatapi.com/v1`
**Auth:** API Key (free)
**Perfect for:** Testing image/data APIs

**Get Free API Key:**
Sign up at https://thecatapi.com/signup

**Configuration:**
```
Integration Name: Cat API Test
Type: custom
Base URL: https://api.thecatapi.com/v1
Auth Type: api-key
API Key: YOUR_API_KEY
Custom Headers: {"x-api-key": "YOUR_API_KEY"}
Endpoints:
  - Custom: /images/search?limit=10
```

---

## 🚀 Local Mock API Server (Recommended!)

I'll create a simple Express server that mimics a college ERP system for realistic testing.

### Setup Instructions:

1. **Create the mock server** (see `mock-erp-server.js` below)
2. **Install dependencies:**
```bash
cd server
npm install express cors body-parser
```

3. **Run the mock server:**
```bash
node mock-erp-server.js
```

4. **Server will run on:** `http://localhost:3001`

### Integration Configuration for Mock Server:
```
Integration Name: Mock College ERP
Type: student-management
Base URL: http://localhost:3001/api
Auth Type: api-key
API Key: test-api-key-12345
Custom Headers: {"X-College-ID": "COLLEGE001"}
Endpoints:
  - Attendance: /attendance
  - Marks: /marks
  - Students: /students
  - Faculty: /faculty
  - Subjects: /subjects
  - Timetable: /timetable
Sync Interval: 5 (minutes)
```

---

## 📝 Step-by-Step Testing Process

### Test 1: Basic Connection Test
1. Add integration with JSONPlaceholder
2. Click **"Test"** button
3. Should show success message

### Test 2: Manual Sync
1. After successful test
2. Click **"Sync"** button
3. Check sync logs for results

### Test 3: Auto Sync
1. Enable the integration
2. Set sync interval to 5 minutes
3. Wait and check sync logs

### Test 4: API Key Authentication
1. Use OpenWeatherMap or Cat API
2. Add your API key
3. Test connection

### Test 5: Custom Headers
1. Use mock server
2. Add custom headers in JSON format:
```json
{
  "X-College-ID": "COLLEGE001",
  "X-Custom-Header": "value"
}
```

### Test 6: Multiple Endpoints
1. Configure all endpoint types
2. Sync each type
3. Verify data in logs

### Test 7: Error Handling
1. Use invalid API key
2. Use wrong endpoint
3. Check error messages in logs

---

## 🔍 What to Check

### ✅ Success Indicators:
- Green "Active" status badge
- "Last synced" shows recent time
- Sync logs show successful operations
- No error messages

### ❌ Error Indicators:
- Red "Error" status badge
- Error messages in sync logs
- "Test" button shows failure
- Last sync shows old timestamp

---

## 🐛 Common Issues & Solutions

### Issue 1: "Connection Failed"
**Solutions:**
- Check if URL is accessible (try in browser)
- Verify no typos in base URL
- Check if API requires authentication
- Ensure no firewall blocking

### Issue 2: "Authentication Failed"
**Solutions:**
- Verify API key is correct
- Check auth type matches API requirements
- Some APIs need headers instead of query params
- Try different auth method

### Issue 3: "No Data Returned"
**Solutions:**
- Check endpoint path is correct
- Verify API returns data in expected format
- Check if pagination is needed
- Look at sync logs for details

### Issue 4: "CORS Error"
**Solutions:**
- Only affects browser requests
- Backend requests should work fine
- If testing from frontend, API must support CORS

---

## 📊 Expected Data Formats

### Attendance Data:
```json
{
  "data": [
    {
      "studentId": "CS2101",
      "date": "2024-01-15",
      "status": "present",
      "subject": "Data Structures"
    }
  ]
}
```

### Marks Data:
```json
{
  "data": [
    {
      "studentId": "CS2101",
      "subject": "Data Structures",
      "marks": 85,
      "maxMarks": 100,
      "examType": "midterm"
    }
  ]
}
```

### Student Data:
```json
{
  "data": [
    {
      "id": "CS2101",
      "name": "John Doe",
      "email": "john@example.com",
      "department": "Computer Science",
      "year": 2
    }
  ]
}
```

---

## 🎯 Testing Checklist

- [ ] Can access Integrations tab in Principal Dashboard
- [ ] Can add new integration
- [ ] Can test connection successfully
- [ ] Can manually trigger sync
- [ ] Can view sync logs
- [ ] Can edit integration
- [ ] Can toggle enable/disable
- [ ] Can delete integration
- [ ] Auto-sync works after interval
- [ ] Error handling works correctly
- [ ] Multiple integrations can coexist
- [ ] Different auth types work

---

## 💡 Pro Tips

1. **Start Simple:** Use JSONPlaceholder first (no auth needed)
2. **Check Logs:** Always check sync logs for detailed info
3. **Test Incrementally:** Test one endpoint at a time
4. **Use Postman:** Test API endpoints independently first
5. **Monitor Network:** Use browser DevTools to see API calls
6. **Check Console:** Look for error messages in browser console

---

## 🔗 Quick Test URLs

Copy-paste these for instant testing:

**JSONPlaceholder:**
```
https://jsonplaceholder.typicode.com/users
https://jsonplaceholder.typicode.com/posts
```

**ReqRes:**
```
https://reqres.in/api/users
https://reqres.in/api/users?page=2
```

**DummyJSON:**
```
https://dummyjson.com/users
https://dummyjson.com/products
```

**GitHub:**
```
https://api.github.com/users
https://api.github.com/repos/facebook/react
```

---

## 🎬 Video Walkthrough Steps

1. **Login** as Principal
2. **Navigate** to Integrations tab (4th tab)
3. **Click** "Add Integration" button
4. **Fill in** JSONPlaceholder details
5. **Click** "Test" - should succeed
6. **Click** "Sync" - should import data
7. **View** sync logs - should show results
8. **Enable** auto-sync
9. **Done!** Integration is working

---

## 📞 Need Help?

If integration isn't working:
1. Check browser console for errors
2. Check server logs
3. Verify API is accessible
4. Test API with curl/Postman first
5. Check sync logs for detailed errors

Happy Testing! 🚀
