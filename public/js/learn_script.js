const BY_PAGE = 12;   // number of dishes loaded each time

const catalogue = document.getElementById("catalogue");
const research = document.getElementById("research");
const counter = document.getElementById("counter");
const seeMore = document.getElementById("see-more");
const IS_ADMIN = catalogue.dataset.admin === "true";

let offset = 0;          // number of dishes already displayed
let total = 0;           // number of dishes matching the search
let currentSearch = "";
let requestId = 0;       // ignores outdated responses

// creates a dish element from the product data
function DishCreate(product) {
    const dish = document.createElement("article");
    dish.classList.add("plat");

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.nom;
    image.loading = "lazy";

    const corps = document.createElement("div");
    corps.classList.add("plat-body");

    const name = document.createElement("h3");
    name.textContent = product.nom;

    const restaurant = document.createElement("p");
    restaurant.classList.add("plat-resto");
    restaurant.textContent = product.nom_restaurant;
    restaurant.style.color="var(--green-grab)";

    corps.append(name, restaurant);

    // only admins can edit a dish
    if (IS_ADMIN) {
        const bouton = document.createElement("button");
        bouton.type = "button";
        bouton.classList.add("modify-dish");
        bouton.textContent = "Modify dish";
        bouton.addEventListener("click", (e) => {
            e.stopPropagation();
            openEditPopup(product, dish);
        });
        corps.append(bouton);
    }
    dish.append(image, corps);
    dish.addEventListener("click", () => openPopup(product));
    return dish;
}

const empty = document.createElement("p");
empty.id = "none-result";
empty.textContent = "No dishes found";

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
        data.produits.forEach(produit => catalogue.appendChild(DishCreate(produit)));

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

let timer;
research.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        currentSearch = research.value.trim();
        loadPage(true);
    }, 300);
});

seeMore.addEventListener("click", () => loadPage(false));

loadPage(true);

function openPopup(product) {
    const overlay = document.createElement("div");
    const popup = document.createElement("div");
    const image = document.createElement("img");
    const title = document.createElement("h2");
    const restaurant = document.createElement("p");
    const description = document.createElement("p");
    const closeButton = document.createElement("button");

    image.src = product.image;
    image.alt = product.nom;
    title.textContent = product.nom;
    restaurant.textContent = product.nom_restaurant;
    restaurant.style.color="var(--green-grab)";
    description.textContent = product.description || "No description available.";
    closeButton.textContent = "Close";

    closeButton.classList.add("next-class");
    closeButton.id="new4";
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


function openEditPopup(product, dish) {
    const overlay = document.createElement("div");
    const popup = document.createElement("form");
    overlay.classList.add("popup-overlay");
    popup.classList.add("popup", "edit-form");
    popup.noValidate = true;

    const title = document.createElement("h2");
    title.textContent = "Modify dish";
    const preview = document.createElement("img");
    preview.src = product.image;
    preview.alt = product.nom;
    const imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.name = "image";
    imageInput.accept = "image/jpeg,image/png,image/webp";
    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        if (file) preview.src = URL.createObjectURL(file);
    });

    // creates a label + field pair
    function field(labelText, element) {
        const label = document.createElement("label");
        label.textContent = labelText;
        label.append(element);
        return label;
    }

    const nameInput = document.createElement("input");
    nameInput.name = "nom";
    nameInput.maxLength = 255;
    nameInput.value = product.nom;

    const restaurantInput = document.createElement("input");
    restaurantInput.name = "nom_restaurant";
    restaurantInput.maxLength = 255;
    restaurantInput.value = product.nom_restaurant;

    const priceInput = document.createElement("input");
    priceInput.name = "prix";
    priceInput.type = "number";
    priceInput.min = "0.01";
    priceInput.step = "0.01";
    priceInput.value = product.prix;

    const descriptionInput = document.createElement("textarea");
    descriptionInput.name = "description";
    descriptionInput.rows = 4;
    descriptionInput.value = product.description || "";

    const errorMessage = document.createElement("p");
    errorMessage.classList.add("edit-error");

    const buttons = document.createElement("div");
    buttons.classList.add("edit-buttons");
    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.classList.add("next-class");
    cancelButton.textContent = "Cancel";
    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.classList.add("next-class");
    saveButton.textContent = "Save";
    buttons.append(cancelButton, saveButton);

    popup.append(
        title,
        preview,
        field("Image", imageInput),
        field("Dish name", nameInput),
        field("Restaurant", restaurantInput),
        field("Price", priceInput),
        field("Description", descriptionInput),
        errorMessage,
        buttons
    );
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    nameInput.focus();

    function close() {
        overlay.remove();
        document.removeEventListener("keydown", onKey);
    }
    function onKey(e) {
        if (e.key === "Escape") close();
    }
    cancelButton.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
    });
    document.addEventListener("keydown", onKey);

    popup.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorMessage.textContent = "";

        if (!nameInput.value.trim() || !restaurantInput.value.trim()) {
            errorMessage.textContent = "Dish name and restaurant name are required.";
            return;
        }
        if (!(Number(priceInput.value) > 0)) {
            errorMessage.textContent = "Price must be a positive number.";
            return;
        }

        saveButton.disabled = true;
        try {
            // FormData sends the text fields and the image (if one was chosen)
            const response = await fetch("/admin/dishes/" + product.id, {
                method: "PATCH",
                body: new FormData(popup)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Error " + response.status);

            dish.replaceWith(DishCreate(data.produit));   // refreshes the card
            close();
        } catch (err) {
            errorMessage.textContent = err.message;
            saveButton.disabled = false;
        }
    });
}
