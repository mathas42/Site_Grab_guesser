const form = document.getElementById("form-profil");
const nicknameInput = document.getElementById("nickname");
const avatarActuel = document.getElementById("avatar-actuel");
const galerie = document.getElementById("galerie-avatars");
const message = document.getElementById("message-profil");
const boutonEnregistrer = document.getElementById("enregistrer-profil");

let avatarChoisi = avatarActuel.getAttribute("src");

// Sélectionner un avatar
galerie.querySelectorAll(".avatar-option").forEach((bouton) => {
    bouton.addEventListener("click", () => {
        avatarChoisi = bouton.dataset.avatar;
        avatarActuel.src = avatarChoisi;

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
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nickname: nicknameInput.value,
                avatar: avatarChoisi
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.erreur || "Erreur lors de la sauvegarde.");
        }

        message.textContent = data.message;
        avatarActuel.src = data.avatar;

        // Actualiser le pseudo affiché dans le champ
        nicknameInput.value = data.nickname;
    } catch (error) {
        message.textContent = error.message;
    } finally {
        boutonEnregistrer.disabled = false;
    }
});
