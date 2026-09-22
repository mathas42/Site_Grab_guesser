const produits = [
    {
        nom: "Shawarma Al Sham - Bandar Tasik Selatan",
        description: "Shawarma Beef Medium",
        prix: 17.90,
        image: "Shawarma_beef.jpg"
    },
    {
        nom: "7StarThaiBasilRice - Taman Oversea Union [Non-Halal]",
        description: "Thai Basil Minced Pork Rice",
        prix: 22.90,
        image: "Thai_basil_minced_pork_rice.jpg"
    }
];

function new_() {
    localStorage.setItem("score", 0);
    localStorage.setItem("round", 0);
    window.location.href = "jeu.html";
}

let score = Number(localStorage.getItem("score")) || 0;
let round = Number(localStorage.getItem("round")) || 0;

document.getElementById("score").textContent = Math.round(score * 100) / 100;

const produit = produits[Math.floor(Math.random() * produits.length)];

document.getElementById("liste-produits").innerHTML = `
    <div class="produit">
        <img src="${produit.image}">
        <h2>${produit.nom}</h2>
        <h3>${produit.description}</h3>
    </div>
`;

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

    document.getElementById("reponse").remove();

    let bouton = document.createElement("button");

    bouton.textContent = "Suivant";

    bouton.onclick = function() {
    next();
};

    document.querySelector(".suivant").appendChild(bouton);

    let annonce = document.createElement("p");
    annonce.textContent = "Votre réponse : " + reponse_joueur ;
    document.querySelector(".annonce").appendChild(annonce);

        let annonce2 = document.createElement("p");
    annonce2.textContent = "La bonne réponse : " + produit.prix;
    document.querySelector(".annonce2").appendChild(annonce2);

    let points_pourcent = Math.abs(Math.round(((reponse_joueur * 100 / produit.prix) - 100)));
    let annonce3 = document.createElement("p");
    annonce3.textContent = "écart : " + points_pourcent + "%";
    document.querySelector(".annonce3").appendChild(annonce3);

    let annonce4 = document.createElement("p");
    annonce4.textContent = Math.round(points * 100)/100 + " points gagné sur 4"
    document.querySelector(".annonce4").appendChild(annonce4);
   
}

function next() {

        if (round > 4) {
        window.location.href = "resultat.html";
    } else {
        window.location.href = "jeu.html";
    }


}