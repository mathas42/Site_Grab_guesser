function notify(title, text, type = "success") {
    if (typeof getNotification === "function") {
        getNotification(title, text, type);
    }
}

function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email) && email.length >= 6 && email.length <= 64;
}

function setupEmailHint() {
    const emailInput = document.getElementById("email");
    const hint = document.getElementById("error-message");
    if (!emailInput || !hint) return;

    emailInput.addEventListener("input", () => {
        const ok = isValidEmail(emailInput.value);
        hint.textContent =
            ok || emailInput.value === "" ? "" : "Please enter a valid e-mail address.";
    });
}


function setupAvatarPicker(avatarActuel, galerie) {
    let avatarChoisi = avatarActuel.getAttribute("src");

    galerie.querySelectorAll(".avatar-option").forEach((bouton) => {
        bouton.addEventListener("click", () => {
            avatarChoisi = bouton.dataset.avatar;
            avatarActuel.src = avatarChoisi;

            galerie.querySelectorAll(".avatar-option").forEach((element) => {
                element.classList.remove("selectionne");
            });
            bouton.classList.add("selectionne");

            const message = document.getElementById("message-profil");
            if (message) message.textContent = "";
        });
    });

    return () => avatarChoisi;
}



function setupRegister(form, getAvatar) {
    const nickname = document.getElementById("nickname");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirm = document.getElementById("password-confirm"); // facultatif

    setupEmailHint();


    const rules = [
        [nickname, () => nickname.value.trim().length >= 3 && nickname.value.trim().length <= 30,
            "The nickname must be between 3 and 30 characters."],
        [email, () => isValidEmail(email.value),
            "Please enter a valid e-mail address."],
        [password, () => password.value.length >= 8,
            "The password must contain at least 8 characters."],
        [confirm, () => confirm.value === password.value,
            "The passwords do not match."]
    ];

    form.addEventListener("submit", (event) => {
        for (const [field, isOk, text] of rules) {
            if (!field) continue;

            if (!isOk()) {
                event.preventDefault();
                notify("Register", text, "error");
                field.focus();
                return;
            }
        }


        let inputAvatar = form.querySelector('input[name="avatar"]');
        if (!inputAvatar) {
            inputAvatar = document.createElement("input");
            inputAvatar.type = "hidden";
            inputAvatar.name = "avatar";
            form.appendChild(inputAvatar);
        }
        inputAvatar.value = getAvatar();
    });
}


function setupProfileEdit(form, avatarActuel, getAvatar) {
    const nicknameInput = document.getElementById("nickname");
    const message = document.getElementById("message-profil");
    const saveButton = document.getElementById("enregistrer-profil");
    if (!nicknameInput || !message || !saveButton) return;

    const currentInput = document.getElementById("current-password");
    const newInput = document.getElementById("new-password");
    const confirmInput = document.getElementById("confirm-password");

    function fail(text, field) {
        message.textContent = text;
        notify("Profile", text, "error");
        if (field) field.focus();
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const body = { nickname: nicknameInput.value, avatar: getAvatar() };

        const wantsPassword = currentInput && (currentInput.value !== "" || newInput.value !== "" || confirmInput.value !== "");

        if (wantsPassword) {
            if (currentInput.value === "") return fail("Enter your current password.", currentInput);
            if (newInput.value.length < 8) return fail("The new password must contain at least 8 characters.", newInput);
            if (newInput.value === currentInput.value) return fail("The new password must be different from the current one.", newInput);
            if (confirmInput.value !== newInput.value) return fail("The passwords do not match.", confirmInput);

            body.currentPassword = currentInput.value;
            body.newPassword = newInput.value;
        }

        saveButton.disabled = true;
        message.textContent = "Saving...";

        try {
            const response = await fetch("/api/profil", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.erreur || "Error while saving.");
            }

            message.textContent = data.message;
            nicknameInput.value = data.nickname;
            avatarActuel.src = data.avatar;

            const navName = document.getElementById("user-name");
            if (navName) navName.textContent = data.nickname;
            document.querySelectorAll("nav .avatar-profil").forEach((img) => { img.src = data.avatar; });

            if (wantsPassword) {
                currentInput.value = "";
                newInput.value = "";
                confirmInput.value = "";
            }

            notify("Profile", data.message + ".");
        } catch (error) {
            message.textContent = error.message;
            notify("Profile", error.message, "error");
        } finally {
            saveButton.disabled = false;
        }
    });
}


const form = document.getElementById("form-profil");
const avatarActuel = document.getElementById("avatar-actuel");
const galerie = document.getElementById("galerie-avatars");

if (form && avatarActuel && galerie) {
    const getAvatar = setupAvatarPicker(avatarActuel, galerie);

    if (form.getAttribute("action") === "/register") {
        setupRegister(form, getAvatar);
    } else {
        setupProfileEdit(form, avatarActuel, getAvatar);
    }
}

if (new URLSearchParams(window.location.search).get("registered") === "1") {
    notify("Register", "Your account has been created.");
}


const serverError = document.getElementById("error-message");
if (serverError && serverError.textContent.trim() !== "") {
    notify("Register", serverError.textContent.trim(), "error");
}