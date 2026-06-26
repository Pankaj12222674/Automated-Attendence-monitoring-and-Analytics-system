# 🚀 SmartAttendance – Automated Attendance Monitoring & Analytics System

**A modern full-stack web application for educational institutions to automate attendance tracking, manage students efficiently, and gain actionable analytics.**

SmartAttendance streamlines daily attendance with multiple marking methods (manual, QR, face recognition), role-specific dashboards, bulk operations, and insightful reports — built as a comprehensive B.Tech CSE portfolio project.

![Dashboard Overview](https://github.com/user-attachments/assets/8fdd2927-67a7-41f7-96a7-7ed80a21d28c)
![Analytics View](https://github.com/user-attachments/assets/0a56c220-b51a-45bf-9450-adbddd44cc41)

## 🌐 Live Demo

- **Frontend (Vercel):** https://automated-attendence-monitoring-and.vercel.app
- **Backend:** Deployed separately (API endpoints ready for integration)

---

## ✨ Key Features

### Role-Based Access & Dashboards
- **Admin Dashboard**: Full control — create/manage classes, subjects, assign teachers, add/manage students (individual CRUD + bulk CSV/Excel upload), view all records, system analytics.
- **Teacher Dashboard**: View assigned classes, mark attendance via **Manual entry**, **QR Code scanning**, or **Face Recognition** (face-api.js), access student profiles & attendance history, class performance insights.
- **Student Dashboard**: Personal attendance percentage, subject-wise breakdown, low-attendance alerts & warnings, academic overview/history.

### Advanced Functionality
- 📸 Student profiles with photo upload & management (course, year, section)
- 📄 Bulk student import via CSV/Excel with validation
- 🔍 Powerful search, filters & sorting across students/records
- 📅 Timetable management & viewing
- 📢 Announcements & notifications system
- ⚠️ Low attendance alerts for at-risk students
- 📊 Analytics & reporting (trends, class-wise stats)
- 🔐 Secure JWT authentication with role-based authorization (Admin/Teacher/Student)
- 📤 Image uploads via Multer + Cloudinary
- 💳 QR code generation & scanning for quick attendance
- Face recognition attendance powered by face-api.js

---

## 🛠️ Tech Stack

**Frontend**
- React.js (Vite)
- Tailwind CSS for modern, responsive UI
- React Router, Axios for API calls
- face-api.js (client-side face recognition)
- QR code libraries

**Backend**
- Node.js + Express.js
- MongoDB with Mongoose ODM
  - Models: User, Attendance, Subject, Class, Timetable, etc.
- JWT for secure auth
- Role-based middleware
- Multer for multipart file uploads

**DevOps & Extras**
- Cloudinary (image storage)
- jsPDF (report generation)
- Vercel (frontend hosting)
- Environment-based configuration

---

## 📈 Analytics & Insights

- Class-wise and student-wise attendance tracking
- Performance trends and visualizations
- Early warning system for low attendance (expandable to ML prediction tying into educational data mining research)
- Exportable reports

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+) & npm
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (free tier works)

### 1. Clone Repository
```bash
git clone https://github.com/Pankaj12222674/Automated-Attendence-monitoring-and-Analytics-system.git
cd Automated-Attendence-monitoring-and-Analytics-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
PORT=8000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
# Optional: EMAIL_ for notifications
```

Start backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` in `frontend/`:
```env
VITE_API_URL=http://localhost:8000   # or your deployed backend URL
```

Start frontend:
```bash
npm run dev
```

Visit http://localhost:5173 (or configured port)

---

## 🚀 Deployment

- **Frontend**: Deployed on Vercel (see live demo link above)
- **Backend**: Can be deployed on Render, Railway, or similar Node.js platforms
- Update environment variables in production dashboards

---

## 📁 Project Structure
```
Automated-Attendence-monitoring-and-Analytics-system/
├── backend/
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints (auth, attendance, class, admin, etc.)
│   ├── models/          # Mongoose schemas (User, Attendance, Class, Subject...)
│   ├── middleware/      # Auth, role checks
│   ├── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI
│   │   ├── pages/        # Dashboards (Admin, Teacher, Student)
│   │   ├── App.jsx
│   │   └── ...
├── README.md
└── package.json (root or per folder)
```

---

## 🔮 Future Roadmap

- 🧠 AI/ML integration: Student performance prediction & early dropout warning (building on Educational Data Mining research)
- 📱 Mobile-first PWA or React Native app
- 📊 Rich interactive charts & dashboards (Recharts/Chart.js)
- 📧 Email/SMS notifications for alerts
- 📄 Advanced export (PDF, Excel)
- 🔄 Real-time updates with WebSockets
- Multi-institution support

---

## 👨‍💻 Author & Connect

**Pankaj Kumar**  
B.Tech Computer Science & Engineering | Full Stack Developer | ML for Education Enthusiast

- 👨‍💻 GitHub: [Pankaj12222674](https://github.com/Pankaj12222674)
- 🐦 X/Twitter: [@pk4801377](https://x.com/pk4801377)
- 📇 LinkedIn: [pankaj-kumar-a89a51238](https://linkedin.com/in/pankaj-kumar-a89a51238/)
- 🎬 YouTube: UxMythic (One Piece edits & tech content)
- 🌐 Portfolio Website: [Vercel projects](https://automated-attendence-monitoring-and.vercel.app)

Building production-ready apps and research-backed educational tools.

---

## ⭐ Show Your Support

If SmartAttendance inspires your own projects or helps in education tech, please **star** this repository ⭐ and share feedback!

---

*This project demonstrates full-stack development skills (MERN-style), computer vision integration, secure auth, and scalable database design — ideal for software developer roles and placements.*
