import logger from "~/server/logger";
import { StoredAnswer } from "~/server/types";

const answerStorage = useStorage("answer");

/**
 * Cleans up the given answer.
 * @param id ID to clean up.
 * @returns Promise to await on completion.
 */
export async function cleanupAnswer(id: string): Promise<void> {
  await Promise.all([
    answerStorage.removeItem(id).catch((error) => {
      logger.error(`Failed to clean up stored answer: ${error}`, { id });
    }),
  ]);
  logger.info(`Cleaned up stored answer`, { id });
}

/**
 * Gets an int from query params.
 * @param query Query object from Nitro.
 * @param key Query param name.
 * @returns Integer from the given query param.
 */
function getInt(query: ReturnType<typeof getQuery>, key: string): number {
  const rawValue = query[key] as string;
  return rawValue ? parseInt(rawValue) : -1;
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const query = getQuery(event);
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id param" });
  }
  const season = getInt(query, "season");
  const episode = getInt(query, "episode");

  const answer = (await answerStorage.getItem(id)) as StoredAnswer | null;
  if (!answer) {
    throw createError({
      statusCode: 404,
      statusMessage: `Answer not found for id "${id}"`,
    });
  }
  // Remove the image file and stored answer but don't await on it; it doesn't affect the result.
  cleanupAnswer(id);

  const correct = answer.season === season && answer.episode === episode;
  return { ...answer, correct };
});
