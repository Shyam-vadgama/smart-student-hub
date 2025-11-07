# 🚀 Quick Start - Mock ERP Server

## Option 1: Using the Mock Server (Recommended for Testing)

### Step 1: Install Dependencies
```bash
cd server
npm install express cors body-parser
```

### Step 2: Start the Mock Server
```bash
node mock-erp-server.js
```

You should see:
```
╔════════════════════════════════════════════════════════════╗
║        🎓 Mock College ERP API Server Running! 🎓         ║
║  Server URL: http://localhost:3001                        ║
║  API Key: test-api-key-12345                              ║
╚════════════════════════════════════════════════════════════╝
```

### Step 3: Test the Mock Server
Open a new terminal and run:
```bash
curl http://localhost:3001/api/students -H "x-api-key: test-api-key-12345"
```

You should see JSON data with student information!

### Step 4: Configure Integration in Principal Dashboard

1. **Login as Principal**
2. **Go to Integrations tab**
3. **Click "Add Integration"**
4. **Fill in these details:**

```
Integration Name: Mock College ERP
Integration Type: student-management
Base URL: http://localhost:3001/api
Authentication Type: api-key
API Key: test-api-key-12345

Custom Headers (optional):
{
  "X-College-ID": "COLLEGE001"
}

Endpoints:
  Attendance: /attendance
  Marks: /marks
  Timetable: /timetable
  Students: /students
  Faculty: /faculty
  Subjects: /subjects

Sync Interval: 5 (minutes)
Enable Integration: ✓ (checked)
```

5. **Click "Test"** - Should show success!
6. **Click "Sync"** - Should import data!
7. **Check Sync Logs** - Should show successful sync!

---

## Option 2: Using Free Public APIs (No Setup Required)

### JSONPlaceholder (Easiest!)

**No installation needed!** Just configure:

```
Integration Name: JSONPlaceholder Test
Integration Type: student-management
Base URL: https://jsonplaceholder.typicode.com
Authentication Type: api-key
API Key: (leave empty)

Endpoints:
  Students: /users
  Marks: /posts
  Subjects: /albums

Sync Interval: 5
Enable Integration: ✓
```

**Test it now:**
```bash
curl https://jsonplaceholder.typicode.com/users
```

### DummyJSON (Rich Data!)

```
Integration Name: DummyJSON
Integration Type: student-management
Base URL: https://dummyjson.com
Authentication Type: api-key
API Key: (leave empty)

Endpoints:
  Students: /users
  Marks: /posts
  Subjects: /products

Sync Interval: 5
Enable Integration: ✓
```

**Test it now:**
```bash
curl https://dummyjson.com/users
```

---

## 🎯 Quick Testing Checklist

After configuring any integration:

1. ✅ Click **"Test"** button - Should show "Connection successful"
2. ✅ Click **"Sync"** button - Should show "Sync started"
3. ✅ Click on integration card - View sync logs
4. ✅ Toggle **Enable/Disable** - Should work
5. ✅ Wait 5 minutes - Auto-sync should trigger

---

## 🐛 Troubleshooting

### Mock Server Won't Start
**Error:** `Cannot find module 'express'`
**Fix:**
```bash
cd server
npm install express cors body-parser
```

### Connection Test Fails
**Error:** "Connection failed"
**Fix:**
- Make sure mock server is running (check terminal)
- Verify URL is `http://localhost:3001/api` (not 3000!)
- Check API key is exactly: `test-api-key-12345`

### No Data in Sync Logs
**Fix:**
- Click "Sync" button manually first
- Check if endpoints are correct (no leading slash in endpoint field)
- Look at browser console for errors

---

## 📊 What Data You'll See

### Students (5 students):
- Rahul Sharma (CS2101)
- Priya Patel (CS2102)
- Amit Kumar (CS2103)
- Sneha Reddy (EC2101)
- Vikram Singh (ME2101)

### Faculty (3 faculty):
- Dr. Amit Kumar (Computer Science)
- Dr. Sunita Sharma (Computer Science)
- Prof. Rajesh Verma (Electronics)

### Subjects (4 subjects):
- Data Structures (CS401)
- Database Management Systems (CS402)
- Operating Systems (CS403)
- Computer Networks (CS404)

### Attendance Records:
- Multiple entries for different students and subjects
- Dates, times, and status (present/absent)

### Marks:
- Midterm exams and assignments
- Grades and scores for different subjects

---

## 🎬 Video-Style Steps

### For Mock Server:
1. Open terminal
2. Type: `cd server`
3. Type: `npm install express cors body-parser`
4. Type: `node mock-erp-server.js`
5. See success message with ASCII art!
6. Keep this terminal open
7. Go to Principal Dashboard → Integrations
8. Add integration with details above
9. Test → Sync → Success! 🎉

### For JSONPlaceholder:
1. Go to Principal Dashboard → Integrations
2. Click "Add Integration"
3. Copy-paste JSONPlaceholder config
4. Click "Test" → Success!
5. Click "Sync" → Data imported!
6. Done in 2 minutes! 🚀

---

## 💡 Pro Tips

1. **Use Mock Server** for realistic college data
2. **Use JSONPlaceholder** for quick testing without setup
3. **Check sync logs** to see what data was imported
4. **Test one endpoint** at a time first
5. **Keep mock server running** in a separate terminal

---

## 🎓 Next Steps

After successful integration:
1. Try editing the integration
2. Test different sync intervals
3. Try multiple integrations at once
4. Check how data appears in other dashboards
5. Test webhook functionality (advanced)

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Green "Active" badge on integration card
- ✅ "Last synced: Just now" appears
- ✅ Sync logs show successful operations
- ✅ No error messages
- ✅ Data count increases after sync

---

Happy Testing! 🚀

Need help? Check `INTEGRATION_TESTING_GUIDE.md` for detailed troubleshooting!
