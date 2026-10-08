// variables utilisées
let produits = [];
let produit;
let barre;


// récupère le JSON qui contient les produits et leurs informations
fetch("/api/produits")
    .then(response => response.json())
    .then(data => {

        produits = data;

        // page du jeu
        if (window.location.pathname === "/jeu") {
            begin();
        }

        // page finale
        if (window.location.pathname === "/resultat") {

            let partieId = localStorage.getItem("partieId");

            fetch("/api/partie/" + partieId)
                .then(response => response.json())
                .then(data => {

                    // affiche le score final venant de la BDD
                    document.getElementById("score").textContent =
                        Math.round(Number(data.score) * 100) / 100;
                });
        }
    });


// fonction qui s'effectue lorsque le joueur clique sur Play
// elle crée une nouvelle partie dans la BDD
function new_() {

    fetch("/api/new-game", {
        method: "POST"
    })
    .then(response => {

        if (!response.ok) {
            throw new Error(
                "Erreur /api/new-game : " + response.status
            );
        }

        return response.json();
    })
    .then(data => {

        console.log("Nouvelle partie :", data);

        // sauvegarde l'identifiant de la partie
        localStorage.setItem("partieId", data.partieId);

        // recommence la liste des produits utilisés
        localStorage.setItem(
            "produitsUtilises",
            JSON.stringify([])
        );

        // indique que l'arrivée sur /jeu vient du bouton suivant/Play
        sessionStorage.setItem("next", "true");

        // va sur la page du jeu
        window.location.href = "/jeu";
    })
    .catch(error => {
        console.error(error);
    });
}


// fonction qui s'effectue au début de chaque page du jeu
function begin() {

    // vérifie si on arrive sur cette page depuis le bouton "Suivant"
    let navigationDepuisNext =sessionStorage.getItem("next");

    if (navigationDepuisNext === "true") {
        // supprime l'indication pour éviter
        // qu'un simple rechargement soit considéré comme "Suivant"
        sessionStorage.removeItem("next");
    }
    else {

        // si le joueur recharge directement la page,
        // on considère que la partie doit être abandonnée
        localStorage.clear();
        window.location.href = "/";

        return;
    }


    // récupère l'identifiant de la partie
    const partieId =localStorage.getItem("partieId");

    if (!partieId) {
        // aucune partie trouvée
        window.location.href = "/";
        return;
    }


    // récupère les informations de la partie depuis la BDD
    fetch("/api/partie/" + partieId)
        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Erreur /api/partie/" +partieId +" : " +response.status
                );
            }

            return response.json();
        })
        .then(data => {

            // affiche le score venant de la BDD
            document.getElementById("score").textContent =Math.round(Number(data.score) * 100) / 100;


            // affiche le numéro de la manche
            document.getElementById("round").textContent =data.round + " / 5";


            // affiche le nombre d'indices More or Less
            if (data.hint_count <= 0) {
                let boutonHint =
                    document.getElementById("hint");
                if (boutonHint) {
                    boutonHint.remove();
                }

            }
            else {
                document.getElementById("hint").textContent =
                    "More or Less : " +
                    data.hint_count;
            }


            // affiche le nombre d'indices Temperature
            if (data.temp_count <= 0) {

                let boutonTemperature =document.getElementById("temperature");

                if (boutonTemperature) {
                    boutonTemperature.remove();
                }

            }
            else {

                document.getElementById("temperature").textContent ="Temperature : " +data.temp_count;
            }


            // récupère les produits déjà utilisés
            let produitsUtilises =
                JSON.parse(localStorage.getItem("produitsUtilises")) || [];


            // choisit un produit aléatoire
            // qui n'a pas encore été utilisé
            let indexProduit;
            do {

                indexProduit =
                    Math.floor(Math.random() * produits.length);

            }
            while (
                produitsUtilises.includes(indexProduit)
            );


            // ajoute le produit à la liste des produits utilisés
            produitsUtilises.push(indexProduit);

            localStorage.setItem("produitsUtilises",JSON.stringify(produitsUtilises)
            );


            // récupère le produit choisi
            produit = produits[indexProduit];


            // affiche le produit à l'écran
            document.getElementById("liste-produits").innerHTML = `

                <div class="produit">
                    <img src="${produit.image}">
                    <h2>${produit.nom}</h2>
                    <h3>${produit.nom_restaurant}</h3>

                </div>
            `;
            // récupère la barre de réponse
            barre =
                document.getElementById("reponse");

            // récupère le texte qui affiche la valeur
            let value =document.getElementById("value");

            // affiche la valeur de la barre
            // lorsque le joueur la déplace
            barre.addEventListener(
                "input",
                function() {

                    value.textContent =Number(barre.value).toFixed(2) + " RM " +Number(barre.value / 4.65).toFixed(2) +" Euro";
                }
            );
        })
        .catch(error => {
            console.error(error);
        });
}


// se déclenche quand le joueur valide son choix
function valider() {

    // récupère l'identifiant de la partie
    let partieId =localStorage.getItem("partieId");


    // récupère la réponse du joueur
    let reponse_joueur =
        Number(document.getElementById("reponse").value);

    // envoie la réponse au serveur
    fetch("/api/verifier", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({

            partieId: partieId,

            id: produit.id,

            reponse: reponse_joueur
        })
    })
    .then(response => response.json())
    .then(data => {
        // vérifie si le serveur a renvoyé une erreur
        if (data.erreur) {
            console.error(data.erreur);
            return;
        }

        // récupère les informations envoyées par le serveur
        let points = data.points;
        let prix = data.prix;
        let ecart = data.ecart;

        // le score vient maintenant de la BDD
        document.getElementById("score").textContent =Math.round(Number(data.score) * 100) / 100;

        if (data.round < 5){

        // le numéro de la manche vient de la BDD
        document.getElementById("round").textContent =data.round + " / 5";}

        // retire le bouton Valider
        document.getElementById("valider").remove();

        // retire le bouton More or Less
        let boutonHint =document.getElementById("hint");
        if (boutonHint) {
            boutonHint.remove();}

        // retire le bouton Temperature
        let boutonTemperature =document.getElementById("temperature");

        if (boutonTemperature) {boutonTemperature.remove();}

        // retire les anciens indices
        document.querySelector(".hint1").innerHTML = "";
        document.querySelector(".hint2").innerHTML = "";

        // désactive la barre de réponse
        barre.disabled = true;

        // crée le bouton Suivant
        let bouton =document.createElement("button");
        bouton.textContent = "Suivant";
        bouton.onclick = function() {
            next();
        };

        // ajoute le bouton à la page
        document.querySelector(".suivant").appendChild(bouton);

        // affiche "La bonne réponse"
        let annonce22 =document.createElement("p");

        annonce22.textContent ="La bonne réponse :";

        document.querySelector(".annonce22").appendChild(annonce22);

        // crée une deuxième barre
        // qui affiche la bonne réponse
        let barre2 =document.createElement("input");

        barre2.id = "barre";
        barre2.type = "range";
        barre2.min = 0;
        barre2.max = 40;
        barre2.value = prix;
        barre2.disabled = true;

        document.querySelector(".annonce2").appendChild(barre2);

        //réduire l'espace
        let div = document.getElementById("secret");
        div.style.height = "5px";
        let div2 = document.getElementById("secret2");
        div2.style.height = "5px";

        // affiche le prix
        let annonce2 =document.createElement("p");

        annonce2.textContent =prix +" RM " +Number(prix / 4.65).toFixed(2) +" Euro";

        document.querySelector(".annonce2").appendChild(annonce2);

        // affiche l'écart entre la réponse et le vrai prix
        let annonce3 =document.createElement("p");

        annonce3.textContent ="écart : " + ecart +" RM";

        document.querySelector(".annonce3").appendChild(annonce3);

        // affiche les points gagnés
        let annonce4 =document.createElement("p");

        annonce4.textContent =Math.round(points * 100) / 100 +" points gagné sur 4";

        document.querySelector(".annonce4").appendChild(annonce4);
    });
}


// quand le bouton More or Less est cliqué
function hint() {

    // récupère l'identifiant de la partie
    let partieId =localStorage.getItem("partieId");


    // récupère la réponse actuelle du joueur
    let reponse_joueur =Number(document.getElementById("reponse").value);


    // envoie la demande au serveur
    fetch("/api/hint", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
            partieId: partieId,
            id: produit.id,
            reponse: reponse_joueur
        })
    })
    .then(response => response.json())
    .then(data => {
        // affiche une erreur si le serveur en renvoie une
        if (data.erreur) {
            console.error(data.erreur);
            return;
        }

        // vide l'ancien indice
        document.querySelector(".hint1").innerHTML = "";

        // crée le texte de l'indice
        let hint =document.createElement("p");

        hint.textContent =data.message;

        // change la couleur selon la réponse
        if (data.message.startsWith("more")) {hint.style.color = "red";}
        else if (data.message.startsWith("less")) {hint.style.color = "blue";}
        else {hint.style.color = "green";}

        // affiche l'indice
        document.querySelector(".hint1")
            .appendChild(hint);

        // met à jour le nombre d'indices avec la valeur venant de la BDD
        if (data.hint_count <= 0) {

            let boutonHint =document.getElementById("hint");

            if (boutonHint) {boutonHint.remove();}
        }
        else {
            document.getElementById("hint").textContent ="More or Less : " +data.hint_count;
        }
        let div = document.getElementById("secret");
        div.style.height = "35px";
    });
}

// quand le bouton Temperature est cliqué
function temperature() {

    // récupère l'identifiant de la partie
    let partieId =localStorage.getItem("partieId");

    // récupère la réponse actuelle du joueur
    let reponse_joueur =
        Number(document.getElementById("reponse").value);

    // envoie la demande au serveur
    fetch("/api/temperature", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            partieId: partieId,
            id: produit.id,
            reponse: reponse_joueur
        })
    })
    .then(response => response.json())
    .then(data => {

        // affiche une erreur si le serveur en renvoie une
        if (data.erreur) {
            console.error(data.erreur);
            return;
        }

        // vide l'ancien indice
        document.querySelector(".hint2").innerHTML = "";

        // crée le texte de l'indice
        let temp =document.createElement("p");

        temp.textContent = data.message;

        // applique la couleur envoyée par le serveur
        temp.style.color =data.couleur;

        // affiche l'indice
        document.querySelector(".hint2").appendChild(temp);

        // met à jour le nombre d'indices
        // avec la valeur venant de la BDD
        if (data.temp_count <= 0) {
            let boutonTemperature =
                document.getElementById(
                    "temperature"
                );

            if (boutonTemperature) {boutonTemperature.remove();}

        }
        else {
            document.getElementById("temperature").textContent ="Temperature : " +data.temp_count;

        }
        let div2 = document.getElementById("secret2");
        div2.style.height = "35px";
    });
}

function modify(nombre) {
    let barre = document.getElementById("reponse");

    let valeur = Number(barre.value) + nombre;

    valeur = Math.max(0, Math.min(40, valeur));

    barre.value = valeur.toFixed(2);

    document.getElementById("value").textContent = Number(valeur).toFixed(2) + " RM " +Number(valeur / 4.65).toFixed(2) +" Euro";
}

// bouton qui recharge la page si le jeu n'est pas terminé
// sinon va sur la page résultat
function next() {

    // indique que le changement de page
    // vient du bouton Suivant
    sessionStorage.setItem("next", "true");

    // récupère l'identifiant de la partie
    let partieId =localStorage.getItem("partieId");

    // récupère les informations de la partie
    fetch("/api/partie/" + partieId)
        .then(response => response.json())
        .then(data => {
            // si les 5 manches sont terminées
            // on va sur la page résultat
            if (data.round > 5) {window.location.href ="/resultat";}

            // sinon on recommence une manche
            else {
                window.location.href ="/jeu";
            }
        });
}