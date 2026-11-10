const BY_PAGE = 12;   // number of dishes loaded each time

const catalogue = document.getElementById("catalogue");
const research = document.getElementById("research");
const counter = document.getElementById("counter");
const seeMore = document.getElementById("see-more");

let offset = 0;          // number of dishes already displayed
let total = 0;           // number of dishes matching the search
let currentSearch = "";
let requestId = 0;       // ignores outdated responses

// creates a dish element from the product data
function creerPlat(produit) {
    const plat = document.createElement("article");
    plat.classList.add("plat");

    const image = document.createElement("img");
    image.src = produit.image;
    image.alt = produit.nom;
    image.loading = "lazy";

    const corps = document.createElement("div");
    corps.classList.add("plat-body");

    const nom = document.createElement("h3");
    nom.textContent = produit.nom;

    const restaurant = document.createElement("p");
    restaurant.classList.add("plat-resto");
    restaurant.textContent = produit.nom_restaurant;

    corps.append(nom, restaurant);
    plat.append(image, corps);

    plat.addEventListener("click", () => openPopup(produit));

    return plat;
}

// message displayed when no dishes match the search
const empty = document.createElement("p");
empty.id = "aucun-resultat";
empty.textContent = "No dishes found";

// loads one page of dishes from the server
// reset = true : new search, we start again from the first dish
async function loadPage(reset = false) {
    const start = reset ? 0 : offset;
    const id = ++requestId;
    seeMore.disabled = true;

    try {
        const params = new URLSearchParams({
            limit: BY_PAGE,
            offset: start,
            search: currentSearch
        });
        const response = await fetch("/api/catalogue?" + params);
        if (!response.ok) throw new Error("Error " + response.status);
        const data = await response.json();

        if (id !== requestId) return;   // a newer request has started

        if (reset) catalogue.replaceChildren();
        data.produits.forEach(produit => catalogue.appendChild(creerPlat(produit)));

        offset = start + data.produits.length;
        total = data.total;

        if (total === 0) catalogue.replaceChildren(empty);
        counter.textContent = offset + " / " + total + " dishes displayed";
        seeMore.hidden = offset >= total;
    } catch (err) {
        if (id !== requestId) return;
        console.error("Error :", err);
        catalogue.textContent = "Unable to load the dishes";
        counter.textContent = "";
        seeMore.hidden = true;
    } finally {
        if (id === requestId) seeMore.disabled = false;
    }
}

// a new search starts again from the first page (after a short pause in typing)
let timer;
research.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        currentSearch = research.value.trim();
        loadPage(true);
    }, 300);
});

// the next 12 dishes are loaded when "See more" is clicked
seeMore.addEventListener("click", () => loadPage(false));

// first 12 dishes
loadPage(true);

// opens a popup with the details of a dish
function openPopup(produit) {
    const overlay = document.createElement("div");
    const popup = document.createElement("div");
    const image = document.createElement("img");
    const title = document.createElement("h2");
    const restaurant = document.createElement("p");
    const description = document.createElement("p");
    const closeButton = document.createElement("button");

    image.src = produit.image;
    image.alt = produit.nom;
    title.textContent = produit.nom;
    restaurant.textContent = produit.nom_restaurant;
    description.textContent = produit.description || "No description available.";
    closeButton.textContent = "Close";

    closeButton.classList.add("popup-close");
    overlay.classList.add("popup-overlay");
    popup.classList.add("popup");
    restaurant.classList.add("plat-resto");

    popup.append(image, title, restaurant, description, closeButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    function close() {
        overlay.remove();
        document.removeEventListener("keydown", onKey);
    }

    function onKey(e) {
        if (e.key === "Escape") {
            close();
        }
    }
    closeButton.addEventListener("click", close);

    // clicking outside the popup closes it
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            close();
        }
    });

    document.addEventListener("keydown", onKey);
}
