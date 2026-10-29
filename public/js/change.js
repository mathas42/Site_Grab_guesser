const API_URL = "https://api.frankfurter.dev/v2/rate/MYR/EUR";
let changeMyrEur = 1 / 4.65;   // Default value

async function LoadChange() {
    try {
        const answer = await fetch(API_URL, { signal: AbortSignal.timeout(3000) });
        if (!answer.ok) throw new Error("API error");

        const data = await answer.json();
        if (typeof data.rate === "number") {
            changeMyrEur = data.rate;
        }
    } catch (error) {
        console.error("Change not available, fallback used:", error);
    }
}

function EuroChange(rm) {
    return Number(rm) * changeMyrEur;
}