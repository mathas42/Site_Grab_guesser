function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email) && email.length >= 6 && email.length <= 64;
}

function setupEmailCheck() {
    const emailInput = document.getElementById("email");
    const errorMessage = document.getElementById("error-message");
    if (!emailInput) return () => true;

    function check() {
        const ok = isValidEmail(emailInput.value);
        if (errorMessage) {
            errorMessage.textContent =
                ok || emailInput.value === ""
                    ? ""
                    : "Please enter a valid e-mail address.";
        }
        return ok;
    }

    emailInput.addEventListener("input", check);
    return check;
}

const form = document.getElementById("form-profil");
const avatarActuel = document.getElementById("avatar-actuel");
const galerie = document.getElementById("galerie-avatars");

if (form && avatarActuel && galerie) {
    let avatarChoisi = avatarActuel.getAttribute("src");

    // avatar selection
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

    // CASE 1: registration
    if (form.getAttribute("action") === "/register") {
        const checkEmail = setupEmailCheck();

        form.addEventListener("submit", (event) => {
            // block the sending if the e-mail is invalid
            if (!checkEmail()) {
                event.preventDefault();
                document.getElementById("email").focus();
                return;
            }

            // send the chosen avatar with the form
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

    // CASE 2: profile edition
    else {
        const nicknameInput = document.getElementById("nickname");
        const message = document.getElementById("message-profil");
        const boutonEnregistrer = document.getElementById("enregistrer-profil");

        if (nicknameInput && message && boutonEnregistrer) {
            form.addEventListener("submit", async (event) => {
                event.preventDefault();

                boutonEnregistrer.disabled = true;
                message.textContent = "Saving...";

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
                        throw new Error(data.erreur || "Error while saving.");
                    }

                    message.textContent = data.message;
                    nicknameInput.value = data.nickname;
                    avatarActuel.src = data.avatar;
                    getNotification('Profile', 'Your profile has been updated.')
                } catch (error) {
                    message.textContent = error.message;
                } finally {
                    boutonEnregistrer.disabled = false;
                }
            });
        }
    }
}

if (new URLSearchParams(window.location.search).get("registered") === "1") {
    getNotification("Register", "Your account has been created.");
}