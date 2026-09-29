let produits = [];
let produit;
let score = 0;
let round = 1;
let hint_count = 3;
let barre;

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

function new_() {
    localStorage.setItem("score", 0);
    localStorage.setItem("round", 1);
    localStorage.setItem("hint_count", 3);
    localStorage.setItem("produitsUtilises", JSON.stringify([]));
    window.location.href = "/jeu";
    barre.disabled = false;
}

function begin() {
score = Number(localStorage.getItem("score")) || 0;
round = Number(localStorage.getItem("round")) || 1;

hint_count = Number(localStorage.getItem("hint_count"));
  if (hint_count <= 0){ document.getElementById("hint").remove(); } else {
document.getElementById("hint").textContent = "Hint : " + hint_count;}

 document.getElementById("round").textContent = round + " / 5";

document.getElementById("score").textContent = Math.round(score * 100) / 100;

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


document.getElementById("liste-produits").innerHTML = `
    <div class="produit">
        <img src="${produit.image}">
        <h2>${produit.nom}</h2>
        <h3>${produit.nom_restaurant}</h3>
    </div>
`;

barre = document.getElementById("reponse");
value = document.getElementById("value");

barre.addEventListener("input", function() {
    value.textContent =Number(barre.value).toFixed(2);
})}

function valider() {
    let reponse_joueur = Number(document.getElementById("reponse").value);

    let points = (
        1 - Math.abs((reponse_joueur * 100 / produit.prix) - 100) / 100
    ) * 4;

    points = Math.max(0, points);

    score += points;
    round += 1;

    localStorage.setItem("score", score);
    localStorage.setItem("round", round);

    document.getElementById("score").textContent = Math.round(score * 100)/100;

    document.getElementById("valider").remove();
    if (hint_count > 0){ document.getElementById("hint").remove(); }
    document.querySelector(".hint1").remove();
    barre.disabled = true;

    let bouton = document.createElement("button");

    bouton.textContent = "Suivant";

    bouton.onclick = function() {
    next();
};

    document.querySelector(".suivant").appendChild(bouton);

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

        document.querySelector(".annonce2").appendChild(barre2);
    let annonce2 = document.createElement("p");
    annonce2.textContent = produit.prix;
    document.querySelector(".annonce2").appendChild(annonce2);

    let points_pourcent = Math.abs(Math.round(((reponse_joueur * 100 / produit.prix) - 100)));
    let annonce3 = document.createElement("p");
    annonce3.textContent = "écart : " + points_pourcent + "%";
    document.querySelector(".annonce3").appendChild(annonce3);

    let annonce4 = document.createElement("p");
    annonce4.textContent = Math.round(points * 100)/100 + " points gagné sur 4"
    document.querySelector(".annonce4").appendChild(annonce4);
   
}

function hint(){


    document.querySelector(".hint1").innerHTML = "";
    let reponse_joueur = Number(document.getElementById("reponse").value);
    let hint = document.createElement("p");
    if (reponse_joueur < produit.prix) {
    hint.textContent = "more";
    } else if (reponse_joueur > produit.prix){
        hint.textContent = "less";
    } else { hint.textContent = "that's it !";}

    document.querySelector(".hint1").appendChild(hint);

    hint_count -= 1;
    localStorage.setItem("hint_count", hint_count);
    document.getElementById("hint").textContent = "Hint : " + hint_count;

    if (hint_count <= 0){
        document.getElementById("hint").remove();
    }


}

function next() {

        if (round > 5) {
        window.location.href = "/resultat";
    } else {
        window.location.href = "/jeu";
    }


}
