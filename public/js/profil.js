const form = document.getElementById("form-profil");
const nicknameInput = document.getElementById("nickname");
const currentAvatar = document.getElementById("avatar-actuel");
const galerie = document.getElementById("galerie-avatars");
const message = document.getElementById("message-profil");
const boutonEnregistrer = document.getElementById("enregistrer-profil");

let avatarChoisi = currentAvatar.getAttribute("src");

//Choose a avatar
galerie.querySelectorAll(".avatar-option").forEach((bouton) => {
    bouton.addEventListener("click", () => {
        avatarChoisi = bouton.dataset.avatar;
        currentAvatar.src = avatarChoisi;

        currentAvatar.addEventListener("click",()=>{
            openPopup();
        })

        galerie.querySelectorAll(".avatar-option").forEach((element) => {
            element.classList.remove("selectionne");
        });

        bouton.classList.add("selectionne");
        message.textContent = "";
    });
});

// Enregistrer le profil
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    boutonEnregistrer.disabled = true;
    message.textContent = "Enregistrement...";

    try {
        const response = await fetch("/api/profil", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nickname: nicknameInput.value,
                avatar: avatarChoisi
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.erreur || "Erreur lors de la sauvegarde.");
        }

        window.location.href = "/dashboard?profile=updated";
    } catch (error) {
        message.textContent = error.message;               
        boutonEnregistrer.disabled = false;
    }
});


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
