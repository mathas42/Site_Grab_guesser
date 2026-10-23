const BY_PAGE = 12;   // maximum number of dishes displayed at once
let limit = BY_PAGE;

const catalogue = document.getElementById("catalogue");
const research = document.getElementById("research");
const counter = document.getElementById("counter");
const seeMore = document.getElementById("see-more");

// removes accents and uppercase letters : "Crème" -> "creme"
function normalize(texte) {
    return texte
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

// creates a dish element from the product data
function creerPlat(produit) {
    const plat = document.createElement("article");
    plat.classList.add("plat");
    plat.dataset.research = normalize(produit.nom + " " + produit.nom_restaurant);

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

    plat.addEventListener("click", () => {
        openPopup(produit);
    });

    return plat;
}

// message displayed when no dishes match the search
const empty = document.createElement("p");
empty.id = "aucun-resultat";
empty.textContent = "No dishes found ";
empty.hidden = true;

// function that updates the display of dishes based on the search input and limit
function update() {
    const text = normalize(research.value.trim());
    let found = 0;
    let displayed = 0;

    document.querySelectorAll(".plat").forEach(plat => {
        const correspond = plat.dataset.research.includes(text);
        if (correspond) {
            found++;
        }

        const visible = correspond && found <= limit;
        plat.hidden = !visible;
        if (visible) {
            displayed++;
        }
    });

    counter.textContent = displayed + " / " + found + " dishes displayed";
    seeMore.hidden = found <= limit;
    empty.hidden = found > 0;
}

// a new search resets the limit and updates the display
research.addEventListener("input", () => {
    limit = BY_PAGE;
    update();
});

// more dishes are displayed when the "See more" button is clicked
seeMore.addEventListener("click", () => {
    limit += BY_PAGE;
    update();
});

// retrieve the products from the server and display them
fetch("/api/produits")
    .then(response => {
        if (!response.ok) {
            throw new Error("Error " + response.status);
        }
        return response.json();
    })
    .then(produits => {
        catalogue.innerHTML = "";

        // sort the products by the first letter of their name, ignoring accents and case  
        produits.sort((a, b) => {
        const lettreA = a.nom.match(/\p{L}/u)?.[0] || "";
        const lettreB = b.nom.match(/\p{L}/u)?.[0] || "";

        return lettreA.localeCompare(lettreB, "fr", {
            sensitivity: "base"
        }) || a.nom.localeCompare(b.nom, "fr", {
            sensitivity: "base"
        });
        });

        produits.forEach(produit => {
            catalogue.appendChild(creerPlat(produit));
        });

        catalogue.appendChild(empty);
        update();   // initial display 
    })
    .catch(err => {
        console.error("Error :", err);
        catalogue.textContent = "Unable to load the dishes";
        counter.textContent = "";
    });
 

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
