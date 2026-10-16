
fetch("/api/produits")
    .then(response => response.json())
    .then(data => {
        produits = data;

        const recherche = document.getElementById("recherche");

        recherche.addEventListener("input", () => {
        const texte = recherche.value.toLowerCase();

        document.querySelectorAll(".plat").forEach(plat => {
        const nom = plat.dataset.nom.toLowerCase();
        const nom_restaurant = plat.dataset.nom_restaurant.toLowerCase();
        if (nom.includes(texte) || nom_restaurant.includes(texte)) {
            plat.style.display = "flex";
        } else {
            plat.style.display = "none";
        }    });
        });


        const catalogue = document.getElementById("catalogue");
        catalogue.innerHTML = "";

        data.forEach(produit => {
            const plat = document.createElement("div");
            plat.style.display = "flex";
            plat.classList.add("plat");
            plat.dataset.nom = produit.nom;
            plat.dataset.nom_restaurant = produit.nom_restaurant;


            const image = document.createElement("img");
            image.src = produit.image;

            const nom = document.createElement("h3");
            nom.textContent = produit.nom;

            const restaurant = document.createElement("p");
            restaurant.textContent = produit.nom_restaurant;

            const description = document.createElement("p");
            description.textContent = produit.description || "Aucune description disponible.";

            plat.append(nom, image, restaurant, description);
            catalogue.appendChild(plat);
        });
    })
    .catch(err => console.error("Erreur :", err));
