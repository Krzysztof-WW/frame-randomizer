/**
 * Generates a "SxxExx" string.
 * @param season Season number.
 * @param episode Episode number.
 * @returns Season/episode tag string.
 */
export function seasonEpisodeTag(
  season: string | number,
  episode: string | number,
): string {
  const sPadded = String(season).padStart(2, "0");
  const ePadded = String(episode).padStart(2, "0");
  return `S${sPadded}E${ePadded}`;
}

/**
 * Generates a fully notated episode name, with season/episode number.
 * @param season Season number.
 * @param episode Episode number.
 * @param name Name of the episode.
 * @returns Full episode name with season/episode number.
 */
export function episodeName(
  season: string | number,
  episode: string | number,
  name: string,
): string {
  return `${seasonEpisodeTag(season, episode)} ${name}`;
}

/**
 * Generates a string representation of a number, padded with zeros to the given length.
 * @param myNumber Number to pad.
 * @param iPartPlaces How many places to show in the integer part. If needed, the number will be padded with zeros.
 * @param fPartPlaces How many places to show in the fractional/decimal part. If needed, the number
 * @returns Padded string representation of the number.
 */
export function floatIntPartPad(
  myNumber: number | string,
  iPartPlaces = 2,
  fPartPlaces = 3,
) {
  const initialStrNumber = String(myNumber);
  const decimalIndex = initialStrNumber.indexOf(".");
  if (decimalIndex < 0) {
    return fPartPlaces > 0
      ? `${initialStrNumber.padStart(2, "0")}.${"0".repeat(fPartPlaces)}`
      : initialStrNumber.padStart(2, "0");
  }
  const numIPartDigits = decimalIndex;
  const numFPartDigits = initialStrNumber.length - (decimalIndex + 1);
  return `${"0".repeat(
    Math.max(iPartPlaces - numIPartDigits, 0),
  )}${initialStrNumber}${"0".repeat(
    Math.max(fPartPlaces - numFPartDigits, 0),
  )}`;
}
