const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// اتصال Supabase (PostgreSQL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect((err) => {
    if (err) console.log("DB Connection Error:", err);
    else console.log("Supabase Connected!");
});

// ----------------- جلب معلومات المستخدم -----------------
app.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            "SELECT id, username, first_name, last_name, birth_date, security_code FROM users WHERE id = $1",
            [userId]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ error: "User not found" });

        const user = result.rows[0];

       user.security_code =
    user.security_code[0] + "**" + user.security_code[3];

        res.json(user);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// ----------------- تسجيل الدخول -----------------
app.post("/login", async (req, res) => {
    const { username, password, security_code } = req.body;
    if (!username) return res.status(400).json({ error: "Username required" });

    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) return res.status(401).json({ error: "Invalid username" });
        const user = result.rows[0];

        if (security_code) {
            if (security_code !== user.security_code) {
                return res.status(401).json({ error: "Invalid security code" });
            }
            return res.json({ userId: user.id, username: user.username });
        }

        if (!password) return res.status(400).json({ error: "Password required" });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: "Invalid password" });
        res.json({ userId: user.id, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// ----------------- إنشاء حساب جديد -----------------

app.post("/signup", async (req, res) => {
    console.log("📥 Received signup data:", req.body);
    let { username, password, security_code, firstName, lastName, birthDate } = req.body;
    
    // ✅ التحقق من صحة التاريخ (أضف هذا القسم)
    if (birthDate) {
        const dateParts = birthDate.split('-');
        if (dateParts.length !== 3) {
            return res.status(400).json({ error: "Invalid birth date format. Use YYYY-MM-DD" });
        }
        
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        const day = parseInt(dateParts[2], 10);
        
        // التحقق من أن الشهر بين 1-12 واليوم بين 1-31
        if (month < 1 || month > 12 || day < 1 || day > 31) {
            return res.status(400).json({ error: "Invalid birth date. Month must be 1-12 and day 1-31" });
        }
        
        const correctedDate = new Date(year, month - 1, day);
        if (correctedDate.getFullYear() !== year || 
            correctedDate.getMonth() !== month - 1 || 
            correctedDate.getDate() !== day) {
            return res.status(400).json({ error: "Invalid birth date. Please use a real date (e.g., 2000-01-31)" });
        }
        
        // إعادة تنسيق التاريخ بشكل صحيح
        birthDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
    
    // باقي الكود كما هو
    if (!username || !password || !security_code || !firstName || !lastName || !birthDate) {
        return res.status(400).json({ error: "All fields are required" });
    }
    if (!/^\d{4}$/.test(security_code)) {
        return res.status(400).json({ error: "Security code must be exactly 4 digits" });
    }

    try {
        const existing = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
        if (existing.rows.length > 0) return res.status(400).json({ error: "Username already taken" });

        const hashed = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO users (username, password, security_code, first_name, last_name, birth_date) VALUES ($1, $2, $3, $4, $5, $6)",
            [username, hashed, security_code, firstName, lastName, birthDate]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// ----------------- إعادة تعيين كلمة المرور -----------------
app.post("/reset-password", async (req, res) => {
    const { username, security_code, newPassword } = req.body;
    if (!username || !security_code || !newPassword) return res.status(400).json({ error: "All fields required" });

    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Username not found" });
        const user = result.rows[0];

        if (security_code !== user.security_code) {
            return res.status(401).json({ error: "Invalid security code" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE users SET password = $1 WHERE username = $2", [hashed, username]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// ----------------- الفصول -----------------
app.get("/classes/:userId", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM classes WHERE user_id = $1", [req.params.userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/create-class", async (req, res) => {
    const { userId, className } = req.body;
    if (!userId || !className) return res.status(400).json({ error: "Missing data" });
    try {
        const result = await pool.query(
            "INSERT INTO classes (user_id, name) VALUES ($1, $2) RETURNING id",
            [userId, className]
        );
        res.json({ classId: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.put("/edit-class/:classId", async (req, res) => {
    const { classId } = req.params;
    const { newName } = req.body;
    if (!classId || !newName) return res.status(400).json({ error: "Missing data" });
    try {
        await pool.query("UPDATE classes SET name = $1 WHERE id = $2", [newName, classId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.delete("/delete-class/:classId", async (req, res) => {
    const { classId } = req.params;
    if (!classId) return res.status(400).json({ error: "Missing class ID" });
    try {
        await pool.query("DELETE FROM classes WHERE id = $1", [classId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ----------------- الطلاب -----------------
app.get("/students/:classId", async (req, res) => {
    const { classId } = req.params;
    const { search } = req.query;
    try {
        let query = "SELECT * FROM students WHERE class_id = $1";
        let params = [classId];
        if (search) {
            query += " AND name LIKE $2";
            params.push(`%${search}%`);
        }
        query += " ORDER BY name ASC";
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/add-student", async (req, res) => {
    const { classId, name } = req.body;
    if (!classId || !name) return res.status(400).json({ error: "Missing data" });
    try {
        await pool.query("INSERT INTO students (class_id, name) VALUES ($1, $2)", [classId, name]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/delete-student", async (req, res) => {
    const { id } = req.body;
    try {
        await pool.query("DELETE FROM students WHERE id = $1", [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ----------------- الامتحانات -----------------
app.get("/exams/:classId", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM exams WHERE class_id = $1", [req.params.classId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/add-exam", async (req, res) => {
    const { classId, name, total } = req.body;
    if (!classId || !name) return res.status(400).json({ error: "Missing data" });
    if (!total || total < 1) return res.status(400).json({ error: "Total must be at least 1" });
    try {
        const result = await pool.query(
            "INSERT INTO exams (class_id, name, total) VALUES ($1, $2, $3) RETURNING id",
            [classId, name, total]
        );
        res.json({ examId: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ----------------- الدرجات -----------------
app.get("/grades/:classId", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM grades WHERE class_id = $1", [req.params.classId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/save-grade", async (req, res) => {
    const { classId, studentId, examId, score } = req.body;
    if (!classId || !studentId || !examId) return res.status(400).json({ error: "Missing data" });
    try {
        await pool.query(
            `INSERT INTO grades (class_id, student_id, exam_id, score)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (student_id, exam_id) 
             DO UPDATE SET score = EXCLUDED.score`,
            [classId, studentId, examId, score]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.delete("/reset-all-exams/:classId", async (req, res) => {
    try {
        await pool.query("DELETE FROM exams WHERE class_id = $1", [req.params.classId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ----------------- الخطة الأسبوعية -----------------
app.get("/weekly-plan/:classId", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM weekly_plan WHERE class_id = $1 ORDER BY week_number",
            [req.params.classId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/weekly-plan", async (req, res) => {
    const { class_id, week_number, subject, topic, notes } = req.body;
    if (!class_id || !week_number || !subject || !topic) return res.status(400).json({ error: "Missing required fields" });
    try {
        const result = await pool.query(
            "INSERT INTO weekly_plan (class_id, week_number, subject, topic, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [class_id, week_number, subject, topic, notes || ""]
        );
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.put("/weekly-plan/:id", async (req, res) => {
    const { subject, topic, notes } = req.body;
    try {
        await pool.query(
            "UPDATE weekly_plan SET subject = $1, topic = $2, notes = $3 WHERE id = $4",
            [subject, topic, notes || "", req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.delete("/weekly-plan/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM weekly_plan WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ----------------- الملاحظات -----------------
app.get("/notes/:classId", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM notes WHERE class_id = $1 ORDER BY created_at DESC",
            [req.params.classId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/notes", async (req, res) => {
    const { class_id, title, content, bg_color } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Title and content are required" });
    try {
        const result = await pool.query(
            "INSERT INTO notes (class_id, title, content, bg_color) VALUES ($1, $2, $3, $4) RETURNING id",
            [class_id, title, content, bg_color || "#fef9c3"]
        );
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.put("/notes/:id", async (req, res) => {
    const { title, content, bg_color } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Title and content are required" });
    try {
        await pool.query(
            "UPDATE notes SET title = $1, content = $2, bg_color = $3 WHERE id = $4",
            [title, content, bg_color || "#fef9c3", req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.delete("/notes/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM notes WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});
// مسار ترحيبي للجذر
app.get("/", (req, res) => {
    res.json({
        message: "Teacher Dashboard API is running! 🚀",
        status: "online",
        endpoints: {
            users: "/user/:userId",
            login: "/login",
            signup: "/signup",
            classes: "/classes/:userId",
            students: "/students/:classId",
            exams: "/exams/:classId",
            grades: "/grades/:classId"
        }
    });
});
// تصدير التطبيق لـ Vercel
module.exports = app;



// تشغيل محلي فقط
if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}