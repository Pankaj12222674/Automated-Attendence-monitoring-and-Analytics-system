🚀 SmartAttendance – Automated Attendance Monitoring & Analytics System

SmartAttendance is a full-stack web application designed to automate and streamline attendance tracking in educational institutions.
It provides real-time attendance management, analytics, and role-based dashboards for Admins, Teachers, and Students.

<img width="1908" height="860" alt="image" src="https://github.com/user-attachments/assets/8fdd2927-67a7-41f7-96a7-7ed80a21d28c" />
<img width="1918" height="872" alt="image" src="https://github.com/user-attachments/assets/0a56c220-b51a-45bf-9450-adbddd44cc41" />



## 🌐 Live Demo

* 🔗 Frontend: https://your-frontend-url.vercel.app
* 🔗 Backend: https://your-backend-url.onrender.com

---

## 📌 Features

### 👨‍💼 Admin Panel

* Create and manage classes
* Assign teachers to classes
* Add students to classes
* Create subjects
* View all system data (classes, teachers, subjects)

### 👨‍🏫 Teacher Dashboard

* View assigned classes
* Mark attendance (Manual / QR / Face Recognition ready)
* View class analytics
* Access student details

### 👨‍🎓 Student Dashboard

* View attendance percentage
* Track subject-wise attendance
* Receive low attendance alerts

---

## 📊 Analytics

* Class-wise attendance tracking
* Student performance insights
* Attendance trends (expandable to charts)

---

## 🔐 Authentication & Security

* JWT-based authentication
* Role-based access control (Admin / Teacher / Student)
* Protected routes
* Secure password hashing

---

## 🛠️ Tech Stack

### Frontend

* React.js (Vite)
* Tailwind CSS
* Axios
* React Router

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Other Tools

* Cloudinary (Image upload)
* QR Code integration
* Face recognition (face-api.js)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/SmartAttendance.git
cd SmartAttendance
```

---

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:

```env
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret
PORT=8000
CLOUDINARY_NAME=your_name
CLOUDINARY_KEY=your_key
CLOUDINARY_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Setup Frontend

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

Run frontend:

```bash
npm run dev
```

---

## 🚀 Deployment

* Frontend deployed on Vercel
* Backend deployed on Render
* Environment variables configured for production

---

## 📂 Project Structure

```
SmartAttendance/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   └── App.jsx
│
└── README.md
```

---

## 🎯 Future Enhancements

* 📱 Mobile responsiveness improvements
* 📈 Advanced analytics dashboards (charts)
* 🤖 AI-based attendance prediction
* 🔔 Notification system
* 📊 Export reports (PDF/Excel)

---

## 👨‍💻 Author

**Pankaj Kumar**

* GitHub: https://github.com/Pankaj12222674
* LinkedIn: https://linkedin.com/in/pankaj-kumar-a89a51238/

---

## ⭐ Show Your Support

If you like this project, give it a ⭐ on GitHub!

---
