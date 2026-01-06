# 📦 Exam Invigilator System - Complete Installation Guide

This guide will walk you through setting up the Exam Invigilator System from scratch. No prior experience required!

---

## 📋 Table of Contents

1. [Prerequisites - What You Need to Install](#1-prerequisites---what-you-need-to-install)
2. [Downloading the Project](#2-downloading-the-project)
3. [Backend Setup (Java Spring Boot)](#3-backend-setup-java-spring-boot)
4. [Frontend Setup (React)](#4-frontend-setup-react)
5. [Running the Application](#5-running-the-application)
6. [Testing the Application](#6-testing-the-application)
7. [Troubleshooting Common Issues](#7-troubleshooting-common-issues)
8. [Default Login Credentials](#8-default-login-credentials)

---

## 1. Prerequisites - What You Need to Install

### 1.1 Java Development Kit (JDK 17)

**What is it?** Java runtime needed to run the backend server.

**Download & Install:**

1. **Windows/Mac/Linux:**
    - Go to: [https://adoptium.net/temurin/releases/](https://adoptium.net/temurin/releases/)
    - Select: **Version: 17 (LTS)**
    - Click your operating system (Windows, macOS, Linux)
    - Download the `.msi` (Windows) or `.pkg` (Mac) installer
    - Run the installer and follow the wizard (keep all default settings)

2. **Verify Installation:**
    - Open Command Prompt (Windows) or Terminal (Mac/Linux)
    - Type: `java -version`
    - You should see: `openjdk version "17.x.x"`

**If you see an error:**
- Restart your computer after installation
- Make sure you selected JDK 17 (not 11, 21, etc.)

---

### 1.2 IntelliJ IDEA Community Edition

**What is it?** IDE (code editor) for running the Java backend.

**Download & Install:**

1. Go to: [https://www.jetbrains.com/idea/download/](https://www.jetbrains.com/idea/download/)
2. Download **Community Edition** (free version)
3. Run the installer
4. **Important:** During installation, check these boxes:
    - ✅ Create Desktop Shortcut
    - ✅ Update PATH variable (on Windows)
    - ✅ Add "Open Folder as Project"
    - ✅ `.java` file association

5. Launch IntelliJ IDEA after installation

---

### 1.3 Node.js and npm

**What is it?** JavaScript runtime and package manager for the React frontend.

**Download & Install:**

1. Go to: [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS version** (currently v20.x.x - the green button)
3. Run the installer
4. Keep all default settings and click "Next" through the wizard
5. ✅ Make sure "Automatically install necessary tools" is checked

**Verify Installation:**
```bash
node -version
npm -version
```

You should see version numbers like:
```
v20.11.0
10.2.4
```

---

### 1.4 Git (Optional but Recommended)

**What is it?** Version control system to download the project.

**Download & Install:**

1. **Windows:**
    - Go to: [https://git-scm.com/download/win](https://git-scm.com/download/win)
    - Download and run the installer
    - Keep all default settings

2. **Mac:**
    - Open Terminal and type: `git --version`
    - If not installed, it will prompt you to install Command Line Tools

3. **Linux:**
   ```bash
   sudo apt-get install git  # Ubuntu/Debian
   sudo yum install git       # CentOS/Fedora
   ```

**Verify Installation:**
```bash
git --version
```

---

### 1.5 GitHub Setup (New PC)
```bash
# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Clone the repository
git clone https://github.com/YOUR-USERNAME/exam-invigilator.git
cd exam-invigilator
```

---

## 2. Downloading the Project

### Option A: Using Git (Recommended)

1. Open Command Prompt (Windows) or Terminal (Mac/Linux)
2. Navigate to where you want to save the project:
   ```bash
   cd Desktop
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/exam-invigilator.git
   ```
4. Enter the project folder:
   ```bash
   cd exam-invigilator
   ```

### Option B: Download as ZIP

1. Go to the GitHub repository page
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP file to your Desktop
5. Rename the folder to `exam-invigilator` (remove `-main` suffix if present)

---

## 3. Backend Setup (Java Spring Boot)

### 3.1 Open Backend in IntelliJ IDEA

1. **Launch IntelliJ IDEA**
2. Click **"Open"** on the welcome screen
3. Navigate to your project folder and select the **`backend`** folder
    - Example: `C:\Users\YourName\Desktop\exam-invigilator\backend`
4. Click **"OK"**

### 3.2 Wait for Maven to Download Dependencies

**What's happening?** IntelliJ is downloading all required Java libraries automatically.

- Look at the **bottom-right corner** of IntelliJ
- You'll see a progress bar: `"Maven: Resolving dependencies..."`
- **Wait until it finishes** (2-5 minutes depending on internet speed)
- When done, you'll see: `"Build completed successfully"`

**If you see errors:**
- Go to: **File → Invalidate Caches → Invalidate and Restart**
- After restart, right-click `pom.xml` → **Maven → Reload Project**

### 3.3 Configure JDK in IntelliJ (If Prompted)

If IntelliJ says "No JDK configured":

1. Go to: **File → Project Structure** (or press `Ctrl+Alt+Shift+S`)
2. Under **Project**, click **SDK** dropdown
3. Click **Add SDK → Download JDK**
4. Select:
    - **Vendor:** Eclipse Temurin (AdoptOpenJDK)
    - **Version:** 17
5. Click **Download**
6. Click **OK**

### 3.4 Run the Backend

1. In IntelliJ, expand the project tree on the left:
   ```
   backend
   └── src
       └── main
           └── java
               └── com.examapp
                   └── ExamInvigilatorApplication.java
   ```

2. **Right-click** on `ExamInvigilatorApplication.java`
3. Select **"Run 'ExamInvigilatorApplication'"**

4. **Wait for the server to start** (30-60 seconds first time)

5. **Success!** When you see this in the console:
   ```
   ===========================================
   ✅ Exam Invigilator API is running!
   📍 Server: http://localhost:8080
   📚 API Base: http://localhost:8080/api
   ===========================================
   ```

**Keep this window open!** The backend must stay running.

---

## 4. Frontend Setup (React)

### 4.1 Open Terminal/Command Prompt

**Windows:**
- Press `Win + R`, type `cmd`, press Enter
- OR use Windows Terminal from Start Menu

**Mac:**
- Press `Cmd + Space`, type "Terminal", press Enter

**Linux:**
- Press `Ctrl + Alt + T`

### 4.2 Navigate to Frontend Folder

```bash
cd Desktop/exam-invigilator/frontend
```

**Tip:** Adjust the path based on where you extracted/cloned the project.

### 4.3 Install Dependencies

```bash
npm install
```

**What's happening?** npm is downloading all React libraries.

- This takes **2-5 minutes**
- You'll see lots of text scrolling
- **Wait until you see a new command prompt** (no errors)

**If you see `ERESOLVE` warnings:**
- These are normal! Ignore them.
- Only worry if installation completely fails.

**If installation fails with permission errors (Mac/Linux):**
```bash
sudo npm install
```

### 4.4 Start the Frontend

```bash
npm start
```

**What's happening?**
- React development server is starting
- Takes 30-60 seconds
- Browser will automatically open to `http://localhost:3000`

**Success!** When you see:
```
Compiled successfully!

You can now view exam-invigilator-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**Keep this terminal open!** The frontend must stay running.

---

## 5. Running the Application

### 5.1 Access the Application

1. **Open your browser** (Chrome, Edge, Firefox, Safari)
2. Go to: **`http://localhost:3000`**
3. You should see the **Login Page**

### 5.2 Login

Use the default credentials:

- **Username:** `invigilator1`
- **Password:** `password123`

Click **"Login"**

### 5.3 Explore the Dashboard

After login, you'll see:
- **My Assigned Exams** - List of exams you're invigilating
- For each exam, you can:
    - ✅ Mark Attendance
    - 🚨 Report Incident
    - 📊 View Reports

---

## 6. Testing the Application

### 6.1 Test Marking Attendance

1. Click **"Mark Attendance"** on any exam
2. You'll see a list of students
3. Click **"Present"**, **"Absent"**, or **"Late"** for each student
4. Notice the status updates immediately

### 6.2 Test Reporting an Incident

1. Go back to Dashboard (click "← Back to Dashboard")
2. Click **"Report Incident"** on an exam
3. Fill out the form:
    - Select a student (or leave as "General Incident")
    - Choose category (Cheating, Health Emergency, etc.)
    - Select severity (Low, Medium, High)
    - Enter description
4. Click **"Report Incident"**
5. See it appear in the incidents table

### 6.3 Test Viewing Reports

1. Click **"View Reports"** on an exam
2. See attendance statistics:
    - Total students
    - Present/Absent/Late counts
    - Attendance percentage
    - Incident count

---

## 7. Troubleshooting Common Issues

### ❌ "Port 8080 is already in use"

**Problem:** Another application is using port 8080.

**Solution (Windows):**
```cmd
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F
```
Replace `<PID_NUMBER>` with the number shown.

**Solution (Mac/Linux):**
```bash
lsof -ti:8080 | xargs kill -9
```

---

### ❌ "Failed to load exams" in Browser

**Problem:** Backend isn't running or connection issue.

**Solution:**
1. Check IntelliJ console - is backend running?
2. Verify you see the green checkmark message
3. Try accessing: `http://localhost:8080/api/exams` in browser
4. If you see JSON or error page (not "connection refused"), backend is working

**If Kaspersky/Antivirus is installed:**
- Temporarily disable Web Protection
- OR add `localhost` to antivirus exceptions

---

### ❌ "npm: command not found"

**Problem:** Node.js not installed or not in PATH.

**Solution:**
1. Reinstall Node.js from [nodejs.org](https://nodejs.org)
2. **Restart your computer** after installation
3. Try `npm -version` again

---

### ❌ "Cannot find module 'react'" or similar

**Problem:** Dependencies not installed.

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json  # Delete old files
npm install                             # Reinstall
npm start
```

---

### ❌ IntelliJ shows "Cannot resolve symbol" errors

**Problem:** IDE indexing issue or dependencies not loaded.

**Solution:**
1. **File → Invalidate Caches → Invalidate and Restart**
2. After restart: Right-click `pom.xml` → **Maven → Reload Project**
3. Wait for indexing to complete (bottom progress bar)

---

### ❌ Backend starts but shows errors in console

**Problem:** Database or configuration issue.

**Solution:**
1. Stop the backend (red square button in IntelliJ)
2. Delete the database file: `backend/examdb.db`
3. Run the backend again (it will recreate the database)

---

### ❌ Browser shows blank page after login

**Problem:** JavaScript error or React build issue.

**Solution:**
1. Open browser console: Press **F12** → **Console** tab
2. Check for error messages
3. Try **hard refresh**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. Clear browser cache: **F12** → **Application** → **Clear storage** → **Clear site data**

---

## 8. Default Login Credentials

The system comes with pre-configured users for testing:

| Username | Password | Role | Name |
|----------|----------|------|------|
| `invigilator1` | `password123` | INVIGILATOR | John Doe |
| `invigilator2` | `password123` | INVIGILATOR | Jane Smith |
| `admin` | `admin123` | ADMIN | Admin User |

### Sample Data Included:

**Students:** 8 students (BCS25165336 to BCS25165343)

**Exams:**
- BSC121 - Software Engineering (Today, 9:00 AM, Hall A)
- BSC122 - Database Systems (Tomorrow, 2:00 PM, Hall B)
- BSC123 - Data Structures (In 3 days, 10:00 AM, Lab C)
- BSC124 - Computer Networks (In 5 days, 9:00 AM, Hall A)

---

## 🎉 Congratulations!

You've successfully set up the Exam Invigilator System!

### Next Steps:

1. **Explore the Features:**
    - Mark attendance for different students
    - Report various types of incidents
    - View attendance and incident reports

2. **Customize the System:**
    - Add new users in the database
    - Create additional exams
    - Modify the frontend styling

3. **Develop New Features:**
    - Backend: Edit files in `backend/src/main/java/com/examapp/`
    - Frontend: Edit files in `frontend/src/`

---

## 📚 Additional Resources

### API Documentation

Access the backend directly:
- **Base URL:** `http://localhost:8080/api`
- **Test with Postman:** [Download Postman](https://www.postman.com/downloads/)

### Key Endpoints:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login | No |
| GET | `/api/exams` | Get my exams | Yes |
| GET | `/api/exams/{id}/students` | Get exam students | Yes |
| POST | `/api/attendance` | Mark attendance | Yes |
| POST | `/api/incidents` | Report incident | Yes |
| GET | `/api/attendance/exam/{id}/summary` | Get attendance summary | Yes |

**Auth Required:** Add header `Authorization: Bearer <token>` (get token from login)

---

## 🐛 Need More Help?

1. **Check the Backend Console (IntelliJ)** - Look for red error messages
2. **Check the Frontend Console (Browser F12)** - Look for JavaScript errors
3. **Check the Browser Network Tab (F12 → Network)** - See what requests are failing

### Project Structure:

```
exam-invigilator/
├── backend/
│   ├── src/main/java/com/examapp/
│   │   ├── config/          # Security, CORS, Database setup
│   │   ├── controller/      # REST API endpoints
│   │   ├── dto/            # Data transfer objects
│   │   ├── model/          # Database entities
│   │   ├── repository/     # Database queries
│   │   ├── service/        # Business logic
│   │   └── util/           # JWT utilities
│   ├── pom.xml             # Maven dependencies
│   └── src/main/resources/
│       └── application.properties  # Configuration
│
└── frontend/
    ├── public/
    │   └── index.html      # HTML template
    ├── src/
    │   ├── components/     # Reusable React components
    │   ├── pages/          # Page components
    │   ├── services/       # API calls
    │   ├── App.js          # Main app component
    │   └── index.js        # Entry point
    └── package.json        # npm dependencies
```

---

## 🔒 Security Notes

**⚠️ Important for Production:**

This setup is for **development/testing only**. Before deploying:

1. Change all default passwords
2. Use environment variables for secrets
3. Enable proper JWT token validation
4. Use HTTPS instead of HTTP
5. Implement proper CORS policies
6. Add rate limiting
7. Use a production database (PostgreSQL/MySQL instead of SQLite)

---

## 📝 License

[Add your license information here]

---

**Happy Coding! 🚀**

*Last Updated: October 2025*
*Version: 1.0.0*
