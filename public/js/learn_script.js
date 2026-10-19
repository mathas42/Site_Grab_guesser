const PAR_PAGE = 12;   // nombre max de plats affichés à la fois
let limite = PAR_PAGE;

const catalogue = document.getElementById("catalogue");
const recherche = document.getElementById("recherche");
const compteur = document.getElementById("compteur");
const voirPlus = document.getElementById("voir-plus");

// enlève accents et majuscules : "Crème" -> "creme"
function normaliser(texte) {
    return texte
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

// crée la carte d'un plat
function creerPlat(produit) {
    const plat = document.createElement("article");
    plat.classList.add("plat");
    plat.dataset.recherche = normaliser(produit.nom + " " + produit.nom_restaurant);

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

    const description = document.createElement("p");
    description.classList.add("plat-desc");
    description.textContent = produit.description || "Aucune description disponible.";

    corps.append(nom, restaurant, description);
    plat.append(image, corps);

    return plat;
}

// message affiché quand la recherche ne donne rien
const vide = document.createElement("p");
vide.id = "aucun-resultat";
vide.textContent = "No dishes found 😕";
vide.hidden = true;

// filtre selon la recherche, puis n'affiche que les `limite` premiers
function mettreAJour() {
    const texte = normaliser(recherche.value.trim());
    let trouves = 0;
    let affiches = 0;

    document.querySelectorAll(".plat").forEach(plat => {
        const correspond = plat.dataset.recherche.includes(texte);
        if (correspond) {
            trouves++;
        }

        const visible = correspond && trouves <= limite;
        plat.hidden = !visible;
        if (visible) {
            affiches++;
        }
    });

    compteur.textContent = affiches + " / " + trouves + " dishes displayed";
    voirPlus.hidden = trouves <= limite;
    vide.hidden = trouves > 0;
}

// une nouvelle recherche repart de la limite de départ
recherche.addEventListener("input", () => {
    limite = PAR_PAGE;
    mettreAJour();
});

// "Voir plus" augmente la limite
voirPlus.addEventListener("click", () => {
    limite += PAR_PAGE;
    mettreAJour();
});

// récupère les plats depuis le serveur
fetch("/api/produits")
    .then(response => {
        if (!response.ok) {
            throw new Error("Erreur " + response.status);
        }
        return response.json();
    })
    .then(produits => {
        catalogue.innerHTML = "";

            // Trie les plats par ordre alphabétique
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

        catalogue.appendChild(vide);
        mettreAJour();   // affichage initial
    })
    .catch(err => {
        console.error("Erreur :", err);
        catalogue.textContent = "Unable to load the dishes";
        compteur.textContent = "";
    });