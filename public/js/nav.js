function backgroundColorNava() {
    const navLinks = document.querySelectorAll("nav a");
    const currentPage = window.location.pathname.toLowerCase().split("/").pop();

    navLinks.forEach((link) => {
        const linkPage = link.getAttribute("href").toLowerCase().split("/").pop();

        if (linkPage === currentPage && linkPage !== "#") {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        } else {
            link.classList.remove("active");
            link.removeAttribute("aria-current");
        }
    });
}

function toggleNav() {
    
    const existing = document.getElementById("nav-menu");
    if (existing) {
        existing.remove();
        return;
    }

    const aside = document.createElement("aside");
    aside.id = "nav-menu";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "x";
    closeButton.classList.add("button-close", "popup-close");
    closeButton.addEventListener("click", () => aside.remove());

    const settingsLink = document.createElement("a");
    settingsLink.href = "/profil";
    settingsLink.textContent = "Settings";

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/logout";

    const logOutButton = document.createElement("button");
    logOutButton.type = "submit";
    logOutButton.textContent = "Log Out";
    form.appendChild(logOutButton);

    aside.append(closeButton, settingsLink, form);
    document.body.appendChild(aside);
}

backgroundColorNava();