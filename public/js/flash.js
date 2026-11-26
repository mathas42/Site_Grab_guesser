(() => {
    const params = new URLSearchParams(location.search);
    const registered = params.get("registered");
    const login = params.get("login");
    const error = params.get("error");
    if (!registered && !login && !error) return;

    const page = location.pathname.startsWith("/register") ? "Register" : "Login";

    const ERRORS = {
        invalid:  "Email or password incorrect.",
        email:    "This e-mail is already used.",
        nickname: "This nickname is already taken.",
        server:   "Something went wrong. Please try again.",
    };

    function show(title, text, type) {
        if (typeof getNotification === "function") {
            getNotification(title, text, type);
        } else {
            console.warn("getNotification n'est pas défini : vérifie /js/notification.js");
            alert(`${title} : ${text}`);
        }
    }

    if (registered === "1") {
        show("Register", "Your account has been created. You can log in!", "success");
    }
    if (login === "1") {
        const nickname = document.getElementById("user-name")?.textContent.trim();
        show("Login", nickname ? `Welcome back, ${nickname}!` : "Welcome back!", "success");
    }
    if (error) {
        show(page, ERRORS[error] || ERRORS.server, "error");
    }

    history.replaceState(null, "", location.pathname);
})();