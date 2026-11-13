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

function createMenuIcon(src) {
    const img = document.createElement("img");
    img.src = src;
    img.className = "nav-svg";
    img.alt = "";            
    return img;
}

function toggleNav() {
    if (document.getElementById("nav-menu")) {
        closeNav();
        return;
    }

    const aside = document.createElement("aside");
    aside.id = "nav-menu";

    const mediaQuery= window.matchMedia("(max-width: 480px)");
    if(mediaQuery.matches){
        document.querySelectorAll("#nav-container a").forEach((link) => {
            const copy = link.cloneNode(true);
            copy.classList.remove("active");
            copy.classList.add("mobile-only");
            aside.append(copy);
        });
    }

    const settingsLink = document.createElement("a");
    settingsLink.href = "/dashboard/profil";
    settingsLink.append(createMenuIcon("/images/nav/settings-svgrepo-com.svg"), "Settings");

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/logout";

    const logOutButton = document.createElement("button");
    logOutButton.type = "submit";
    logOutButton.className = "LogOut";
    logOutButton.append(createMenuIcon("/images/nav/exit-svgrepo-com.svg"), "Log Out");
    form.appendChild(logOutButton);

    aside.append(settingsLink, form);
    document.body.appendChild(aside);
    document.addEventListener("click", closeOnOutsideClick);

    document.addEventListener("keydown", function onEsc(e) {
    if (e.key !== "Escape") return;
    closeNav();
    document.removeEventListener("keydown", onEsc);
    });
}

backgroundColorNava();