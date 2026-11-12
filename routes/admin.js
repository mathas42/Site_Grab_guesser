const express = require("express");

const router = express.Router();
const db = require("../database");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const IMAGES_DIR = path.join(__dirname, "..", "public", "images");
const ALLOWED = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const FOLDERS = {
    dishes: "dishes",
};

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const folder = FOLDERS[req.params.category];
            if (!folder) return cb(new Error("INVALID_FOLDER"));

            const dir = path.join(IMAGES_DIR, folder);
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => cb(null, crypto.randomUUID() + ALLOWED[file.mimetype])
    }),
    limits: { fileSize: 4 * 1024 * 1024, files: 10 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype in ALLOWED) return cb(null, true);
        cb(new Error("INVALID_TYPE"));
    }
});

router.use((req, res, next) => {
    if (!req.session.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
});

router.get('/users', (req, res) =>{
    const search = String(req.query.search || "");

    let sql = 'SELECT id, user_role, nickname, email, creation_date FROM users';
    const params = [];

    if(search !== ""){
        sql += ' WHERE nickname LIKE ?';
        params.push(`%${search}%`);
    }

    db.query(
        sql, params, (error, results) =>{
            if(error){
                console.error(error);
                res.status(500).json({message : "An error occurred"});
            }
            else{
                res.json(results)
            }
        }
    )
})

router.patch("/users/:id", (req, res) => {
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    const id = Number(req.params.id);
    const role = req.body?.role;
    const nickname = req.body.nickname;

    if (role !== "Player" && role !== "Admin") {
        return res.status(400).json({ message: "Invalid role" });
    }

    if (!nickname || nickname.length > 30) {
        return res.status(400).json({ message: "Nickname must be between 1 and 30 characters" });
    }

    db.query(
        "UPDATE users SET user_role = ?, nickname = ? WHERE id = ?",
        [role, nickname, id],
        (error, result) => {
            if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({ message: "This nickname is already taken" });
                }
                console.error(error);
                return res.status(500).json({ message: "An error occurred" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ message: "User updated" });
        }
    );
});

router.delete("/users/:id", (req, res) => {
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    const id = Number(req.params.id);

    if (id === req.session.userId) {
        return res.status(400).json({ message: "You cannot delete your own account" });
    }

    db.query("DELETE FROM users WHERE id = ?", [id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "An error occurred" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted" });
    });
});

router.post("/upload/:category", (req, res) => {
    upload.single("image")(req, res, (error) => {
        if (error) {
            const messages = {
                LIMIT_FILE_SIZE: "The image is too large (4 MB maximum).",
                LIMIT_UNEXPECTED_FILE: "Only one image per dish.",
                INVALID_TYPE: "Only JPG, PNG or WebP images are allowed.",
                INVALID_FOLDER: "Unknown destination."
            };
            return res.status(400).json({
                message: messages[error.code] || messages[error.message] || "Upload failed."
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Select an image." });
        }

        const nom = String(req.body.nom || "").trim();
        const nomRestaurant = String(req.body.nom_restaurant || "").trim();
        const prix = Number(req.body.prix);
        const description = String(req.body.description || "").trim() || null;

        const fail = (status, message) => {
            fs.unlink(req.file.path, () => {});
            res.status(status).json({ message });
        };

        if (!nom || !nomRestaurant) {
            return fail(400, "Dish name and restaurant name are required.");
        }
        if (nom.length > 255 || nomRestaurant.length > 255) {
            return fail(400, "Names must be 255 characters maximum.");
        }
        if (!Number.isFinite(prix) || prix <= 0) {
            return fail(400, "Price must be a positive number.");
        }

        const image = `/images/${FOLDERS[req.params.category]}/${req.file.filename}`;

        db.query(
            "INSERT INTO produit (nom, nom_restaurant, prix, image, description) VALUES (?, ?, ?, ?, ?)",
            [nom, nomRestaurant, prix.toFixed(2), image, description],
            (dbError, result) => {
                if (dbError) {
                    console.error(dbError);
                    return fail(500, "An error occurred while saving the dish.");
                }
                res.status(201).json({ message: `"${nom}" added.`, id: result.insertId, image });
            }
        );
    });
});

module.exports = router;
