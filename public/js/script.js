// variables used
let produits = [];
let produit;
let barre;
let son = new Audio("/sound/faaah.mp3");


// formats a price to a fixed width: 8 -> "08.00", 12.5 -> "12.50"
function formatPrix(valeur) {
    return Number(valeur).toFixed(2).padStart(5, "0");
}

// updates the text displayed under the reply bar
function afficherValeur(valeur) {
    document.getElementById("value").textContent =
        formatPrix(valeur) + " RM " +
        EuroChange(valeur).toFixed(2) + " Euro";
}

//collect the JSON that contain products and their informations
fetch("/api/produits")
    .then(response => response.json())
    .then(data => {

        produits = data;

        // game page
        if (window.location.pathname === "/jeu") {
            begin();
        }

        // final page
        if (window.location.pathname === "/result") {

            let partieId = localStorage.getItem("partieId");

            fetch("/api/partie/" + partieId)
                .then(response => response.json())
                .then(data => {

                    // display the final score from the DB
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

        //clean the history
        localStorage.removeItem("historique");
        sessionStorage.setItem("next", "true");

        // going to the game page
        window.location.href = "/jeu";
    })
    .catch(error => console.error(error));
}


// fonction qui s'effectue lorsque le joueur clique sur Learn
function new_learn_() {
    window.location.href = "/learn";
}


// fonction qui s'effectue au début de chaque page du jeu
async function begin() {
    console.log("attente");
    await LoadChange();
    console.log("reussiSS")
    // Vérifie si la partie est terminée
    if (sessionStorage.getItem("terminee") === "true") {
        localStorage.clear();
        window.location.replace("/index");
        return;
    }

    let navigationDepuisNext = sessionStorage.getItem("next");

    if (navigationDepuisNext === "true") {
        sessionStorage.removeItem("next");
    } else {
        localStorage.clear();
        window.location.replace("/index");
        return;
    }

    const partieId = localStorage.getItem("partieId");

    if (!partieId) {
        window.location.replace("/index");
        return;
    }


    //collect informations from the game from the DB
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
            SummaryPoint(); 

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
            document.getElementById("products-list").innerHTML = `

                <div class="produit">
                    <img src="${produit.image}">
                    <h2>${produit.nom}</h2>
                    <h3>${produit.nom_restaurant}</h3>

                </div>
            `;
            document.querySelector(".produit img").addEventListener("click", () => {openPopup(produit);});

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
            SummaryPoint();

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
        document.getElementById("more").remove();
        document.getElementById("moremore").remove();
        document.getElementById("moremoremore").remove();
        document.getElementById("less").remove();
        document.getElementById("lessless").remove();
        document.getElementById("lesslessless").remove();

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

        document.querySelector(".annonce").innerHTML="Your guess:"

        // create a button to go to the next round
        let bouton = document.createElement("button");
        bouton.textContent = "Next";
        bouton.className = "next-class";
        bouton.onclick = function() {
            next();
        };

        //add the boutton to the page
        document.querySelector(".following").appendChild(bouton);

        // display the "good answer"
        let annonce22 = document.createElement("p");
        annonce22.textContent = "The good answer :";
        document.querySelector(".annonce22").appendChild(annonce22);

        // create the second bar
        // that displays the good answer
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
            EuroChange(prix).toFixed(2) + " Euro";
        document.querySelector(".annonce222").appendChild(annonce2);

        // display the gap bewteen the answer and the good
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

function color(price, player_answer) {
    const barre2 = document.getElementById("barre");
    const texte = document.getElementById("modal-text");

    price = Number(price);
    player_answer = Number(player_answer);

    const absDiff = Math.abs(player_answer - price);
    const gap = absDiff / price * 100;

    if (Math.abs(gap - 6.7) < 0.01 ||
        Math.abs(gap - 0.67) < 0.01) {
        barre2.style.accentColor = "gold";
        secret_mode();
        return;
    }
    if (gap === 0) {
        barre2.style.accentColor = "green";
        texte.textContent =
            "Congratulations, you have the right price! 😎";
        openModal();
        return;
    }

    //Blue to red ( far to near)
    const t = Math.max(0, Math.min(1, (gap - 1) / 98));

    const red = Math.round(229 + (59 - 229) * t); //red reference : rgb(229,72,77) nearest
    const green = Math.round(72 + (130 - 72) * t);//blue reference : rgb(59, 130, 246) farest
    const blue = Math.round(77 + (246 - 77) * t);
    barre2.style.accentColor = `rgb(${red}, ${green}, ${blue})`;
}


function openModal() {
    document.getElementById("modal").classList.add("open");
}

function closeModal() {
    document.getElementById("modal").classList.remove("open");
}

function SummaryPoint() {
    const text = document.getElementById("summary");
    if (!text) return;

    const historique = JSON.parse(localStorage.getItem("historique")) || [];
    text.textContent = historique.map(manche => manche.points).join(" / ");
}

// when the boutton "More" or "Less" is clicked
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

        //shows an error if the server sends one back
        if (data.erreur) {
            console.error(data.erreur);
            return;
        }

        // vide l'ancien indice
        document.querySelector(".hint1").innerHTML = "";

        //create the text from the hint
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

        // show the hint
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

        // show the hint
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
    });
}

function sauvegarderScore(score, hard) {
    const url = hard
        ? "/api/fin-partie-hard"
        : "/api/fin-partie";

    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ score: Number(score) })
    }).then(response => {
        if (!response.ok) {
            throw new Error("Erreur lors de la sauvegarde du score");
        }

        return response.json();
    });
}

// bouttons -- / - / + / ++ that modify the value of the bar
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

// start the adjustment: one immediate step, then continuous repetition
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

// stop the modification and return the press duration (in seconds)
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

//button that recharge the page is the game is not finished
// else going to the result page
function next() {
    
    //collect the id of the game
    let partieId = localStorage.getItem("partieId");

    fetch("/api/partie/" + partieId)
        .then(response => response.json())
        .then(data => {

            // if 5 rounds are finished
                        if(data.hard == 1){
                if (data.round > 7) {
                sessionStorage.setItem("terminee", "true");
                sessionStorage.removeItem("next");
                sauvegarderScore(Number(data.score)/1.4, data.hard == 1).then(() => {
                window.location.href = "/result";
                })
                .catch(err => console.error(err));
            }

            // else, we autorize to pass to the next round
            else {
                sessionStorage.setItem("next", "true");
                window.location.href = "/jeu";

            }} else {
            if (data.round > 5) {
                sessionStorage.setItem("terminee", "true");
                sessionStorage.removeItem("next");
                sauvegarderScore(Number(data.score), data.hard == 1).then(() => {
                window.location.href = "/result";
                })
                .catch(err => console.error(err));
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

// put a icon in a random place
function placeIcon(image) {
    const maxLeft = Math.max(0, document.documentElement.clientWidth - image.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - image.offsetHeight);

    image.style.left = Math.floor(Math.random() * maxLeft) + "px";
    image.style.top = Math.floor(Math.random() * maxTop) + "px";
}

// put icons on the homepage in randoms positions
function randomImgPosition() {
    const images = document.querySelectorAll(".icon");

    images.forEach(image => {
        placeIcon(image);

        image.style.animation = "iconAnimation " + getRandomFloat(3, 5) + "s ease-in-out infinite";
        image.style.animationDelay = "-" + getRandomFloat(0, 3) + "s";

        image.addEventListener("click", () => {
            image.style.visibility = "hidden";
            image.style.pointerEvents = "none";

            setTimeout(() => {
                placeIcon(image);
                image.style.visibility = "visible";
                image.style.pointerEvents = "auto";
            }, 2000);
        });
    });
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

if (window.location.pathname === "/") {
    window.addEventListener("load", randomImgPosition);
}

if (window.location.pathname === "/index") {
    window.addEventListener("load", randomImgPosition);
}


function openPopup(produit) {

    // Création des éléments HTML
    const overlay = document.createElement("div");
    const popup = document.createElement("div");
    const image = document.createElement("img");
    const closeButton = document.createElement("button");

    // Informations du produit
    image.src = produit.image;
    image.alt = produit.nom;

    closeButton.textContent = "Close";

    // Classes CSS
    overlay.classList.add("popup-overlay");
    popup.classList.add("popup");
    closeButton.classList.add("popup-close");

    // Ajoute les éléments dans la popup
    popup.append(image, closeButton);
    overlay.appendChild(popup);

    // Ajoute la popup à la page
    document.body.appendChild(overlay);

    // Fonction pour fermer la popup
    function close() {
        overlay.remove();
        document.removeEventListener("keydown", onKey);
    }

    // Fermeture avec Escape
    function onKey(e) {
        if (e.key === "Escape") {
            close();
        }
    }

    closeButton.addEventListener("click", close);

    // Fermeture en cliquant à l'extérieur
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            close();
        }
    });

    document.addEventListener("keydown", onKey);
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