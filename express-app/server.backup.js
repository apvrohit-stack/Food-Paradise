
require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("./db");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = Number(process.env.PORT) || 5001;

const dataFile = path.join(__dirname, "foods.json");
const publicDirectory = path.join(__dirname, "public");

// ========================================
// CORS CONFIGURATION
// ========================================

const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
];

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Vary", "Origin");

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());
app.use(express.static(publicDirectory));

// ========================================
// FOOD FILE MANAGEMENT
// ========================================

if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "[]", "utf8");
}

function readFoods() {
    const contents = fs.readFileSync(dataFile, "utf8");
    const foods = JSON.parse(contents);

    if (!Array.isArray(foods)) {
        throw new Error("foods.json must contain an array.");
    }

    return foods;
}

function writeFoods(foods) {
    fs.writeFileSync(
        dataFile,
        JSON.stringify(foods, null, 2) + "\n",
        "utf8"
    );
}

// ========================================
// FOOD VALIDATION
// ========================================

function validateFood(body) {
    const errors = [];

    const name = String(body.name || "").trim();
    const type = String(body.type || "").trim();
    const price = Number(body.price);
    const calories = Number(body.calories);

    if (!name) {
        errors.push("Food name is required.");
    }

    if (!["Diet", "Normal"].includes(type)) {
        errors.push('Category must be "Diet" or "Normal".');
    }

    if (
        body.price === "" ||
        body.price === undefined ||
        body.price === null ||
        !Number.isFinite(price) ||
        price < 0
    ) {
        errors.push("Price must be a valid non-negative number.");
    }

    if (
        body.calories === "" ||
        body.calories === undefined ||
        body.calories === null ||
        !Number.isFinite(calories) ||
        calories < 0
    ) {
        errors.push("Calories must be a valid non-negative number.");
    }

    return {
        errors,
        food: {
            name,
            type,
            price,
            calories,
            serving: String(body.serving || "").trim(),
            protein: String(body.protein || "").trim(),
            ingredients: String(body.ingredients || "").trim()
        }
    };
}

// ========================================
// HOME API
// ========================================

app.get("/", (req, res) => {
    res.json({
        message: "Food Paradise REST API is running.",
        endpoints: [
            "GET /",
            "GET /foods",
            "GET /foods/:id",
            "POST /foods",
            "PUT /foods/:id",
            "DELETE /foods/:id",
            "POST /api/signup",
            "POST /api/login",
            "GET /api/db-status"
        ]
    });
});

// ========================================
// MYSQL DATABASE STATUS
// ========================================

app.get("/api/db-status", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT DATABASE() AS database_name"
        );

        res.json({
            success: true,
            message: "MySQL connected successfully.",
            database: rows[0].database_name
        });

    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            success: false,
            message: "MySQL connection failed."
        });
    }
});

// ========================================
// SIGNUP API - MYSQL
// ========================================

app.post("/api/signup", async (req, res) => {
    try {
        const username = String(req.body.username || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields."
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (password.length < 5 || password.length > 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain 5 to 8 characters."
            });
        }

        // Check existing username or email
        const [existingUsers] = await db.execute(
            "SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1",
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Username or email already exists."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into MySQL
        const [result] = await db.execute(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: "Registration successful!",
            user: {
                id: result.insertId,
                username: username,
                email: email
            }
        });

    } catch (error) {
        console.error("Signup error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to register user."
        });
    }
});

// ========================================
// LOGIN API - MYSQL
// ========================================

app.post("/api/login", async (req, res) => {
    try {
        const identifier = String(
            req.body.email ||
            req.body.username ||
            req.body.identifier ||
            ""
        ).trim();

        const password = String(req.body.password || "");

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter your username/email and password."
            });
        }

        // Find user using email or username
        const [users] = await db.execute(
            "SELECT id, username, email, password FROM users WHERE email = ? OR username = ? LIMIT 1",
            [identifier.toLowerCase(), identifier]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid username/email or password."
            });
        }

        const user = users[0];

        // Check password
        const isBcryptHash = /^\$2[aby]\$/.test(user.password);

        let passwordMatches = false;

        if (isBcryptHash) {
            passwordMatches = await bcrypt.compare(
                password,
                user.password
            );
        } else {
            // Upgrade an existing plain-text password after successful login
            passwordMatches = password === user.password;

            if (passwordMatches) {
                const newHash = await bcrypt.hash(password, 10);

                await db.execute(
                    "UPDATE users SET password = ? WHERE id = ?",
                    [newHash, user.id]
                );
            }
        }

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid username/email or password."
            });
        }

        res.json({
            success: true,
            message: "Login successful!",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to login."
        });
    }
});

// ========================================
// GET ALL FOODS
// ========================================

app.get("/foods", (req, res) => {
    try {
        const foods = readFoods();
        res.json(foods);

    } catch (error) {
        console.error("Error reading foods:", error.message);

        res.status(500).json({
            error: "Unable to read food records."
        });
    }
});

// ========================================
// GET FOOD BY ID
// ========================================

app.get("/foods/:id", (req, res) => {
    try {
        const foods = readFoods();
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid food ID."
            });
        }

        const food = foods.find(
            item => Number(item.id) === id
        );

        if (!food) {
            return res.status(404).json({
                error: "Food item not found."
            });
        }

        res.json(food);

    } catch (error) {
        console.error("Error retrieving food:", error.message);

        res.status(500).json({
            error: "Unable to retrieve the food item."
        });
    }
});

// ========================================
// ADD NEW FOOD
// ========================================

app.post("/foods", (req, res) => {
    try {
        const { errors, food } = validateFood(req.body);

        if (errors.length > 0) {
            return res.status(400).json({
                errors
            });
        }

        const foods = readFoods();

        const nextId = foods.length > 0
            ? Math.max(...foods.map(item => Number(item.id) || 0)) + 1
            : 1;

        const newFood = {
            id: nextId,
            ...food
        };

        foods.push(newFood);
        writeFoods(foods);

        res.status(201).json({
            message: "Food item added successfully.",
            food: newFood
        });

    } catch (error) {
        console.error("Error adding food:", error.message);

        res.status(500).json({
            error: "Unable to add the food item."
        });
    }
});

// ========================================
// UPDATE FOOD
// ========================================

app.put("/foods/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid food ID."
            });
        }

        const { errors, food } = validateFood(req.body);

        if (errors.length > 0) {
            return res.status(400).json({
                errors
            });
        }

        const foods = readFoods();

        const index = foods.findIndex(
            item => Number(item.id) === id
        );

        if (index === -1) {
            return res.status(404).json({
                error: "Food item not found."
            });
        }

        const updatedFood = {
            ...foods[index],
            ...food,
            id: foods[index].id
        };

        foods[index] = updatedFood;
        writeFoods(foods);

        res.json({
            message: "Food item updated successfully.",
            food: updatedFood
        });

    } catch (error) {
        console.error("Error updating food:", error.message);

        res.status(500).json({
            error: "Unable to update the food item."
        });
    }
});

// ========================================
// DELETE FOOD
// ========================================

app.delete("/foods/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid food ID."
            });
        }

        const foods = readFoods();

        const index = foods.findIndex(
            item => Number(item.id) === id
        );

        if (index === -1) {
            return res.status(404).json({
                error: "Food item not found."
            });
        }

        const deletedFood = foods[index];

        foods.splice(index, 1);
        writeFoods(foods);

        res.json({
            message: "Food item deleted successfully.",
            food: deletedFood
        });

    } catch (error) {
        console.error("Error deleting food:", error.message);

        res.status(500).json({
            error: "Unable to delete the food item."
        });
    }
});

// ========================================
// INVALID FOOD API ROUTES
// ========================================

app.use("/foods", (req, res) => {
    res.status(404).json({
        error: "Food API endpoint not found."
    });
});

// ========================================
// INVALID JSON AND SERVER ERRORS
// ========================================

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400) {
        return res.status(400).json({
            error: "Invalid JSON request body."
        });
    }

    console.error("Server error:", error.message);

    res.status(500).json({
        error: "Internal server error."
    });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
    console.log(`Food REST API running at http://localhost:${PORT}`);
    console.log(`Food records: http://localhost:${PORT}/foods`);
    console.log(`Signup API: http://localhost:${PORT}/api/signup`);
    console.log(`Login API: http://localhost:${PORT}/api/login`);
});
