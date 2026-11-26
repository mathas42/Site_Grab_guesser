(() => {
    const DEFAULT_AVATAR = "/images/avatars/avatar1.png";

    const form = document.getElementById("form-profil2");
    const avatarActuel = document.getElementById("avatar-actuel");
    const galerie = document.getElementById("galerie-avatars");
    if (!form || !avatarActuel || !galerie) return;


    function notify(title, text, type = "success") {
        if (typeof getNotification === "function") {
            getNotification(title, text, type);
        } else {
            console.warn("getNotification n'est pas défini : vérifie /js/notification.js");
            alert(`${title} : ${text}`);
        }
    }

    function isValidEmail(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email) && email.length >= 6 && email.length <= 64;
    }


    const options = [...galerie.querySelectorAll(".avatar-option")];
    let avatarChoisi = avatarActuel.getAttribute("src") || DEFAULT_AVATAR;

    avatarActuel.src = avatarChoisi;
    options
        .find((o) => o.dataset.avatar === avatarChoisi)
        ?.classList.add("selectionne");

    options.forEach((bouton) => {
        bouton.addEventListener("click", () => {
            avatarChoisi = bouton.dataset.avatar;
            avatarActuel.src = avatarChoisi;
            options.forEach((o) => o.classList.remove("selectionne"));
            bouton.classList.add("selectionne");
        });
    });


    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    const rules = [
        [name, () => name.value.trim().length >= 3 && name.value.trim().length <= 30,
            "The nickname must be between 3 and 30 characters."],
        [email, () => isValidEmail(email.value.trim()),
            "Please enter a valid e-mail address."],
        [password, () => password.value.length >= 8,
            "The password must contain at least 8 characters."],
    ];

    form.addEventListener("submit", (event) => {
        for (const [field, isOk, text] of rules) {
            if (!field || isOk()) continue;

            event.preventDefault();
            notify("Register", text, "error");
            field.focus();
            return;
        }

        let inputAvatar = form.querySelector('input[name="avatar"]');
        if (!inputAvatar) {
            inputAvatar = document.createElement("input");
            inputAvatar.type = "hidden";
            inputAvatar.name = "avatar";
            form.appendChild(inputAvatar);
        }
        inputAvatar.value = avatarChoisi;
    });
})();