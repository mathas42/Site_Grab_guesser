
fetch("/api/produits")
    .then(response => response.json())
    .then(data => {
        produits = data;

        const catalogue = document.getElementById("catalogue");
        catalogue.innerHTML = "";

        data.forEach(produit => {
            const plat = document.createElement("div");

            const nom = document.createElement("h3");
            nom.textContent = produit.nom;

            const restaurant = document.createElement("p");
            restaurant.textContent = produit.nom_restaurant;

            const description = document.createElement("p");
            description.textContent = produit.description || "Aucune description disponible.";

            plat.append(nom, restaurant, description);
            catalogue.appendChild(plat);
        });
    })
    .catch(err => console.error("Erreur :", err));
