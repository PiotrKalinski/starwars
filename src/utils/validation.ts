// File: characters.validation.ts

import { z } from 'zod';
import { STAR_WARS_EPISODES } from './starWarsEpisodes';

const ERROR_MESSAGES = {
  nameRequired: 'Name is required',
  episodesArray: 'Episodes must be an array',
};

/**
 * Checks if every episode in the input array
 * is one of the valid STAR_WARS_EPISODES.
 * Returns null if valid, or an error string if invalid.
 */
function validateEpisodes(episodes: string[]): string | null {
  for (const episode of episodes) {
    if (!STAR_WARS_EPISODES.includes(episode)) {
      return `Episode ${episode} is not a valid Star Wars episode`;
    }
  }
  return null;
}

// Zod schemas
const createCharacterSchema = z.object({
  name: z.string().nonempty(ERROR_MESSAGES.nameRequired),
  episodes: z
    .array(z.string())
    .nonempty(ERROR_MESSAGES.episodesArray)
    .superRefine((episodes, ctx) => {
      // Check validity of episodes
      const error = validateEpisodes(episodes);
      if (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error, // e.g. "Episode asd is not a valid Star Wars episode"
        });
      }
    }),
});

const updateCharacterSchema = z.object({
  episodes: z
    .array(z.string())
    .optional()
    .or(z.undefined())
    .superRefine((episodes, ctx) => {
      // If episodes is undefined or not provided, we skip
      if (!episodes) return;

      const error = validateEpisodes(episodes);
      if (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error, // e.g. "Episode asd is not a valid Star Wars episode"
        });
      }
    }),
});

// Validation functions
export function validateCreateCharacter(data: any): string | null {
  const result = createCharacterSchema.safeParse(data);
  return result.success ? null : result.error.errors[0].message;
}

export function validateUpdateCharacter(data: any): string | null {
  const result = updateCharacterSchema.safeParse(data);
  return result.success ? null : result.error.errors[0].message;
}
