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

        avatarActuel.addEventListener("click",()=>{
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


function ProfilePopup() {
    const avatar = document.querySelector(".avatar-profil");
    if (!avatar) return;

    const overlay = document.createElement("div");
    const popup = document.createElement("div");
    const image = document.createElement("img");
    const title = document.createElement("h2");
    const description = document.createElement("p");
    const editButton = document.createElement("button");
    const logOut= document.createElement("button");
    const closeButton = document.createElement("button");

    overlay.style.background="#007a3d";

    image.src = avatar.src;
    image.alt = avatar.alt;
    image.style.width="30%";
    image.style.borderRadius="50%";
    image.style.justifyContent="center";

    title.textContent = avatar.dataset.nickname;
    title.style.textAlign="center";

    description.textContent = "Your profile";

    logOut.textContent="Log Out"
    logOut.type="submit";
    editButton.textContent = "Edit profile";
    closeButton.textContent = "Close";

    overlay.classList.add("popup-overlay");
    popup.classList.add("popup");
    logOut.classList.add("popup-close");
    editButton.classList.add("popup-close");
    closeButton.classList.add("popup-close");

    popup.append(image, title, description, editButton,logOut, closeButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    function close() {
        overlay.remove();
        document.removeEventListener("keydown", onKey);
    }

    function onKey(e) {
        if (e.key === "Escape") close();
    }

    logOut.addEventListener("click", () => {
        const logoutForm = document.createElement("form");
        logoutForm.method = "POST";
        logoutForm.action = "/logout";
        document.body.appendChild(logoutForm);
        logoutForm.submit();
    });

    editButton.addEventListener("click", () => {
        window.location.href = "/profil";
    });
    closeButton.addEventListener("click", close);

    // clicking outside the popup closes it
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
    });

    document.addEventListener("keydown", onKey);
}


