const baseUrl = "https://history.geometrydash.eu/api";

export async function levelDateEstimation(levelId: number) {
    const response = await fetch(`${baseUrl}/v1/date/level/${levelId}`);
    const data = await response.json();
    return new Date(data.approx.estimation as string);
}
