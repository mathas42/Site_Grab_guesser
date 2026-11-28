const NAV_ICONS = {
    play:            "/images/nav/game-svgrepo-com.svg",
    "/dashboard":    "/images/nav/home-svgrepo-com.svg",
    "/learn":        "/images/nav/learn-svgrepo-com.svg",
    "/Hall_of_Fame": "/images/nav/trophy-svgrepo-com.svg",
    "/admin":        "/images/nav/admin-svgrepo-com.svg",
    settings:        "/images/nav/settings-svgrepo-com.svg",
    logout:          "/images/nav/exit-svgrepo-com.svg",
};


function backgroundColorNava() {
    document.querySelectorAll("nav a").forEach((link) => {
        const href = link.getAttribute("href");
        const isCurrent = href && href !== "#" && link.pathname === window.location.pathname;

        link.classList.toggle("active", isCurrent);
        if (isCurrent) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
}


function addMenuIcon(element, src) {
    if (!src || element.querySelector(".menu-icon")) return;

    const icon = document.createElement("span");
    icon.className = "menu-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.style.setProperty("--icon", `url("${src}")`);
    element.prepend(icon);
    const probe = new Image();
    probe.onerror = () => {
        console.warn("Icône introuvable :", src);
        icon.remove();
    };
    probe.src = src;
}

function setMenuExpanded(expanded) {
    document.getElementById("nav-hamburger")?.setAttribute("aria-expanded", String(expanded));
}

function closeNav() {
    document.getElementById("nav-menu")?.remove();
    document.removeEventListener("click", closeOnOutsideClick);
    document.removeEventListener("keydown", closeOnEscape);
    setMenuExpanded(false);
}

function closeOnOutsideClick(event) {
    if (event.target.closest("#nav-menu") || event.target.closest("#nav-hamburger")) return;
    closeNav();
}

function closeOnEscape(event) {
    if (event.key === "Escape") closeNav();
}

function addMobileLinks(aside) {
    const links = [...document.querySelectorAll("#nav-container a")].map((link) => {
        const copy = link.cloneNode(true);
        copy.classList.remove("active");
        copy.classList.add("mobile-only");
        addMenuIcon(copy, NAV_ICONS[copy.pathname]);
        return copy;
    });

    const play = document.createElement("button");
    play.type = "button";
    play.className = "mobile-only LogOut";
    play.textContent = "Play";
    addMenuIcon(play, NAV_ICONS.play);
    play.addEventListener("click", () => {
        closeNav();
        if (typeof new_play === "function") new_play();
    });

    links.splice(1, 0, play);
    aside.append(...links);
}

function toggleNav() {
    if (document.getElementById("nav-menu")) {
        closeNav();
        return;
    }
    const aside = document.createElement("aside");
    aside.id = "nav-menu";
    if (window.matchMedia("(max-width: 480px)").matches) {
        addMobileLinks(aside);
    }

    const settingsLink = document.createElement("a");
    settingsLink.href = "/dashboard/profil";
    settingsLink.append("Settings");
    addMenuIcon(settingsLink, NAV_ICONS.settings);

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/logout";

    const logOutButton = document.createElement("button");
    logOutButton.type = "submit";
    logOutButton.className = "LogOut";
    logOutButton.append("Log Out");
    addMenuIcon(logOutButton, NAV_ICONS.logout);
    form.append(logOutButton);
    aside.append(settingsLink, form);
    document.body.append(aside);
    document.addEventListener("click", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    setMenuExpanded(true);
}

backgroundColorNava();