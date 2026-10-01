
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
    window.location.href = "/jeu";
    barre.disabled = false;
}

//fonction qui s'effectue au début de chaque page
function begin() {

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
    //récupere le guess du joueur
    let reponse_joueur = Number(document.getElementById("reponse").value);

    //récupère les points
    let points = (
        1 - Math.abs((reponse_joueur * 100 / produit.prix) - 100) / 100
    ) * 4;

    //arrondi
    points = Math.max(0, points);

    //incremente le score et les manches
    score += points;
    round += 1;

    //sauvegarde le score et round pour consever après recharge de la page
    localStorage.setItem("score", score);
    localStorage.setItem("round", round);

    //actualise le score
    document.getElementById("score").textContent = Math.round(score * 100)/100;

    //suprime le bouton valider et hint (si présent)
    document.getElementById("valider").remove();
    if (hint_count > 0){ document.getElementById("hint").remove(); }
    if (temp_count > 0){ document.getElementById("temperature").remove(); }

    //enleve les indices affichés
    document.querySelector(".hint1").remove();
    document.querySelector(".hint2").remove();

    //empeche le joueur de modifier son guess
    barre.disabled = true;

    //ajoute un bouton suivant
    let bouton = document.createElement("button");
    bouton.textContent = "Suivant";

    bouton.onclick = function() {
    next();
};

    document.querySelector(".suivant").appendChild(bouton);
    
    //affiche la réponse avec une barre graphique
    let annonce22 = document.createElement("p");
    annonce22.textContent = "La bonne réponse :";
    document.querySelector(".annonce22").appendChild(annonce22);

    let barre2 = document.createElement("input");

    barre2.id = "barre";

    barre2.type = "range";
    barre2.min = 0;
    barre2.max = 40;
    barre2.value = produit.prix;
    barre2.disabled = true;

    //affiche les points gagné, le vrai prix et l'écart
    document.querySelector(".annonce2").appendChild(barre2);
    let annonce2 = document.createElement("p");
    annonce2.textContent = produit.prix +" RM " + Number(produit.prix/4.65).toFixed(2)+" Euro";
    document.querySelector(".annonce2").appendChild(annonce2);

    let points_pourcent = Math.abs(Math.round(((reponse_joueur * 100 / produit.prix) - 100)));
    let annonce3 = document.createElement("p");
    annonce3.textContent = "écart : " + points_pourcent + "%";
    document.querySelector(".annonce3").appendChild(annonce3);

    let annonce4 = document.createElement("p");
    annonce4.textContent = Math.round(points * 100)/100 + " points gagné sur 4"
    document.querySelector(".annonce4").appendChild(annonce4);
   
}

//quand hint est cliqué
function hint(){

    //vide les indices affichés à l'écran
    document.querySelector(".hint1").innerHTML = "";

    //compare la réponse du joueur
    let reponse_joueur = Number(document.getElementById("reponse").value);

    //affiche more, less ou that is it selon la comparaison
    let hint = document.createElement("p");
    if (reponse_joueur < produit.prix) {
    hint.textContent = "more";
    hint.style.color = "red";
    } else if (reponse_joueur > produit.prix){
    hint.textContent = "less";
    hint.style.color = "blue";
    } else { hint.textContent = "that's it !";
        hint.style.color = "green";
    }
    document.querySelector(".hint1").appendChild(hint);

    //décremente le nombre d'indice
    hint_count -= 1;
    localStorage.setItem("hint_count", hint_count);
    document.getElementById("hint").textContent = "More or Less : " + hint_count;

    //si plus d'indice retire le bouton hint
    if (hint_count <= 0){
        document.getElementById("hint").remove();
    }
}

//quand temperature est cliqué
function temperature(){

    //vide les indices affichés à l'écran
    document.querySelector(".hint2").innerHTML = "";

    //compare la réponse du joueur
    let reponse_joueur = Number(document.getElementById("reponse").value);

    //affiche more, less ou that is it selon la comparaison
    let temp = document.createElement("p");
    if ( Math.abs(reponse_joueur - produit.prix)  < 4) {
    temp.textContent = "hot";
    temp.style.color = "red";
    } else { 
    temp.textContent = "cold";
    temp.style.color = "blue";
    }
    document.querySelector(".hint2").appendChild(temp);

    //décremente le nombre d'indice
    temp_count -= 1;
    localStorage.setItem("temp_count", temp_count);
    document.getElementById("temperature").textContent = "Temperature : " + temp_count;

    //si plus d'indice retire le bouton hint
    if (temp_count <= 0){
        document.getElementById("temperature").remove();
    }
}

//bouton qui recharge la page si le jeu n'est pas terminé sinon va sur résultat
function next() {

        if (round > 5) {
        window.location.href = "/resultat";
    } else {
        window.location.href = "/jeu";
    }


}
