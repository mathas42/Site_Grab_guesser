const historique = JSON.parse(localStorage.getItem("historique")) || [];
const conteneur = document.getElementById("historical");


historique.forEach((manche, index) => {
    const round = document.createElement("div");
    round.classList.add("round");

    const titre = document.createElement("h3");
    titre.textContent = `Round ${index + 1}`;

    const image = document.createElement("img");
    image.src = manche.image;
    image.style.height = "170px";

    const nom = document.createElement("p");
    nom.textContent = manche.nom;

    const points = document.createElement("p");
    points.textContent = `win points : ${manche.points}`;

    round.append(titre, image, nom, points);
    conteneur.appendChild(round);
});