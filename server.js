const express = require("express");
const mysql = require("mysql");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bcrypt = require("bcryptjs");
const cors = require('cors');
const bodyParser = require("body-parser");


const app = express();
app.use(cors({ origin: 'http://127.0.0.1:5501', credentials: true }));
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",  // Update with your MySQL password if set
    database: "user_auth"
});

// Connect to MySQL
db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected...");
});
const sessionStoreOptions = {
    clearExpired: true,
    checkExpirationInterval: 900000, // 15 minutes
    expiration: 86400000, // 1 day
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
};

// Create a session store in MySQL
const sessionStore = new MySQLStore({}, db);

app.use(session({
    name: 'sessionId', // Changed from user_sid for clarity
    secret: process.env.SESSION_SECRET || 'fallback_secret_should_be_changed', // Use env variable
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        httpOnly: true, // Prevent client-side JS access
        secure: process.env.NODE_ENV === 'production', // HTTPS in production
        sameSite: 'lax', // CSRF protection
        maxAge: 86400000, // 1 day
        domain: '127.0.0.1' // Match your domain
    }
}));

// ✅ Signup Route
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ message: "Error registering user" });
        res.json({ message: "User registered successfully!" });
    });
});

// ✅ Login Route (Session-Based)
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Error logging in" });
        if (results.length === 0) return res.status(400).json({ message: "User not found" });

        const isValid = await bcrypt.compare(password, results[0].password);
        if (!isValid) return res.status(401).json({ message: "Incorrect password" });

        // Store user session
        req.session.user = { id: results[0].id, username: results[0].username, email: results[0].email };
        res.json({ message: "Login successful!", user: req.session.user });
    });
});
app.get("/check-session", (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// ✅ Logout Route
app.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.json({ message: "Logout successful" });
    });
});

// Start Server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});




