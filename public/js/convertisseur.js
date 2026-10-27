const API_URL = "https://api.frankfurter.dev/v2/rate/myr/eur";

export async function obtenirTaux() {
    try {
        const reponse = await fetch(API_URL);

        if (!reponse.ok) {
            throw new Error("Erreur API");
        }

        const donnees = await reponse.json();

        return donnees.rate;
    } catch (erreur) {
        console.error(erreur);
        return null;
    }
}