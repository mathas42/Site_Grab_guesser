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
    document.querySelector("nav").classList.toggle("open");
}

backgroundColorNava();