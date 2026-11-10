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

function closeNav() {
    const menu = document.getElementById("nav-menu");
    if (menu) menu.remove();
    document.removeEventListener("click", closeOnOutsideClick);
}

function closeOnOutsideClick(event) {
    if (event.target.closest("#nav-menu") || event.target.closest("#nav-hamburger")) return;
    closeNav();
}

function toggleNav() {
    if (document.getElementById("nav-menu")) {
        closeNav();
        return;
    }
    const aside = document.createElement("aside");
    aside.id = "nav-menu";

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

    aside.append(settingsLink, form);
    document.body.appendChild(aside);
    document.addEventListener("click", closeOnOutsideClick);
}

backgroundColorNava();