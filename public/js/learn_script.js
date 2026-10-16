
fetch("/api/produits")
    .then(response => response.json())
    .then(data => {
        produits = data;

        const catalogue = document.getElementById("catalogue");
        catalogue.innerHTML = "";

        data.forEach(produit => {
            const plat = document.createElement("div");
            plat.style.display = "flex";
            plat.style.alignItems= "center";
            plat.style.justifyContent= "center";
            plat.style.width = "1000px";
            plat.style.padding = "10px";
            plat.style.border = "2px solid black";
            plat.style.borderRadius = "5px";
            plat.style.margin = "15px";
            plat.style.flexDirection = "column";

            plat.style.transition = "width 0.8s ease";


            plat.addEventListener("mouseenter", () => {
            plat.style.width = "1300px";
            });
            plat.addEventListener("mouseleave", () => {
            plat.style.width = "1000px";
            });
   
            const image = document.createElement("img");
            image.src = produit.image;
            image.style.height = "350px";
            image.style.witdh = "auto";

            const nom = document.createElement("h3");
            nom.textContent = produit.nom;

            const restaurant = document.createElement("p");
            restaurant.textContent = produit.nom_restaurant;

            const description = document.createElement("p");
            description.textContent = produit.description || "Aucune description disponible.";
            description.style.width = "1000px"

            plat.append(nom, image, restaurant, description);
            catalogue.appendChild(plat);
        });
    })
    .catch(err => console.error("Erreur :", err));
