const form = document.getElementById("form-profil");
const avatarActuel = document.getElementById("avatar-actuel");
const galerie = document.getElementById("galerie-avatars");

if (form && avatarActuel && galerie) {
    let avatarChoisi = avatarActuel.getAttribute("src");

    // Sélection d'un avatar
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

    // CAS 1 : inscription
    if (form.action.endsWith("/register")) {
        form.addEventListener("submit", () => {
            let inputAvatar = form.querySelector('input[name="avatar"]');

            if (!inputAvatar) {
                inputAvatar = document.createElement("input");
                inputAvatar.type = "hidden";
                inputAvatar.name = "avatar";
                form.appendChild(inputAvatar);
            }

            inputAvatar.value = avatarChoisi;
        });
    }

    // CAS 2 : modification du profil
    else {
        const nicknameInput = document.getElementById("nickname");
        const message = document.getElementById("message-profil");
        const boutonEnregistrer = document.getElementById("enregistrer-profil");

        if (nicknameInput && message && boutonEnregistrer) {
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
                    nicknameInput.value = data.nickname;
                    avatarActuel.src = data.avatar;
                } catch (error) {
                    message.textContent = error.message;
                } finally {
                    boutonEnregistrer.disabled = false;
                }
            });
        }
    }
}
