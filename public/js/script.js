// variables utilisées
let produits = [];
let produit;
let barre;
let son = new Audio("/sound/faaah.mp3");


// formate un prix sur une largeur fixe : 8 -> "08.00", 12.5 -> "12.50"
function formatPrix(valeur) {
    return Number(valeur).toFixed(2).padStart(5, "0");
}

// met à jour le texte affiché sous la barre de réponse
function afficherValeur(valeur) {
    document.getElementById("value").textContent =
        formatPrix(valeur) + " RM " +
        (Number(valeur) / 4.65).toFixed(2) + " Euro";
}


// récupère le JSON qui contient les produits et leurs informations
fetch("/api/produits")
    .then(response => response.json())
    .then(data => {

        produits = data;

        // game page
        if (window.location.pathname === "/jeu") {
            begin();
        }

        // page finale
        if (window.location.pathname === "/result") {

            let partieId = localStorage.getItem("partieId");

            fetch("/api/partie/" + partieId)
                .then(response => response.json())
                .then(data => {

                    // affiche le score final venant de la BDD
                    if(data.hard ==1){
                        document.getElementById("score").textContent =
                        Math.round(Number(data.score/1.4) * 100) / 100;
                    } else {
                    document.getElementById("score").textContent =
                        Math.round(Number(data.score) * 100) / 100;}
                });
        }
    });


function new_hard() {
    new_(1);
}

function new_play() {
    new_(0);
}

function new_(hard) {
    fetch("/api/new-game", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            hard: hard
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erreur /api/new-game : " + response.status);
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem("partieId", data.partieId);
        sessionStorage.removeItem("terminee");
        localStorage.setItem("produitsUtilises", JSON.stringify([]));

        //nettoie l'historique
        localStorage.removeItem("historique");
        sessionStorage.setItem("next", "true");

        // va sur la page du jeu
        window.location.href = "/jeu";
    })
    .catch(error => console.error(error));
}


// fonction qui s'effectue lorsque le joueur clique sur Learn
function new_learn_() {
    window.location.href = "/learn";
}


// fonction qui s'effectue au début de chaque page du jeu
function begin() {

    // Vérifie si la partie est terminée
    if (sessionStorage.getItem("terminee") === "true") {
        localStorage.clear();
        window.location.replace("/");
        return;
    }

    let navigationDepuisNext = sessionStorage.getItem("next");

    if (navigationDepuisNext === "true") {
        sessionStorage.removeItem("next");
    } else {
        localStorage.clear();
        window.location.replace("/");
        return;
    }

    const partieId = localStorage.getItem("partieId");

    if (!partieId) {
        window.location.replace("/");
        return;
    }


    // récupère les informations de la partie depuis la BDD
    fetch("/api/partie/" + partieId)
        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Erreur /api/partie/" + partieId + " : " + response.status
                );
            }

            return response.json();
        })
        .then(data => {

            // affiche le score venant de la BDD
            document.getElementById("score").textContent =
                Math.round(Number(data.score) * 100) / 100;

            if (data.hard == 1){
                let haut = document.getElementById("info");
                haut.style.backgroundColor = "purple";
            }

            // affiche le numéro de la manche
            if(data.hard == 1){
            document.getElementById("round").textContent = data.round + " / 7";
            } else {
            document.getElementById("round").textContent = data.round + " / 5";}


            // affiche le nombre d'indices More or Less
            if (data.hint_count <= 0) {
                let boutonHint = document.getElementById("hint");
                if (boutonHint) {
                    boutonHint.remove();
                }
            }
            else {
                document.getElementById("hint").textContent =
                    "More or Less : " + data.hint_count;
            }


            // affiche le nombre d'indices Temperature
            if (data.temp_count <= 0) {
                let boutonTemperature = document.getElementById("temperature");
                if (boutonTemperature) {
                    boutonTemperature.remove();
                }
            }
            else {
                document.getElementById("temperature").textContent =
                    "Temperature : " + data.temp_count;
            }

            if (data.temp_count <= 0 && data.hint_count <= 0){
                document.getElementById("sec")?.remove();
            }


            // récupère les produits déjà utilisés
            let produitsUtilises =
                JSON.parse(localStorage.getItem("produitsUtilises")) || [];


            // choisit un produit aléatoire
            // qui n'a pas encore été utilisé
            let indexProduit;
            do {
                indexProduit = Math.floor(Math.random() * produits.length);
            }
            while (produitsUtilises.includes(indexProduit));


            // ajoute le produit à la liste des produits utilisés
            produitsUtilises.push(indexProduit);

            localStorage.setItem(
                "produitsUtilises",
                JSON.stringify(produitsUtilises)
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
            barre = document.getElementById("reponse");

            // affiche la valeur de la barre lorsque le joueur la déplace
            barre.addEventListener("input", function() {
                afficherValeur(barre.value);
            });

            // affiche aussi la valeur de départ
            afficherValeur(barre.value);
        })
        .catch(error => {
            console.error(error);
        });
}


// se déclenche quand le joueur valide son choix
function valider() {

    // récupère l'identifiant de la partie
    let partieId = localStorage.getItem("partieId");


    // récupère la réponse du joueur
    let reponse_joueur = Number(document.getElementById("reponse").value);

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

        let historique = JSON.parse(localStorage.getItem("historique")) || [];

            historique.push({
                nom: produit.nom,
                image: produit.image,
                points:  Math.round(Number(points) * 100) / 100
                });

            localStorage.setItem("historique", JSON.stringify(historique));

        if (points<=0){
            son.play();
        }

        // le score vient maintenant de la BDD
        document.getElementById("score").textContent =
            Math.round(Number(data.score) * 100) / 100;

        // le numéro de la manche vient de la BDD
        if(data.hard == 1){
            if (data.round < 7) {
            document.getElementById("round").textContent = data.round + " / 5";
        }} else {
        if (data.round < 5) {
            document.getElementById("round").textContent = data.round + " / 5";
        }}

        // remove the Validate button
        document.getElementById("valider").remove();
        document.getElementById("plus").remove();
        document.getElementById("plusplus").remove();
        document.getElementById("moins").remove();
        document.getElementById("moinsmoins").remove();
        document.getElementById("moinsmoinsmoins").remove();
        document.getElementById("plusplusplus").remove();

        let DivSec = document.getElementById("sec");
        if (DivSec) {

        // remove the button More or Less
        let boutonHint = document.getElementById("hint");
        if (boutonHint) {
            boutonHint.remove();
        }

        // remove the button Temperature
        let boutonTemperature = document.getElementById("temperature");
        if (boutonTemperature) {
            boutonTemperature.remove();
        }

        // remove the old hints
        document.querySelector(".hint1").innerHTML = "";
        document.querySelector(".hint2").innerHTML = "";}

        // désactive la barre de réponse
        barre.style.pointerEvents = "none";
        barre.tabIndex = -1;

        // create a button to go to the next round
        let bouton = document.createElement("button");
        bouton.textContent = "Next";
        bouton.style.width = "90px";
        bouton.style.height = "30px";
        bouton.style.backgroundColor = "greenyellow";
        bouton.addEventListener("mouseenter", () => {
        bouton.style.backgroundColor = "yellow";
        });
        bouton.addEventListener("mouseleave", () => {
        bouton.style.backgroundColor = "greenyellow";
        });
        bouton.style.border = "1px solid black";
        bouton.style.borderRadius = "5px";
        bouton.onclick = function() {
            next();
        };

        // ajoute le bouton à la page
        document.querySelector(".following").appendChild(bouton);

        // affiche "La bonne réponse"
        let annonce22 = document.createElement("p");
        annonce22.textContent = "La bonne réponse :";
        document.querySelector(".annonce22").appendChild(annonce22);

        // crée une deuxième barre
        // qui affiche la bonne réponse
        let barre2 = document.createElement("input");
        barre2.id = "barre";
        barre2.type = "range";
        barre2.min = 0;
        barre2.max = 40;
        barre2.value = prix;
        barre2.style.pointerEvents = "none";
        barre2.style.borderRadius = "6px";
        barre2.tabIndex = -1;
        barre2.style.backgroundColor = "red";
        document.querySelector(".annonce2").appendChild(barre2);


        // display the correct price in RM and Euro
        let annonce2 = document.createElement("p");
        annonce2.textContent =
            formatPrix(prix) + " RM " +
            (Number(prix) / 4.65).toFixed(2) + " Euro";
        document.querySelector(".annonce222").appendChild(annonce2);

        // affiche l'écart entre la réponse et le vrai prix
        let annonce3 = document.createElement("p");
        annonce3.textContent = "gap : " + ecart + " RM";
        document.querySelector(".annonce3").appendChild(annonce3);

        // display the points earned in this round
        let annonce4 = document.createElement("p");
        annonce4.textContent =
            Math.round(points * 100) / 100 + " points earned out of 4";
        document.querySelector(".annonce4").appendChild(annonce4);


            if (DivSec){
                document.getElementById("sec")?.remove();
            }
        color(prix, reponse_joueur);
            
    });
}

function color(prix, reponse_joueur) {
    const barre2 = document.getElementById("barre");
    const texte = document.getElementById("modal-text");

    prix = Number(prix);
    reponse_joueur = Number(reponse_joueur);

    const diff = Math.round((reponse_joueur - prix) * 100) / 100;
    const absDiff = Math.abs(diff);


    if (absDiff === 6.7 || absDiff === 0.67) {
        barre2.style.accentColor = "gold";
        secret_mode();       
    }
    else if (diff < 0) {
        barre2.style.accentColor = "blue";
    }
    else if (diff > 0) {
        barre2.style.accentColor = "red";
    }
    else {
        barre2.style.accentColor = "green";
        texte.textContent = "Congratulations, you have the right price !😎";
        openModal(); 
    }
            
}


function openModal() {
    document.getElementById("modal").classList.add("open");
}

function closeModal() {
    document.getElementById("modal").classList.remove("open");
}


// quand le bouton More or Less est cliqué
function hint() {

    // récupère l'identifiant de la partie
    let partieId = localStorage.getItem("partieId");

    // récupère la réponse actuelle du joueur
    let reponse_joueur = Number(document.getElementById("reponse").value);

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
        let hint = document.createElement("p");
        hint.textContent = data.message;

        // change la couleur selon la réponse
        if (data.message.startsWith("more")) {
            hint.style.color = "red";
        }
        else if (data.message.startsWith("less")) {
            hint.style.color = "blue";
        }
        else {
            hint.style.color = "green";
        }

        // affiche l'indice
        document.querySelector(".hint1").appendChild(hint);

        // met à jour le nombre d'indices avec la valeur venant de la BDD
        if (data.hint_count <= 0) {
            let boutonHint = document.getElementById("hint");
            if (boutonHint) {
                boutonHint.remove();
            }
        }
        else {
            document.getElementById("hint").textContent =
                "More or Less : " + data.hint_count;
        }
        let div = document.getElementById("secret");
        div.style.height = "35px";
    });
}

// quand le bouton Temperature est cliqué
function temperature() {

    // récupère l'identifiant de la partie
    let partieId = localStorage.getItem("partieId");

    // récupère la réponse actuelle du joueur
    let reponse_joueur = Number(document.getElementById("reponse").value);

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
        let temp = document.createElement("p");
        temp.textContent = data.message;

        // applique la couleur envoyée par le serveur
        temp.style.color = data.couleur;

        // affiche l'indice
        document.querySelector(".hint2").appendChild(temp);

        // met à jour le nombre d'indices avec la valeur venant de la BDD
        if (data.temp_count <= 0) {
            let boutonTemperature = document.getElementById("temperature");
            if (boutonTemperature) {
                boutonTemperature.remove();
            }
        }
        else {
            document.getElementById("temperature").textContent =
                "Temperature : " + data.temp_count;
        }
        let div2 = document.getElementById("secret2");
        div2.style.height = "35px";
    });
}
// boutons -- / - / + / ++ qui modifient la valeur de la barre
function modify(nombre) {
    let barre = document.getElementById("reponse");

    let valeur = Number(barre.value) + nombre;

    valeur = Math.max(0, Math.min(40, valeur));

    barre.value = valeur.toFixed(2);


    afficherValeur(valeur);
}

const REPETITION_DELAY = 400;   // ms 
const REPETITION_INTERVAL = 50;   
const ACCELERATION = 1000; 

let timerDelai = null;
let timerBoucle = null;
let debutAppui = 0;

// démarre la modification : un pas immédiat, puis répétition en continu
function startModify(nombre) {
    stopModify();                        
    debutAppui = performance.now();
    modify(nombre);                      

    timerDelai = setTimeout(function() {
        timerBoucle = setInterval(function() {
            let duree = performance.now() - debutAppui;
            let facteur = 1 + Math.floor(duree / ACCELERATION);
            modify(nombre * facteur);
        }, REPETITION_INTERVAL);
    }, REPETITION_DELAY);
}

// arrête la modification et renvoie la durée de l'appui (en secondes)
function stopModify() {
    clearTimeout(timerDelai);
    clearInterval(timerBoucle);
    timerDelai = null;
    timerBoucle = null;

    if (!debutAppui) {
        return 0;                      
    }

    let duree = (performance.now() - debutAppui) / 1000;
    debutAppui = 0;
    return duree;
}

// bouton qui recharge la page si le jeu n'est pas terminé
// sinon va sur la page résultat

function next() {

    // Récupère l'identifiant de la partie
    let partieId = localStorage.getItem("partieId");

    fetch("/api/partie/" + partieId)
        .then(response => response.json())
        .then(data => {

            // Si les 5 manches sont terminées
                        if(data.hard == 1){
                if (data.round > 7) {
                sessionStorage.setItem("terminee", "true");
                sessionStorage.removeItem("next");
                window.location.replace("/result");
            }

            // Sinon, on autorise le passage à la manche suivante
            else {
                sessionStorage.setItem("next", "true");
                window.location.href = "/jeu";

            }} else {
            if (data.round > 5) {
                sessionStorage.setItem("terminee", "true");
                sessionStorage.removeItem("next");
                window.location.replace("/result");
            }
            // else, continue to the next round
            else {
                sessionStorage.setItem("next", "true");
                window.location.href = "/jeu";
            }}
        })
        .catch(err => console.error(err));
}


// retrieve information from the server
function fetchURL(url) {
    fetch(url)
        .then(function(response) {
            return response.json();
        }).then(showTable).catch(function(error) {
            console.error("Error fetching URL:", error);
        });
}

// place les icônes de la page d'accueil à des positions aléatoires
function randomImgPosition(){
    const images = document.querySelectorAll(".icon");
    for(let i=0;i<images.length;i++){
        const leftMaximal = window.innerWidth - images[i].offsetWidth;
        const topMaximal = window.innerHeight - images[i].offsetHeight;

        const randomLeft = Math.floor(Math.random()*leftMaximal);
        const randomTop = Math.floor(Math.random()*topMaximal);
        images[i].style.animation="iconAnimation "+ getRandomFloat(3,5)+"s ease-in-out infinite";

        images[i].style.left = randomLeft + 'px';
        images[i].style.top = randomTop + 'px';
    }
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }   

if (window.location.pathname === "/") {
    document.addEventListener("DOMContentLoaded", randomImgPosition);
}

function iconClickAnimation(event){
    const icon = event.target.closest(".icon");
    icon.animate(
        [{ scale: 1 }, { scale: 0.9, offset: 0.1 }, { scale: 1 }],
        { duration: 200, easing: "ease-in" }
    );
}
document.addEventListener("click", iconClickAnimation);




function secret_mode() {
    const body = document.body;
    body.classList.remove("secret_mode");
    void body.offsetWidth;            
    body.classList.add("secret_mode");

    body.addEventListener("animationend", function() {
        body.classList.remove("secret_mode");
    }, { once: true });
}

