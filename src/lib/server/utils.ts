export const splitPairings = (
  pairings: string,
  sep: string,
): Record<string, string> => {
  const result: Record<string, string> = {};
  const unpaired = pairings.split(sep);

  for (let i = 0; i < unpaired.length; i += 2) {
    const key = unpaired[i].trim();
    const value = unpaired[i + 1].trim();
    result[key] = value;
  }

  return result;
};
