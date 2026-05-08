import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = process.env.REACT_APP_API_URL || "https://teacher-app-6kbj.onrender.com";

export default function App() {
    const inputsRef = useRef([]);
    
    // Auth states
    const [mode, setMode] = useState("login");
    const [userId, setUserId] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    
    // Login data
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginSecurityCode, setLoginSecurityCode] = useState("");
    const [loginMethod, setLoginMethod] = useState("password");
    
    // Signup data
    const [signupData, setSignupData] = useState({
        username: "", password: "", securityCode: "", firstName: "", lastName: "", birthDate: ""
    });
    
    // Reset password (forgot)
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetUsername, setResetUsername] = useState("");
    const [resetSecurityCode, setResetSecurityCode] = useState("");
    const [resetNewPassword, setResetNewPassword] = useState("");
    
    // Profile dropdown
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    
    // App data
    const [view, setView] = useState("dashboard");
    const [selectedClass, setSelectedClass] = useState(null);
    const [classes, setClasses] = useState([]);
    const [className, setClassName] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [classError, setClassError] = useState("");
    
    const [students, setStudents] = useState([]);
    const [tempStudents, setTempStudents] = useState([""]);
    const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
    const [addStudentError, setAddStudentError] = useState("");
    
    const [randomStudent, setRandomStudent] = useState(null);
    const [groupCount, setGroupCount] = useState(2);
    const [groupType, setGroupType] = useState("random");
    const [groups, setGroups] = useState([]);
    const [groupError, setGroupError] = useState("");
    
    const [grades, setGrades] = useState({});
    const [scale, setScale] = useState(100);
    const [exams, setExams] = useState([]);
    const [showExamModal, setShowExamModal] = useState(false);
    const [examName, setExamName] = useState("");
    const [examTotal, setExamTotal] = useState("");
    const [examError, setExamError] = useState("");
    const [showFinalGradeColumn, setShowFinalGradeColumn] = useState(false);
    const [gradeInputErrors, setGradeInputErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [searchError, setSearchError] = useState("");
    const [showGradeScaleModal, setShowGradeScaleModal] = useState(false);
    const [tempScale, setTempScale] = useState(100);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    const [weeklyPlan, setWeeklyPlan] = useState([]);
    const [showWeekModal, setShowWeekModal] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(null);
    const [weekForm, setWeekForm] = useState({ week_number: 1, subject: "", topic: "", notes: "" });
    const [weekError, setWeekError] = useState("");
    
    const [notes, setNotes] = useState([]);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [editNote, setEditNote] = useState(null);
    const [noteForm, setNoteForm] = useState({ title: "", content: "", bg_color: "#fef9c3" });
    const [noteError, setNoteError] = useState("");
    const noteColors = ["#fef9c3", "#dcfce7", "#ffe4e6", "#dbeafe", "#fce7f3", "#cffafe"];
    
    const [editClassModal, setEditClassModal] = useState({ show: false, classId: null, currentName: "" });
const [newClassName, setNewClassName] = useState("");
const [deleteConfirmModal, setDeleteConfirmModal] = useState({ show: false, classId: null, className: "" });
    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type }), 3000);
    };
    
    // API calls
    const loadClasses = (id) => {
        axios.get(`${API}/classes/${id}`).then(res => setClasses(Array.isArray(res.data) ? res.data : []));
    };
    
    const loadUserInfo = (id) => {
        axios.get(`${API}/user/${id}`).then(res => setUserInfo(res.data)).catch(console.error);
    };
    
    const loadStudents = (classId, search = "") => {
        if (!classId) return;
        axios.get(`${API}/students/${classId}`, { params: { search } }).then(res => {
            setStudents(res.data || []);
        });
    };
    
    const loadGrades = (classId) => {
        if (!classId) return;
        axios.get(`${API}/grades/${classId}`).then(res => {
            const formatted = {};
            (res.data || []).forEach(g => {
                if (!formatted[g.student_id]) formatted[g.student_id] = {};
                formatted[g.student_id][g.exam_id] = { score: g.score };
            });
            setGrades(formatted);
        });
    };
    
    const loadExams = (classId) => {
        if (!classId) return;
        axios.get(`${API}/exams/${classId}`).then(res => setExams(res.data || []));
    };
    
    const loadWeeklyPlan = (classId) => {
        if (!classId) return;
        axios.get(`${API}/weekly-plan/${classId}`).then(res => setWeeklyPlan(res.data || []));
    };
    
    const loadNotes = (classId) => {
        if (!classId) return;
        axios.get(`${API}/notes/${classId}`).then(res => setNotes(res.data || []));
    };
    
    const resetClassData = () => {
        setStudents([]);
        setGrades({});
        setExams([]);
        setWeeklyPlan([]);
        setNotes([]);
        setGroups([]);
        setRandomStudent(null);
        setGroupCount(2);
        setGroupType("random");
        setGroupError("");
        setGradeInputErrors({});
        setShowFinalGradeColumn(false);
        setTempScale(100);
    };
    
    useEffect(() => {
        if (userId) {
            loadClasses(userId);
            loadUserInfo(userId);
        }
    }, [userId]);
    
    useEffect(() => {
        if (selectedClass?.id) {
            resetClassData();
            if (view === "class") {
                loadStudents(selectedClass.id, "");
            } else if (view === "students") {
                loadStudents(selectedClass.id, "");
            } else if (view === "grades") {
                loadStudents(selectedClass.id, "");
                loadExams(selectedClass.id);
                loadGrades(selectedClass.id);
            } else if (view === "schedule") {
                loadWeeklyPlan(selectedClass.id);
            } else if (view === "notes") {
                loadNotes(selectedClass.id);
            } else if (view === "random") {
                loadStudents(selectedClass.id, "");
                loadExams(selectedClass.id);
                loadGrades(selectedClass.id);
            }
        }
    }, [selectedClass, view]);
    
    // مسح البحث عند مغادرة صفحة grades
    useEffect(() => {
        if (view !== "grades") {
            setSearchTerm("");
            setSearchError("");
        }
    }, [view]);
    
    useEffect(() => {
        if (selectedClass) {
            setSearchTerm("");
            setSearchError("");
        }
    }, [selectedClass]);

    // إعادة تعيين groupError عند تحديث الدرجات أو الطلاب
useEffect(() => {
    if (selectedClass?.id) {
        setGroupError("");
    }
}, [grades, students, exams, selectedClass?.id]);
// إعادة تعيين groupError عند تغيير نوع التوزيع أو عدد المجموعات
useEffect(() => {
    setGroupError("");
}, [groupType, groupCount]);
    
    // حساب متوسط الصف بالكامل
    const getClassAverage = () => {
        if (students.length === 0 || exams.length === 0) return 0;
        let totalSum = 0;
        let totalStudents = 0;
        
        students.forEach(student => {
            let studentTotal = 0;
            let studentMax = 0;
            exams.forEach(exam => {
                const grade = grades[student.id]?.[exam.id]?.score;
                if (grade !== null && grade !== undefined && grade !== "") {
                    studentTotal += Number(grade);
                    studentMax += Number(exam.total);
                }
            });
            if (studentMax > 0) {
                totalSum += (studentTotal / studentMax) * 100;
                totalStudents++;
            }
        });
        
        return totalStudents > 0 ? (totalSum / totalStudents).toFixed(1) : 0;
    };
    
    // Auth functions
    const handleSignup = () => {
        const { username, password, securityCode, firstName, lastName, birthDate } = signupData;
        if (!username || !password || !securityCode || !firstName || !lastName || !birthDate) {
            setError("All fields are required");
            return;
        }
        if (!/^\d{4}$/.test(securityCode)) {
            setError("Security code must be exactly 4 digits");
            return;
        }
        axios.post(`${API}/signup`, {
            username,
            password,
            security_code: securityCode,
            firstName,
            lastName,
            birthDate
        }).then(async () => {
            showToast("Account created! Logging you in...", "success");
            // تسجيل الدخول التلقائي بعد إنشاء الحساب
            try {
                const loginRes = await axios.post(`${API}/login`, { username, password });
                if (loginRes.data.userId) {
                    setUserId(loginRes.data.userId);
                    loadClasses(loginRes.data.userId);
                    showToast(`Welcome, ${username}!`, "success");
                    setError("");
                    setSignupData({ username: "", password: "", securityCode: "", firstName: "", lastName: "", birthDate: "" });
                }
            } catch (err) {
                setError("Account created! Please login manually.");
                setMode("login");
            }
        }).catch(err => setError(err.response?.data?.error || "Signup failed"));
    };
    
    const handleLogin = () => {
        if (!loginUsername.trim()) { setError("Username required"); return; }
        if (loginMethod === "password") {
            if (!loginPassword.trim()) { setError("Password required"); return; }
            axios.post(`${API}/login`, { username: loginUsername, password: loginPassword })
                .then(res => {
                    setUserId(res.data.userId);
                    showToast(`Welcome back, ${loginUsername}!`);
                    setError("");
                })
                .catch(err => setError(err.response?.data?.error));
        } else {
            if (!loginSecurityCode.trim()) { setError("Security code required"); return; }
            axios.post(`${API}/login`, { username: loginUsername, security_code: loginSecurityCode })
                .then(res => {
                    setUserId(res.data.userId);
                    showToast(`Welcome back, ${loginUsername}!`);
                    setError("");
                })
                .catch(err => setError(err.response?.data?.error));
        }
    };
    
    const handleResetPassword = () => {
        if (!resetUsername.trim()) { setError("Username required"); return; }
        if (!resetSecurityCode.trim()) { setError("Security code required"); return; }
        if (!resetNewPassword.trim()) { setError("New password required"); return; }
        if (!/^\d{4}$/.test(resetSecurityCode)) { setError("Security code must be exactly 4 digits"); return; }
        axios.post(`${API}/reset-password`, {
            username: resetUsername,
            security_code: resetSecurityCode,
            newPassword: resetNewPassword
        }).then(() => {
            showToast("✅ Password reset successfully! Please login with your new password.", "success");
            setShowResetModal(false);
            setResetUsername("");
            setResetSecurityCode("");
            setResetNewPassword("");
            setError("");
        }).catch(err => setError(err.response?.data?.error));
    };
    
    const handleLogout = () => {
        setUserId(null);
        setView("dashboard");
        setSelectedClass(null);
        setClasses([]);
        setStudents([]);
        setGrades({});
        setExams([]);
        setWeeklyPlan([]);
        setNotes([]);
        setGroups([]);
        setRandomStudent(null);
        setSearchTerm("");
        setSearchError("");
        setShowProfileDropdown(false);
        setMode("login");
        showToast("Logged out successfully");
    };
    
    const createClass = () => {
        if (!className.trim()) { setClassError("Class name required"); return; }
        axios.post(`${API}/create-class`, { userId, className }).then(() => {
            setClassName(""); setClassError(""); setShowCreate(false); loadClasses(userId); showToast("Class created!");
        });
    };
 const editClass = () => {
    if (!newClassName.trim()) {
        showToast("Class name cannot be empty", "error");
        return;
    }
    axios.put(`${API}/edit-class/${editClassModal.classId}`, { newName: newClassName })
        .then(() => {
            loadClasses(userId);
            setEditClassModal({ show: false, classId: null, currentName: "" });
            setNewClassName("");
            showToast("Class renamed successfully!");
        })
        .catch(err => {
            console.error("Edit error:", err);
            showToast("Error renaming class", "error");
        });
};
// فتح مودال تأكيد الحذف
const openDeleteConfirm = (classId, className) => {
    setDeleteConfirmModal({ show: true, classId, className });
};

// تأكيد الحذف
const confirmDeleteClass = () => {
    axios.delete(`${API}/delete-class/${deleteConfirmModal.classId}`)
        .then(() => {
            loadClasses(userId);
            setDeleteConfirmModal({ show: false, classId: null, className: "" });
            showToast(`Class "${deleteConfirmModal.className}" deleted!`);
        })
        .catch(err => {
            console.error("Delete error:", err);
            showToast("Error deleting class", "error");
            setDeleteConfirmModal({ show: false, classId: null, className: "" });
        });
};
    
    const addStudents = () => {
        const valid = tempStudents.filter(n => n.trim());
        if (valid.length === 0) { setAddStudentError("At least one student name"); return; }
        setAddStudentError("");
        Promise.all(valid.map(name => axios.post(`${API}/add-student`, { classId: selectedClass.id, name })))
            .then(() => { 
                setShowAddStudentsModal(false); 
                setTempStudents([""]); 
                loadStudents(selectedClass.id, "");
                showToast(`${valid.length} student(s) added`); 
            })
            .catch(err => setAddStudentError(err.response?.data?.error));
    };
    
    const pickRandomStudent = () => {
        if (students.length === 0) { showToast("No students in this class yet.", "error"); return; }
        const idx = Math.floor(Math.random() * students.length);
        setRandomStudent(students[idx].name);
    };
    
    const generateGroups = () => {
    // مسح الخطأ السابق أولاً
    setGroupError("");
    
    if (students.length === 0) {
        setGroupError("No students added in this class.");
        setGroups([]);
        return;
    }
    if (!groupCount || groupCount <= 0) {
        setGroupError("Valid number required");
        return;
    }
    if (groupCount > students.length) {
        setGroupError(`Maximum groups is ${students.length}`);
        return;
    }

    let studentsToGroup = [...students];
    
    if (groupType === "balanced") {
        // حساب الدرجة لكل طالب
        const studentsWithGrades = studentsToGroup.map(s => ({
            ...s,
            computedGrade: parseFloat(getFinalGrade(s.id)) || 0
        }));
        
        // التحقق من وجود أي اختلاف في الدرجات
        const hasAnyGrades = studentsWithGrades.some(s => s.computedGrade > 0);
        const allSameGrade = studentsWithGrades.length > 0 && studentsWithGrades.every(s => s.computedGrade === studentsWithGrades[0]?.computedGrade);
        
        if (!hasAnyGrades || allSameGrade) {
            setGroupError("Please add grades first or use random grouping.");
            return;
        }
        
        // ترتيب الطلاب تنازلياً حسب الدرجة
        studentsWithGrades.sort((a, b) => b.computedGrade - a.computedGrade);
        studentsToGroup = studentsWithGrades;
    } else {
        // التوزيع العشوائي
        studentsToGroup.sort(() => Math.random() - 0.5);
    }
    
    const groupsArray = Array.from({ length: groupCount }, () => []);
    
    if (groupType === "balanced") {
        for (let i = 0; i < studentsToGroup.length; i++) {
            const groupIndex = i % groupCount;
            if (Math.floor(i / groupCount) % 2 === 1) {
                groupsArray[groupCount - 1 - groupIndex].push(studentsToGroup[i].name);
            } else {
                groupsArray[groupIndex].push(studentsToGroup[i].name);
            }
        }
    } else {
        studentsToGroup.forEach((student, index) => {
            groupsArray[index % groupCount].push(student.name);
        });
    }
    
    setGroups(groupsArray);
    showToast(`Created ${groupCount} ${groupType === "balanced" ? "balanced" : "random"} groups!`, "success");
};
    const resetRandomPage = () => { 
        setRandomStudent(null); 
        setGroupCount(2); 
        setGroupType("random");
        setGroups([]); 
        setGroupError(""); 
    };
    
    const saveGrade = (studentId, examId, score, examTotalValue) => {
        let validScore = score;
        if (score !== "" && score !== null) {
            let num = Number(score);
            if (isNaN(num)) return;
            validScore = Math.min(Math.max(num, 0), examTotalValue);
        }
        axios.post(`${API}/save-grade`, { classId: selectedClass.id, studentId, examId, score: validScore === "" || validScore === null ? null : validScore });
    };
    
   const getFinalGrade = (studentId) => {
    let total = 0, max = 0;
    exams.forEach(ex => {
        const g = grades[studentId]?.[ex.id];
        if (g && g.score !== null && g.score !== "") { 
            total += Number(g.score); 
            max += Number(ex.total); 
        }
    });
    // النسبة المئوية = (مجموع الدرجات / مجموع الدرجات الكلية) * الـ scale
    return max ? ((total / max) * scale).toFixed(1) : 0;
};
    
    const handleGradeChange = (studentId, examId, examTotal, value) => {
        const errorKey = `${studentId}_${examId}`;
        if (value === "") {
            setGrades(prev => ({ ...prev, [studentId]: { ...prev[studentId], [examId]: { score: null } } }));
            saveGrade(studentId, examId, null, examTotal);
            setGradeInputErrors(prev => ({ ...prev, [errorKey]: "" }));
            return;
        }
        let num = Number(value);
        if (isNaN(num)) {
            setGradeInputErrors(prev => ({ ...prev, [errorKey]: "Invalid number" }));
            return;
        }
        if (num > examTotal) {
            setGradeInputErrors(prev => ({ ...prev, [errorKey]: `⚠️ Max ${examTotal}` }));
            return;
        }
        if (num < 0) {
            setGradeInputErrors(prev => ({ ...prev, [errorKey]: `⚠️ Min 0` }));
            return;
        }
        setGradeInputErrors(prev => ({ ...prev, [errorKey]: "" }));
        setGrades(prev => ({ ...prev, [studentId]: { ...prev[studentId], [examId]: { score: num } } }));
        saveGrade(studentId, examId, num, examTotal);
    };
    
    const resetAllExamsAndGrades = () => {
        axios.delete(`${API}/reset-all-exams/${selectedClass.id}`).then(() => {
            setExams([]); setGrades({}); setShowFinalGradeColumn(false); loadExams(selectedClass.id); loadGrades(selectedClass.id); setShowConfirmModal(false); showToast("All exams and grades reset!");
        });
    };
    
    const saveWeeklyPlanItem = () => {
        if (!weekForm.subject.trim() || !weekForm.topic.trim()) {
            setWeekError("Subject and topic cannot be empty");
            return;
        }
        setWeekError("");
        if (currentWeek) {
            axios.put(`${API}/weekly-plan/${currentWeek.id}`, weekForm)
                .then(() => { loadWeeklyPlan(selectedClass.id); setShowWeekModal(false); showToast("Week updated"); });
        } else {
            axios.post(`${API}/weekly-plan`, { ...weekForm, class_id: selectedClass.id })
                .then(() => { loadWeeklyPlan(selectedClass.id); setShowWeekModal(false); showToast("Week added"); });
        }
    };
    
    const deleteWeeklyPlan = (id) => { 
        axios.delete(`${API}/weekly-plan/${id}`).then(() => { loadWeeklyPlan(selectedClass.id); showToast("Deleted"); }); 
    };
    
    const saveNote = () => {
        if (!noteForm.title.trim() || !noteForm.content.trim()) {
            setNoteError("Title and content cannot be empty");
            return;
        }
        setNoteError("");
        if (editNote) {
            axios.put(`${API}/notes/${editNote.id}`, { ...noteForm, class_id: selectedClass.id })
                .then(() => { loadNotes(selectedClass.id); setShowNoteModal(false); setEditNote(null); setNoteForm({ title: "", content: "", bg_color: "#fef9c3" }); setNoteError(""); showToast("Note updated"); });
        } else {
            axios.post(`${API}/notes`, { ...noteForm, class_id: selectedClass.id })
                .then(() => { loadNotes(selectedClass.id); setShowNoteModal(false); setNoteForm({ title: "", content: "", bg_color: "#fef9c3" }); setNoteError(""); showToast("Note added"); });
        }
    };
    
    const deleteNote = (id) => { 
        axios.delete(`${API}/notes/${id}`).then(() => { loadNotes(selectedClass.id); showToast("Note deleted"); }); 
    };
    
    const editNoteHandler = (note) => { 
        setEditNote(note); 
        setNoteForm({ title: note.title, content: note.content, bg_color: note.bg_color }); 
        setNoteError("");
        setShowNoteModal(true); 
    };
    
    const openResetModal = () => {
        setShowResetModal(true);
        setError("");
        setResetUsername("");
        setResetSecurityCode("");
        setResetNewPassword("");
    };
    
    const closeResetModal = () => {
        setShowResetModal(false);
        setError("");
        setResetUsername("");
        setResetSecurityCode("");
        setResetNewPassword("");
    };
    
    const switchToSignup = () => {
        setMode("signup");
        setError("");
    };
    
    const switchToLogin = () => {
        setMode("login");
        setError("");
    };
    
    const studentExists = (name) => {
        return students.some(s => s.name.toLowerCase() === name.trim().toLowerCase());
    };
    
    // ----------------- RENDER AUTH -----------------
    if (!userId) {
        return (
            <div className="auth-container">
                {toast.show && <div className={`toast-message ${toast.type}`}>{toast.message}</div>}
                <div className="card">
                    <h1 className="title">{mode === "login" ? "Welcome Back 👨‍🏫" : "Create Teacher Account"}</h1>
                    {mode === "login" ? (
                        <>
                            <input placeholder="Username" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
                            {loginMethod === "password" ? (
                                <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                            ) : (
                                <input placeholder="Security Code (4 digits)" value={loginSecurityCode} onChange={e => setLoginSecurityCode(e.target.value)} maxLength={4} />
                            )}
                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                                <button className="btn" style={{ background: "#f1f5f9", color: "#334155" }} onClick={() => { setLoginMethod(loginMethod === "password" ? "code" : "password"); setError(""); }}>
                                    {loginMethod === "password" ? "Use Security Code" : "Use Password"}
                                </button>
                            </div>
                            {error && <div className="error">{error}</div>}
                            <button className="btn primary" onClick={handleLogin}>Login</button>
                            <button className="btn" onClick={openResetModal}>Forgot Password?</button>
                            <button className="btn" onClick={switchToSignup}>Sign Up</button>
                        </>
                    ) : (
                        <>
                            <input placeholder="Username" value={signupData.username} onChange={e => setSignupData({ ...signupData, username: e.target.value })} />
                            <input type="password" placeholder="Password" value={signupData.password} onChange={e => setSignupData({ ...signupData, password: e.target.value })} />
                            <input placeholder="Security Code (4 digits)" value={signupData.securityCode} onChange={e => setSignupData({ ...signupData, securityCode: e.target.value })} maxLength={4} />
                            <input placeholder="First Name" value={signupData.firstName} onChange={e => setSignupData({ ...signupData, firstName: e.target.value })} />
                            <input placeholder="Last Name" value={signupData.lastName} onChange={e => setSignupData({ ...signupData, lastName: e.target.value })} />
                            <input type="date" placeholder="Birth Date" value={signupData.birthDate} onChange={e => setSignupData({ ...signupData, birthDate: e.target.value })} />
                            {error && <div className="error">{error}</div>}
                            <button className="btn primary" onClick={handleSignup}>Sign Up</button>
                            <button className="btn" onClick={switchToLogin}>Back to Login</button>
                        </>
                    )}
                </div>
                
                {showResetModal && (
                    <div className="modal">
                        <div className="modal-box">
                            <h3>Reset Password</h3>
                            <input placeholder="Username" value={resetUsername} onChange={e => setResetUsername(e.target.value)} />
                            <input placeholder="Security Code (4 digits)" value={resetSecurityCode} onChange={e => setResetSecurityCode(e.target.value)} maxLength={4} />
                            <input type="password" placeholder="New Password" value={resetNewPassword} onChange={e => setResetNewPassword(e.target.value)} />
                            {error && <div className="error">{error}</div>}
                            <div className="modal-buttons">
                                <button className="btn primary" onClick={handleResetPassword}>Reset Password</button>
                                <button className="btn secondary" onClick={closeResetModal}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    // Profile button component
    const ProfileButton = () => (
        <div style={{ position: "relative" }}>
            <div className="profile-avatar" onClick={() => setShowProfileDropdown(!showProfileDropdown)} title={userInfo?.username}>
                {userInfo?.first_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {showProfileDropdown && (
                <div className="profile-dropdown">
                    <div className="profile-info">
                        <p><strong>{userInfo?.first_name} {userInfo?.last_name}</strong></p>
                        <p><span>Username:</span> {userInfo?.username}</p>
                        <p><span>Birth Date:</span> {userInfo?.birth_date ? new Date(userInfo.birth_date).toLocaleDateString() : ""}</p>
                        <p><span>Security Code:</span> {userInfo?.security_code}</p>
                    </div>
                    <button className="btn" style={{ width: "100%", marginTop: "0.5rem", background: "#f1f5f9", color: "#334155" }} onClick={handleLogout}>🚪 Logout</button>
                </div>
            )}
        </div>
    );
    
    // ----------------- DASHBOARD -----------------
 // ----------------- DASHBOARD -----------------
if (view === "dashboard") {
    return (
        <div className="dashboard">
            {toast.show && <div className={`toast-message ${toast.type}`}>{toast.message}</div>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 style={{ margin: 0, textAlign: "center", width: "100%" }}>👨‍🏫 Teacher Dashboard</h1>
                <ProfileButton />
            </div>
            
            <div className="create-class-box" onClick={() => setShowCreate(true)}>+ Create Class</div>
            
            <div className="class-grid">
    {classes.map(c => (
        <div 
            key={c.id} 
            className="class-card"
            onClick={() => { setSelectedClass(c); setView("class"); }}
        >
            <div className="class-card-content">
                <span className="class-name">
                    📘 {c.name}
                </span>
                <div className="class-card-actions">
                    <button 
                        className="class-edit-btn"
                        onClick={(e) => {
                            e.stopPropagation();  // منع propagation
                            setEditClassModal({ show: true, classId: c.id, currentName: c.name });
                            setNewClassName(c.name);
                        }}
                        title="Edit class name"
                    >
                        ✏️
                    </button>
                    <button 
                        className="class-delete-btn"
                        onClick={(e) => {
                            e.stopPropagation();  // منع propagation
                            openDeleteConfirm(c.id, c.name);
                        }}
                        title="Delete class"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    ))}
</div>
            
            {showCreate && (
                <div className="modal">
                    <div className="modal-box">
                        <h3>Create Class</h3>
                        <input placeholder="e.g. Grade 7" value={className} onChange={e => { setClassName(e.target.value); setClassError(""); }} />
                        {classError && <div className="error">{classError}</div>}
                        <div className="modal-buttons">
                            <button className="btn primary" onClick={createClass}>Create</button>
                            <button className="btn secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal تعديل اسم الفصل */}
            {editClassModal.show && (
                <div className="modal">
                    <div className="modal-box">
                        <h3>Edit Class Name</h3>
                        <input 
                            type="text" 
                            value={newClassName} 
                            onChange={(e) => setNewClassName(e.target.value)}
                            placeholder="Enter new class name"
                            autoFocus
                        />
                        <div className="modal-buttons">
                            <button className="btn primary" onClick={editClass}>Save</button>
                            <button className="btn secondary" onClick={() => {
                                setEditClassModal({ show: false, classId: null, currentName: "" });
                                setNewClassName("");
                            }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal تأكيد حذف الفصل */}
            {deleteConfirmModal.show && (
                <div className="modal">
                    <div className="modal-box">
                        <h3>⚠️ Confirm Delete</h3>
                        <p>Are you sure you want to delete <strong>"{deleteConfirmModal.className}"</strong>?</p>
                        <p style={{ fontSize: "0.85rem", color: "#dc2626", marginTop: "0.5rem" }}>
                            This will permanently delete all students, exams, grades, and notes in this class.
                        </p>
                        <div className="modal-buttons">
                            <button className="btn primary reset-btn" onClick={confirmDeleteClass}>Yes, Delete</button>
                            <button className="btn secondary" onClick={() => setDeleteConfirmModal({ show: false, classId: null, className: "" })}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            
            <footer className="app-footer">Copyright ©️ 2026. Designed and Developed by Mohamad Abdallah.</footer>
        </div>
    );
}
    // ----------------- CLASS PAGE -----------------
    if (view === "class") {
        const noStudents = students.length === 0;
        return (
            <div className="class-page">
                {toast.show && <div className={`toast-message ${toast.type}`}>{toast.message}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h2 className="center-title" style={{ marginBottom: 0 }}>Welcome to {selectedClass.name}</h2>
                    <ProfileButton />
                </div>
                <div className="search-bar-left">
                    <input 
                        type="text" 
                        placeholder="🔍 Search student by name..." 
                        value={searchTerm} 
                        onChange={e => {
                            setSearchTerm(e.target.value);
                            setSearchError("");
                        }} 
                        onKeyDown={e => { 
                            if (e.key === "Enter" && searchTerm.trim()) {
                                if (noStudents) {
                                    setSearchError("This class has no students yet.");
                                } else if (studentExists(searchTerm)) {
                                    setSearchError("");
                                    setView("grades");
                                } else {
                                    setSearchError(`Student "${searchTerm}" not found in this class.`);
                                }
                            } 
                        }} 
                    />
                    {searchError && (
                        <div className="error-box" style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
                            ⚠️ {searchError}
                        </div>
                    )}
                </div>
                <div className="class-grid">
                    <div className="class-card" onClick={() => { setView("students"); loadStudents(selectedClass.id, ""); }}>👨‍🎓 Students</div>
                    <div className="class-card" onClick={() => { setView("random"); loadStudents(selectedClass.id, ""); }}>🎲 Random</div>
                    <div className="class-card" onClick={() => { 
                        setSearchTerm("");
                        setView("grades"); 
                    }}>📊 Grades</div>
                    <div className="class-card" onClick={() => setView("schedule")}>📅 Weekly Plan</div>
                    <div className="class-card" onClick={() => setView("notes")}>📝 Notes</div>
                </div>
                <button className="btn-back" onClick={() => setView("dashboard")}>Back</button>
                <footer className="app-footer">Copyright ©️ 2026. Designed and Developed by Mohamad Abdallah.</footer>
            </div>
        );
    }
    
    // ----------------- STUDENTS -----------------
    if (view === "students") {
        return (
            <div className="class-page">
                {toast.show && <div className={`toast-message ${toast.type}`}>{toast.message}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h2 className="center-title" style={{ marginBottom: 0 }}>👨‍🎓 Students - {selectedClass.name}</h2>
                    <ProfileButton />
                </div>
                <div className="create-class-box" onClick={() => { setTempStudents([""]); setAddStudentError(""); setShowAddStudentsModal(true); }}>+ Add Students</div>
                {showAddStudentsModal && (
                    <div className="modal">
                        <div className="modal-box" style={{ maxWidth: "550px" }}>
                            <h3>➕ Add New Students</h3>
                            <p style={{ marginBottom: "1rem" }}>Press <kbd>Enter</kbd> to add another student</p>
                            <div className="students-input-list">
                                {tempStudents.map((name, idx) => (
                                    <div key={idx} className="student-input-row">
                                        <input 
                                            ref={el => inputsRef.current[idx] = el}
                                            value={name}
                                            placeholder={`Student ${idx + 1} name`}
                                            onChange={e => { const updated = [...tempStudents]; updated[idx] = e.target.value; setTempStudents(updated); setAddStudentError(""); }}
                                            onKeyDown={e => { if (e.key === "Enter" && name.trim()) { e.preventDefault(); setTempStudents([...tempStudents, ""]); setTimeout(() => inputsRef.current[idx + 1]?.focus(), 50); } }}
                                        />
                                    </div>
                                ))}
                            </div>
                            {addStudentError && <div className="error-box">{addStudentError}</div>}
                            <div className="modal-buttons">
                                <button className="btn primary" onClick={addStudents}>Save All</button>
                                <button className="btn secondary" onClick={() => { setShowAddStudentsModal(false); setTempStudents([""]); setAddStudentError(""); }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="students-table-wrapper">
                    <div className="table-box">
                        <div className="table-header"><span>👨‍🎓 Student Name</span><span>❌ Delete</span></div>
                        {students.map(s => (
                            <div key={s.id} className="table-row">
                                <span>{s.name}</span>
                                <span className="delete-btn" onClick={() => { setStudents(students.filter(x => x.id !== s.id)); axios.post(`${API}/delete-student`, { id: s.id }); showToast("Student deleted"); }}>❌</span>
                            </div>
                        ))}
                        <div className="table-footer">📊 Total Students: {students.length}</div>
                    </div>
                </div>
                <button className="btn-back" onClick={() => setView("class")}>Back</button>
                <footer className="app-footer">Copyright ©️ 2026. Designed and Developed by Mohamad Abdallah.</footer>
            </div>
        );
    }
    
    // ----------------- RANDOM -----------------
    if (view === "random") {
        return (
            <div className="class-page">
                {toast.show && <div className={`toast-message ${toast.type}`}>{toast.message}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h2 className="center-title" style={{ marginBottom: 0 }}>🎲 Random Tools</h2>
                    <ProfileButton />
                </div>
                <div className="random-cards-container">
                    <div className="random-card">
                        <button className="btn primary big-random-btn" onClick={pickRandomStudent}>🎯 Pick Random</button>
                        {randomStudent && <div className="result-box">{randomStudent}</div>}
                    </div>
                    <div className="random-card">
                        <h3>👥 Create Groups</h3>
                        <input 
                            type="number" 
                            min="1" 
                            value={groupCount} 
                            onChange={e => setGroupCount(e.target.value)} 
                            placeholder="Number of groups" 
                        />
                        
                        <div style={{ display: "flex", gap: "1rem", margin: "1rem 0" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <input 
                                    type="radio" 
                                    value="random" 
                                    checked={groupType === "random"} 
                                    onChange={() => { setGroupType("random"); setGroupError(""); }} 
                                />
                                🎲 Random
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <input 
                                    type="radio" 
                                    value="balanced" 
                                    checked={groupType === "balanced"} 
                                    onChange={() => { setGroupType("balanced"); setGroupError(""); }} 
                                />
                                ⚖️ Balanced (by grades)
                            </label>
                        </div>
                        
                        {groupError && <div className="error-box">{groupError}</div>}
                        
                        <button className="btn primary" onClick={generateGroups}>
                            Generate {groupType === "balanced" ? "Balanced" : "Random"} Groups
                        </button>
                        
                        {groups.map((g, i) => (
                            <div key={i} className="group-box">
                                <h4>📌 Group {i + 1} ({g.length} students)</h4>
                                {g.map((name, idx) => <div key={idx} className="group-item">{name}</div>)}
                            </div>
                        ))}
                    </div>
                </div>
                <button className="btn-back" onClick={() => { resetRandomPage(); setView("class"); }}>← Back</button>
                <footer className="app-footer">Copyright ©️ 2026. Designed and Developed by Mohamad Abdallah.</footer>
            </div>
        );
    }
    
    // ----------------- GRADES -----------------
    // ----------------- GRADES -----------------
if (view === "grades") {
    const filteredStudents = searchTerm.trim() === "" 
        ? students 
        : students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const noStudents = students.length === 0;
    const searchNotFound = searchTerm.trim() !== "" && filteredStudents.length === 0;
    const showTable = !noStudents && !searchNotFound;
    const hasExams = exams.length > 0;
    const hasGrades = Object.keys(grades).length > 0 && Object.values(grades).some(s => Object.values(s).some(g => g.score !== null));
    
    // دالة حساب متوسط كل امتحان على حدة (لصف الـ Exam Averages)
    const getExamAverage = (examId, examTotal) => {
        if (students.length === 0) return "—";
        let total = 0;
        let count = 0;
        students.forEach(student => {
            const score = grades[student.id]?.[examId]?.score;
            if (score !== null && score !== undefined && score !== "") {
                total += Number(score);
                count++;
            }
        });
        if (count === 0) return "—";
        const avg = (total / count).toFixed(1);
        return `${avg} / ${examTotal}`;
    };
    
    // دالة حساب متوسط الصف الكلي (للزر المنفصل)
    const getOverallClassAverage = () => {
        if (students.length === 0 || exams.length === 0) return 0;
        let totalPercentage = 0;
        let studentCount = 0;
        
        students.forEach(student => {
            let studentTotal = 0;
            let studentMax = 0;
            exams.forEach(exam => {
                const score = grades[student.id]?.[exam.id]?.score;
                if (score !== null && score !== undefined && score !== "") {
                    studentTotal += Number(score);
                    studentMax += Number(exam.total);
                }
            });
            if (studentMax > 0) {
                totalPercentage += (studentTotal / studentMax) * 100;
                studentCount++;
            }
        });
        
        return studentCount > 0 ? (totalPercentage / studentCount).toFixed(1) : 0;
    };
    
    // عرض متوسط الصف الكلي كـ Toast
   // عرض متوسط الصف الكلي كـ Toast بمدة أطول
const showOverallAverage = () => {
    const avg = getOverallClassAverage();
    if (avg === 0 || students.length === 0 || exams.length === 0) {
        showToast("No grades available to calculate class average.", "error");
    } else {
        // Toast خاص بمتوسط الصف يبقى لمدة 5 ثوانٍ
        setToast({ show: true, message: `📊 Overall Class Average: ${avg}%`, type: "success" });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 5000);
    }
};
    
    // تحديد ما إذا كان يجب عرض صف الـ Exam Averages
    const showExamAveragesRow = hasExams && students.length > 0 && hasGrades;
    
    return (
        <div className="class-page">
            {toast.show && <div className={`toast-message ${toast.type}`}>{toast.message}</div>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 className="center-title" style={{ marginBottom: 0 }}>📊 Grades - {selectedClass.name}</h2>
                <ProfileButton />
            </div>
            
            <div className="create-class-box" onClick={() => setShowExamModal(true)}>+ Add Exam</div>
            
            {noStudents && (
                <div className="error-box" style={{ textAlign: "center", margin: "1rem auto", maxWidth: "400px" }}>
                    ⚠️ This class has no students yet. Please add students first.
                </div>
            )}
            
            {searchNotFound && !noStudents && (
                <div className="error-box" style={{ textAlign: "center", margin: "1rem auto", maxWidth: "400px" }}>
                    ❌ No student found with name "{searchTerm}" in this class.
                </div>
            )}
            
            {showTable && (
                <div className="grades-table-wrapper">
                    <div className="table-box">
                        <div className="table-header">
                            <span>Student</span>
                            {exams.map(ex => <span key={ex.id}>{ex.name}<small> / {ex.total}</small></span>)}
                            {showFinalGradeColumn && exams.length > 0 && <span>Final Grade <small style={{ fontSize: "0.7rem", opacity: 0.8 }}>/ {scale}</small></span>}
                        </div>
                        
                        {/* صفوف الطلاب */}
                        {filteredStudents.map(s => (
                            <div key={s.id} className="table-row">
                                <span className="student-name">{s.name}</span>
                                {exams.map(ex => (
                                    <div key={ex.id} className="grade-cell" style={{ position: "relative" }}>
                                        <input 
                                            type="number" 
                                            className="grade-input" 
                                            value={grades[s.id]?.[ex.id]?.score ?? ""} 
                                            onChange={e => handleGradeChange(s.id, ex.id, ex.total, e.target.value)} 
                                            style={{ borderColor: gradeInputErrors[`${s.id}_${ex.id}`] ? "#dc2626" : "#fed7aa" }}
                                        />
                                        {gradeInputErrors[`${s.id}_${ex.id}`] && (
                                            <div style={{ position: "absolute", bottom: "-20px", left: "50%", transform: "translateX(-50%)", fontSize: "0.7rem", color: "#dc2626", whiteSpace: "nowrap", background: "#fff", padding: "0 4px", borderRadius: "8px" }}>
                                                {gradeInputErrors[`${s.id}_${ex.id}`]}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {showFinalGradeColumn && exams.length > 0 && <span className="avg-col">{getFinalGrade(s.id)}</span>}
                            </div>
                        ))}
                        
                        {/* صف Exam Averages - يظهر تلقائياً عند وجود درجات */}
                        {/* صف Exam Averages - يظهر تلقائياً عند وجود درجات */}
{showExamAveragesRow && (
    <div className="table-row exam-averages-row">
        <span className="student-name" style={{ fontWeight: "bold", background: "#fff1e6" }}>
            📊 Exam Average
        </span>
        {exams.map(ex => (
            <div key={ex.id} className="grade-cell">
                <span className="exam-average-value">
                    {getExamAverage(ex.id, ex.total)}
                </span>
            </div>
        ))}
        {showFinalGradeColumn && exams.length > 0 && (
            <span className="avg-col" style={{ fontWeight: "bold" }}>
                {(() => {
                    let totalAvg = 0;
                    let count = 0;
                    students.forEach(student => {
                        const finalGrade = parseFloat(getFinalGrade(student.id));
                        if (!isNaN(finalGrade) && finalGrade !== 0) {
                            totalAvg += finalGrade;
                            count++;
                        }
                    });
                    return count > 0 ? (totalAvg / count).toFixed(1) : "—";
                })()}
            </span>
        )}
    </div>
)}
                    </div>
                </div>
            )}
            
            <div className="avg-btn-container">
                <button className="avg-btn" onClick={() => { if (exams.length === 0) showToast("No exams yet", "error"); else setShowGradeScaleModal(true); }}>📊 Show Final Grade</button>
                <button className="avg-btn" onClick={showOverallAverage}>📈 Class Average</button>
                {exams.length > 0 && <button className="avg-btn reset-btn" onClick={() => setShowConfirmModal(true)}>🔄 Reset All</button>}
            </div>
            
            {showGradeScaleModal && (
                <div className="average-modal-overlay">
                    <div className="average-modal">
                        <h3>Final Grade Scale</h3>
                        <input type="number" min="1" placeholder="Scale (e.g., 100)" value={tempScale} onChange={e => setTempScale(e.target.value)} />
                        <div className="btn-group">
                            <button className="btn primary" onClick={() => { if (!tempScale || tempScale <= 0) showToast("Invalid scale", "error"); else { setScale(Number(tempScale)); setShowFinalGradeColumn(true); setShowGradeScaleModal(false); showToast(`Final Grade scale set to ${tempScale}`); } }}>OK</button>
                            <button className="btn" onClick={() => setShowGradeScaleModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showConfirmModal && (
                <div className="average-modal-overlay">
                    <div className="average-modal">
                        <h3>Confirm Reset</h3>
                        <p>This will delete ALL exams and grades. Students remain.</p>
                        <div className="btn-group">
                            <button className="btn primary" onClick={resetAllExamsAndGrades}>Yes, Reset</button>
                            <button className="btn" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showExamModal && (
                <div className="modal">
                    <div className="modal-box">
                        <h3>Add Exam</h3>
                        <input placeholder="Exam name" value={examName} onChange={e => { setExamName(e.target.value); setExamError(""); }} />
                        <input type="number" min="1" placeholder="Total (minimum 1)" value={examTotal} onChange={e => { setExamTotal(e.target.value); setExamError(""); }} />
                        {examError && <div className="error">{examError}</div>}
                        <div className="modal-buttons">
                            <button className="btn primary" onClick={() => { 
                                if (!examName.trim()) { setExamError("Exam name is required"); return; }
                                const totalNum = Number(examTotal);
                                if (!examTotal || totalNum < 1) { setExamError("Total must be at least 1"); return; }
                                axios.post(`${API}/add-exam`, { classId: selectedClass.id, name: examName, total: totalNum })
                                    .then(() => { 
                                        setShowExamModal(false); 
                                        setExamName(""); 
                                        setExamTotal(""); 
                                        setExamError(""); 
                                        loadExams(selectedClass.id);
                                        showToast(`Exam "${examName}" added!`);
                                    })
                                    .catch(err => setExamError(err.response?.data?.error));
                            }}>Create</button>
                            <button className="btn secondary" onClick={() => setShowExamModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            
            <button className="btn-back" onClick={() => setView("class")}>Back</button>
            <footer className="app-footer">Copyright ©️ 2026. Designed and Developed by Mohamad Abdallah.</footer>
        </div>
    );
}
    
    // ----------------- WEEKLY PLAN -----------------
    if (view === "schedule") {
        return (
            <div className="class-page">
                {toast.show && <div className={`toast-message ${toast.type}`}>{toast.message}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h2 className="center-title" style={{ marginBottom: 0 }}>📅 Weekly Plan - {selectedClass.name}</h2>
                    <ProfileButton />
                </div>
                <div className="create-class-box" onClick={() => { setCurrentWeek(null); setWeekForm({ week_number: weeklyPlan.length + 1, subject: "", topic: "", notes: "" }); setWeekError(""); setShowWeekModal(true); }}>+ Add Week</div>
                <div className="weekly-plan-container">
                    {weeklyPlan.map(week => (
                        <div key={week.id} className="weekly-card">
                            <div className="weekly-header">
                                <h3>Week {week.week_number}</h3>
                                <div className="weekly-actions">
                                    <button onClick={() => { setCurrentWeek(week); setWeekForm({ week_number: week.week_number, subject: week.subject, topic: week.topic, notes: week.notes || "" }); setWeekError(""); setShowWeekModal(true); }}>✏️</button>
                                    <button onClick={() => deleteWeeklyPlan(week.id)}>🗑️</button>
                                </div>
                            </div>
                            <div><strong>Subject:</strong> {week.subject}</div>
                            <div><strong>Topic:</strong> {week.topic}</div>
                            {week.notes && <div><strong>Notes:</strong> {week.notes}</div>}
                        </div>
                    ))}
                </div>
                {showWeekModal && (
                    <div className="modal">
                        <div className="modal-box">
                            <h3>{currentWeek ? "Edit Week" : "Add Week"}</h3>
                            <input type="number" placeholder="Week Number" value={weekForm.week_number} onChange={e => setWeekForm({ ...weekForm, week_number: e.target.value })} disabled={!!currentWeek} />
                            <input placeholder="Subject" value={weekForm.subject} onChange={e => setWeekForm({ ...weekForm, subject: e.target.value })} />
                            <input placeholder="Topic" value={weekForm.topic} onChange={e => setWeekForm({ ...weekForm, topic: e.target.value })} />
                            <textarea placeholder="Notes (optional)" rows="3" value={weekForm.notes} onChange={e => setWeekForm({ ...weekForm, notes: e.target.value })} />
                            {weekError && <div className="error">{weekError}</div>}
                            <div className="modal-buttons">
                                <button className="btn primary" onClick={saveWeeklyPlanItem}>Save</button>
                                <button className="btn secondary" onClick={() => setShowWeekModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
                <button className="btn-back" onClick={() => setView("class")}>Back</button>
                <footer className="app-footer">Copyright ©️ 2026. Designed and Developed by Mohamad Abdallah.</footer>
            </div>
        );
    }
    
    // ----------------- NOTES -----------------
    if (view === "notes") {
        return (
            <div className="class-page">
                {toast.show && <div className={`toast-message ${toast.type}`}>{toast.message}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h2 className="center-title" style={{ marginBottom: 0 }}>📝 Sticky Notes - {selectedClass.name}</h2>
                    <ProfileButton />
                </div>
                <div className="create-class-box" onClick={() => { setEditNote(null); setNoteForm({ title: "", content: "", bg_color: "#fef9c3" }); setNoteError(""); setShowNoteModal(true); }}>+ Add Note</div>
                <div className="notes-grid">
                    {notes.map(note => (
                        <div key={note.id} className="sticky-note" style={{ backgroundColor: note.bg_color }}>
                            <div className="sticky-note-header">
                                <h3>{note.title}</h3>
                                <div className="sticky-note-actions">
                                    <button className="note-edit" onClick={() => editNoteHandler(note)}>✏️</button>
                                    <button className="note-delete" onClick={() => deleteNote(note.id)}>✖</button>
                                </div>
                            </div>
                            <p className="sticky-note-content">{note.content}</p>
                            <div className="sticky-note-date">{new Date(note.created_at).toLocaleDateString()}</div>
                        </div>
                    ))}
                </div>
                {showNoteModal && (
                    <div className="modal">
                        <div className="modal-box" style={{ maxWidth: "500px" }}>
                            <h3>{editNote ? "Edit Note" : "Add Note"}</h3>
                            <input placeholder="Title" value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} />
                            <textarea placeholder="Content" rows="5" value={noteForm.content} onChange={e => setNoteForm({ ...noteForm, content: e.target.value })} />
                            {noteError && <div className="error">{noteError}</div>}
                            <div className="color-picker">
                                <label>Note Color:</label>
                                <div className="color-options">
                                    {noteColors.map(color => (
                                        <div key={color} className={`color-option ${noteForm.bg_color === color ? "active" : ""}`} style={{ backgroundColor: color }} onClick={() => setNoteForm({ ...noteForm, bg_color: color })} />
                                    ))}
                                </div>
                            </div>
                            <div className="modal-buttons">
                                <button className="btn primary" onClick={saveNote}>Save Note</button>
                                <button className="btn secondary" onClick={() => setShowNoteModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
                <button className="btn-back" onClick={() => setView("class")}>Back</button>
                <footer className="app-footer">Copyright ©️ 2026. Designed and Developed by Mohamad Abdallah.</footer>
            </div>
        );
    }
    
    return null;
}