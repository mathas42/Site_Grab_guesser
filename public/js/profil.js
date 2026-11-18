const form = document.getElementById("form-profil");
const currentAvatar = document.getElementById("avatar-actuel");
const galerie = document.getElementById("galerie-avatars");

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
    });
});

// Save the profile (nickname, avatar and optionally the password)
setupProfileEdit(form, currentAvatar, () => avatarChoisi);


function setupProfileEdit(form, avatarActuel, getAvatar) {
    const nicknameInput = document.getElementById("nickname");
    const saveButton = document.getElementById("enregistrer-profil");
    if (!nicknameInput || !saveButton) return;

    const currentInput = document.getElementById("current-password");
    const newInput = document.getElementById("new-password");
    const confirmInput = document.getElementById("confirm-password");

    function fail(text, field) {
        getNotification("Profile", text, "error");
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

            getNotification("Profile", data.message + ".");
        } catch (error) {
            getNotification("Profile", error.message, "error");
        } finally {
            saveButton.disabled = false;
        }
    });
}
