const historique = JSON.parse(localStorage.getItem("historique")) || [];
const conteneur = document.getElementById("historique");


historique.forEach((manche, index) => {
    const bloc = document.createElement("div");
    bloc.classList.add("manche");

    const titre = document.createElement("h3");
    titre.textContent = `Manche ${index + 1}`;

    const image = document.createElement("img");
    image.src = manche.image;
    image.style.height = "170px";

    const nom = document.createElement("p");
    nom.textContent = manche.nom;

    const points = document.createElement("p");
    points.textContent = `Points gagnés : ${manche.points}`;

    bloc.append(titre, image, nom, points);
    conteneur.appendChild(bloc);
});