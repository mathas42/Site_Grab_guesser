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
            // dish edits (/dishes/:id) have no category: they go to the dishes folder
            const folder = FOLDERS[req.params.category || "dishes"];
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

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: "Gets the list of users"
 *     description: |
 *       Gives the list of all users. Admin only.
 *
 *       **Query parameters:**
 *       - `search` (string, optional) : keeps only the users whose nickname contains this text
 *     tags: ["Admin"]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema: { type: string, example: "Player" }
 *         description: "Part of the nickname to search"
 *     responses:
 *       200:
 *         description: "OK"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer, description: "User ID", example: 1 }
 *                   user_role: { type: string, description: "Role of the user", example: "Player" }
 *                   nickname: { type: string, description: "Nickname of the user", example: "Player1" }
 *                   email: { type: string, description: "Email of the user", example: "player1@mail.com" }
 *                   creation_date: { type: string, description: "Account creation date", example: "2026-11-20T10:00:00.000Z" }
 *       403:
 *         description: "User is not an admin"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Access denied" }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "An error occurred" }
 */
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

/**
 * @openapi
 * /admin/users/{id}:
 *   patch:
 *     summary: "Updates a user"
 *     description: |
 *       Changes the role and the nickname of a user. Admin only.
 *
 *       **Body parameters (JSON):**
 *       - `role` (string) : "Player" or "Admin"
 *       - `nickname` (string) : new nickname, 1 to 30 characters
 *     tags: ["Admin"]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 2 }
 *         description: "User ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role, nickname]
 *             properties:
 *               role: { type: string, enum: ["Player", "Admin"], description: "New role", example: "Admin" }
 *               nickname: { type: string, description: "New nickname", example: "Player1" }
 *     responses:
 *       200:
 *         description: "OK, user updated"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "User updated" }
 *       400:
 *         description: "Invalid ID, role or nickname"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Invalid role" }
 *       403:
 *         description: "User is not an admin"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Access denied" }
 *       404:
 *         description: "User unfindable"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "User not found" }
 *       409:
 *         description: "Nickname already taken"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "This nickname is already taken" }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "An error occurred" }
 *   delete:
 *     summary: "Deletes a user"
 *     description: "Deletes a user account. Admin only. An admin cannot delete their own account."
 *     tags: ["Admin"]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 2 }
 *         description: "User ID"
 *     responses:
 *       200:
 *         description: "OK, user deleted"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "User deleted" }
 *       400:
 *         description: "Invalid ID, or admin trying to delete their own account"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "You cannot delete your own account" }
 *       403:
 *         description: "User is not an admin"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Access denied" }
 *       404:
 *         description: "User unfindable"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "User not found" }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "An error occurred" }
 */
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

/**
 * @openapi
 * /admin/upload/{category}:
 *   post:
 *     summary: "Adds a new dish"
 *     description: |
 *       Uploads the image of a dish and adds the dish to the database. Admin only.
 *
 *       **Body parameters (form-data):**
 *       - `image` (file) : image of the dish, JPG, PNG or WebP, 4 MB maximum
 *       - `nom` (string) : dish name
 *       - `nom_restaurant` (string) : name of the restaurant
 *       - `prix` (number) : price of the dish, must be positive
 *       - `description` (string, optional) : description of the dish
 *     tags: ["Admin"]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema: { type: string, example: "dishes" }
 *         description: "Destination folder of the image (only \"dishes\")"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image, nom, nom_restaurant, prix]
 *             properties:
 *               image: { type: string, format: binary, description: "Image of the dish" }
 *               nom: { type: string, description: "Dish name", example: "Roti Canai" }
 *               nom_restaurant: { type: string, description: "Name of the restaurant", example: "Restoran Nasi Kandar" }
 *               prix: { type: number, description: "Price of the dish", example: 4.5 }
 *               description: { type: string, description: "Description of the dish", example: "Flatbread served with curry." }
 *     responses:
 *       201:
 *         description: "OK, dish added"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "\"Roti Canai\" added." }
 *                 id: { type: integer, description: "ID of the new dish", example: 120 }
 *                 image: { type: string, description: "Path of the saved image", example: "/images/dishes/3f2a9c1e.jpg" }
 *       400:
 *         description: "Invalid image or invalid fields"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Price must be a positive number." }
 *       403:
 *         description: "User is not an admin"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Access denied" }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "An error occurred while saving the dish." }
 */
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

/**
 * @openapi
 * /admin/dishes/{id}:
 *   patch:
 *     summary: "Updates a dish"
 *     description: |
 *       Changes the information of a dish. The duplicates of the dish (same name and restaurant) are updated too. Admin only.
 *
 *       **Body parameters (form-data):**
 *       - `image` (file, optional) : new image, JPG, PNG or WebP, 4 MB maximum. If empty, the old image is kept
 *       - `nom` (string) : dish name
 *       - `nom_restaurant` (string) : name of the restaurant
 *       - `prix` (number) : price of the dish
 *       - `description` (string, optional) : description of the dish
 *     tags: ["Admin"]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 3 }
 *         description: "Dish ID"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [nom, nom_restaurant, prix]
 *             properties:
 *               image: { type: string, format: binary, description: "New image of the dish" }
 *               nom: { type: string, description: "Dish name", example: "Roti Canai" }
 *               nom_restaurant: { type: string, description: "Name of the restaurant", example: "Restoran Nasi Kandar" }
 *               prix: { type: number, description: "Price of the dish", example: 4.5 }
 *               description: { type: string, description: "Description of the dish", example: "Flatbread served with curry." }
 *     responses:
 *       200:
 *         description: "OK, dish updated"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "\"Roti Canai\" updated." }
 *                 produit:
 *                   type: object
 *                   description: "The updated dish"
 *                   properties:
 *                     id: { type: integer, example: 3 }
 *                     nom: { type: string, example: "Roti Canai" }
 *                     nom_restaurant: { type: string, example: "Restoran Nasi Kandar" }
 *                     prix: { type: string, example: "4.50" }
 *                     description: { type: string, example: "Flatbread served with curry." }
 *                     image: { type: string, example: "/images/Roti_Canai.jpg" }
 *       400:
 *         description: "Invalid ID, image or fields"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Dish name and restaurant name are required." }
 *       403:
 *         description: "User is not an admin"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Access denied" }
 *       404:
 *         description: "Dish unfindable"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Dish not found" }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "An error occurred while saving the dish." }
 *   delete:
 *     summary: "Deletes a dish"
 *     description: "Deletes a dish and its duplicates (same name and restaurant). Admin only."
 *     tags: ["Admin"]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 3 }
 *         description: "Dish ID"
 *     responses:
 *       200:
 *         description: "OK, dish deleted"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Dish deleted successfully" }
 *       400:
 *         description: "Invalid ID"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Invalid dish ID" }
 *       403:
 *         description: "User is not an admin"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Access denied" }
 *       404:
 *         description: "Dish unfindable"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Dish not found" }
 *       500:
 *         description: "Database error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "An error occurred" }
 */
router.patch("/dishes/:id", (req, res) => {
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(400).json({ message: "Invalid dish ID" });
    }
    const id = Number(req.params.id);

    upload.single("image")(req, res, (error) => {
        if (error) {
            const messages = {
                LIMIT_FILE_SIZE: "The image is too large (4 MB maximum).",
                LIMIT_UNEXPECTED_FILE: "Only one image per dish.",
                INVALID_TYPE: "Only JPG, PNG or WebP images are allowed."
            };
            return res.status(400).json({
                message: messages[error.code] || messages[error.message] || "Upload failed."
            });
        }

        const nom = String(req.body.nom || "").trim();
        const nomRestaurant = String(req.body.nom_restaurant || "").trim();
        const prix = Number(req.body.prix);
        const description = String(req.body.description || "").trim() || null;

        const fail = (status, message) => {
            if (req.file) fs.unlink(req.file.path, () => {});
            res.status(status).json({ message });
        };

        if (!nom || !nomRestaurant) {
            return fail(400, "Dish name and restaurant name are required.");
        }

        db.query("SELECT nom, nom_restaurant, image FROM produit WHERE id = ?", [id], (selectError, rows) => {
            if (selectError) {
                console.error(selectError);
                return fail(500, "An error occurred while saving the dish.");
            }
            if (rows.length === 0) {
                return fail(404, "Dish not found");
            }

            const old = rows[0];        
             const image = req.file ? `/images/${FOLDERS.dishes}/${req.file.filename}` : old.image;

            db.query(
                `UPDATE produit SET nom = ?, nom_restaurant = ?, prix = ?, description = ?, image = ?
                 WHERE LOWER(TRIM(nom)) = LOWER(TRIM(?)) AND LOWER(TRIM(nom_restaurant)) = LOWER(TRIM(?))`,
                [nom, nomRestaurant, prix.toFixed(2), description, image, old.nom, old.nom_restaurant],
                (updateError) => {
                    if (updateError) {
                        console.error(updateError);
                        return fail(500, "An error occurred while saving the dish.");
                    }
                    res.json({
                        message: `"${nom}" updated.`,
                        produit: { id, nom, nom_restaurant: nomRestaurant, prix: prix.toFixed(2), description, image }
                    });
                }
            );
        });
    });
});


router.delete("/dishes/:id", (req, res) => {
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(400).json({ message: "Invalid dish ID" });
    }
    const id = Number(req.params.id);

    // the catalogue merges duplicates (same name + restaurant): all of them are deleted,
    // otherwise the next duplicate would show up in place of the deleted dish
    db.query(
        `SELECT p.id FROM produit p
         JOIN produit ref ON ref.id = ?
         WHERE LOWER(TRIM(p.nom)) = LOWER(TRIM(ref.nom))
           AND LOWER(TRIM(p.nom_restaurant)) = LOWER(TRIM(ref.nom_restaurant))`,
        [id],
        (selectError, rows) => {
            if (selectError) {
                console.error(selectError);
                return res.status(500).json({ message: "An error occurred" });
            }
            if (rows.length === 0) {
                return res.status(404).json({ message: "Dish not found" });
            }
            const ids = rows.map((row) => row.id);

            // games currently on this dish must not block the deletion (foreign key)
            db.query("UPDATE partie SET produit_actuel = NULL WHERE produit_actuel IN (?)", [ids], (updateError) => {
                if (updateError) {
                    console.error(updateError);
                    return res.status(500).json({ message: "An error occurred" });
                }

                db.query("DELETE FROM produit WHERE id IN (?)", [ids], (deleteError) => {
                    if (deleteError) {
                        console.error(deleteError);
                        return res.status(500).json({ message: "An error occurred" });
                    }
                    res.json({ message: "Dish deleted successfully" });
                });
            });
        }
    );
});

module.exports = router;
