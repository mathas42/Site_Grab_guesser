
//variable utilisé
let produits = [];
let produit;
let score = 0;
let round = 1;
let hint_count = 2;
let temp_count = 2;
let barre;
//recupère le json qui contient les produits et leurs informations
fetch("/api/produits")
    .then(response => response.json())
    .then(data => {
        produits = data;

        //page du jeu
        if (window.location.pathname === "/jeu") {
            begin();
        }

        //page finale
        if (window.location.pathname === "/resultat") {
            let scoreFinal = Number(localStorage.getItem("score")) || 0;

            document.getElementById("score").textContent =
                Math.round(scoreFinal * 100) / 100;
        }
    });

    //fonction qui s'effectue au lancement du jeu et qui initialise les variables globales
function new_() {
    localStorage.setItem("score", 0);
    localStorage.setItem("round", 1);
    localStorage.setItem("hint_count", 2);
    localStorage.setItem("temp_count", 2);
    localStorage.setItem("produitsUtilises", JSON.stringify([]));
    sessionStorage.setItem("next", "true");
    window.location.href = "/jeu";
    barre.disabled = false;
}

//fonction qui s'effectue au début de chaque page
function begin() {

    //anti-cheat, empeche de recharger la page en cours de jeu
let navigationDepuisNext = sessionStorage.getItem("next");
    if (navigationDepuisNext === "true") {
        // Navigation normale avec Next
        sessionStorage.removeItem("next");
    } else {
        // La page a été rechargée directement
        localStorage.clear();
        window.location.href = "/";
        return;
    }


//initialise les valeurs dans des variables pour les modifier
score = Number(localStorage.getItem("score")) || 0;
round = Number(localStorage.getItem("round")) || 1;
hint_count = Number(localStorage.getItem("hint_count"));
temp_count = Number(localStorage.getItem("temp_count"));

// supprime le bouton hint si plus d'indice sinon décremente le compteur sur le bouton
  if (hint_count <= 0){ document.getElementById("hint").remove(); } else {
document.getElementById("hint").textContent = "More or Less : " + hint_count;}

  if (temp_count <= 0){ document.getElementById("temperature").remove(); } else {
document.getElementById("temperature").textContent = "Temperature : " + temp_count;}

//affiche la manche à l'utilisateur
document.getElementById("round").textContent =  round + " / 5";

//affiche le score 
document.getElementById("score").textContent = Math.round(score * 100) / 100;

//tout ça, ça permet de pas retomber sur le même produit 2 fois pendant le jeu (vérifie que l'index est pas déjà dans la liste)
let produitsUtilises = JSON.parse(localStorage.getItem("produitsUtilises")) || [];
let indexProduit;
if (produitsUtilises.length < produits.length) {
    do {
        indexProduit = Math.floor(Math.random() * produits.length);
    } while (produitsUtilises.includes(indexProduit));
    produitsUtilises.push(indexProduit);
    localStorage.setItem(
        "produitsUtilises",
        JSON.stringify(produitsUtilises)
    );
}
produit = produits[indexProduit];


//affiche les informations du produit sur la page pour le joueur
document.getElementById("liste-produits").innerHTML = `
    <div class="produit">
        <img src="${produit.image}">
        <h2>${produit.nom}</h2>
        <h3>${produit.nom_restaurant}</h3>
    </div>
`;

//récupére les informations de la barre de guess du joueur
barre = document.getElementById("reponse");
value = document.getElementById("value");
barre.addEventListener("input", function() {
    value.textContent =Number(barre.value).toFixed(2)+" RM " + Number(barre.value/4.65).toFixed(2)+" Euro";
})}

//se déclenche quand le joueur valide son choix
function valider() {

    // récupère la réponse du joueur
    let reponse_joueur = Number(
        document.getElementById("reponse").value
    );

    // demande au serveur de vérifier la réponse
    fetch("/api/verifier", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: produit.id,
            reponse: reponse_joueur
        })
    })
    .then(response => response.json())
    .then(data => {

        // récupère les résultats envoyés par le serveur
        let points = data.points;
        let prix = data.prix;
        let ecart = data.ecart;

        // incrémente le score et les manches
        score += points;
        round += 1;

        // sauvegarde
        localStorage.setItem("score", score);
        localStorage.setItem("round", round);

        // actualise le score
        document.getElementById("score").textContent =
            Math.round(score * 100) / 100;

        // supprime les boutons
        document.getElementById("valider").remove();

        //suprime les boutons à l'affichage de la réponse
        if (hint_count > 0) {
            document.getElementById("hint").remove();
        }

        if (temp_count > 0) {
            document.getElementById("temperature").remove();
        }

        // enlève les indices
        document.querySelector(".hint1").remove();
        document.querySelector(".hint2").remove();

        // empêche de modifier la réponse
        barre.disabled = true;

        // bouton suivant
        let bouton = document.createElement("button");
        bouton.textContent = "Suivant";

        bouton.onclick = function () {
            next();
        };

        document.querySelector(".suivant").appendChild(bouton);

        // affiche la bonne réponse
        let annonce22 = document.createElement("p");
        annonce22.textContent = "La bonne réponse :";

        document.querySelector(".annonce22").appendChild(annonce22);

        // barre indiquant le vrai prix
        let barre2 = document.createElement("input");

        barre2.id = "barre";
        barre2.type = "range";
        barre2.min = 0;
        barre2.max = 40;
        barre2.value = prix;
        barre2.disabled = true;

        document.querySelector(".annonce2").appendChild(barre2);

        // prix
        let annonce2 = document.createElement("p");

        annonce2.textContent =
            prix + " RM " +
            Number(prix / 4.65).toFixed(2) +
            " Euro";

        document.querySelector(".annonce2").appendChild(annonce2);

        // écart
        let annonce3 = document.createElement("p");

        annonce3.textContent =
            "écart : " + ecart + "%";

        document.querySelector(".annonce3").appendChild(annonce3);

        // points
        let annonce4 = document.createElement("p");

        annonce4.textContent =
            Math.round(points * 100) / 100 +
            " points gagné sur 4";

        document.querySelector(".annonce4").appendChild(annonce4);
    });
}

//quand hint est cliqué
function hint() {

    // récupère la réponse du joueur
    let reponse_joueur = Number(document.getElementById("reponse").value);

    fetch("/api/hint", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: produit.id,
            reponse: reponse_joueur
        })
    })
    .then(response => response.json())
    .then(data => {

        // vide l'ancien indice
        document.querySelector(".hint1").innerHTML = "";

        // crée l'indice
        let hint = document.createElement("p");
        hint.textContent = data.message;

        // couleur
        if (data.message.startsWith("more")) {
            hint.style.color = "red";
        }
        else if (data.message.startsWith("less")) {
            hint.style.color = "blue";
        }
        else {
            hint.style.color = "green";
        }

        document.querySelector(".hint1").appendChild(hint);

        // décremente le nombre d'indices
        hint_count -= 1;
        localStorage.setItem("hint_count", hint_count);

        // supprime le bouton si plus d'indice
        if (hint_count <= 0) {
            document.getElementById("hint").remove();
        }
        else {
            document.getElementById("hint").textContent =
                "More or Less : " + hint_count;
        }
    });
}

//quand temperature est cliqué
function temperature() {

    // récupère la réponse du joueur
    let reponse_joueur = Number(document.getElementById("reponse").value);

    fetch("/api/temperature", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: produit.id,
            reponse: reponse_joueur
        })
    })
    .then(response => response.json())
    .then(data => {

        // vide l'ancien indice
        document.querySelector(".hint2").innerHTML = "";

        // crée l'indice
        let temp = document.createElement("p");

        temp.textContent = data.message;
        temp.style.color = data.couleur;

        document.querySelector(".hint2").appendChild(temp);

        // décremente le nombre d'indices
        temp_count -= 1;
        localStorage.setItem("temp_count", temp_count);

        // supprime le bouton si plus d'indice
        if (temp_count <= 0) {
            document.getElementById("temperature").remove();
        }
        else {
            document.getElementById("temperature").textContent =
                "Temperature : " + temp_count;
        }
    });
}

//bouton qui recharge la page si le jeu n'est pas terminé sinon va sur résultat
function next() {

    // indique que le changement de page vient du bouton Next
    sessionStorage.setItem("next", "true");

        if (round > 5) {
        window.location.href = "/resultat";
    } else {
        window.location.href = "/jeu";
    }


}
