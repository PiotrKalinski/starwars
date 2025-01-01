"use strict";
// File: characters.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateCharacter = validateCreateCharacter;
exports.validateUpdateCharacter = validateUpdateCharacter;
const zod_1 = require("zod");
const starWarsEpisodes_1 = require("./starWarsEpisodes");
const ERROR_MESSAGES = {
    nameRequired: 'Name is required',
    episodesArray: 'Episodes must be an array',
};
/**
 * Checks if every episode in the input array
 * is one of the valid STAR_WARS_EPISODES.
 * Returns null if valid, or an error string if invalid.
 */
function validateEpisodes(episodes) {
    for (const episode of episodes) {
        if (!starWarsEpisodes_1.STAR_WARS_EPISODES.includes(episode)) {
            return `Episode ${episode} is not a valid Star Wars episode`;
        }
    }
    return null;
}
// Zod schemas
const createCharacterSchema = zod_1.z.object({
    name: zod_1.z.string().nonempty(ERROR_MESSAGES.nameRequired),
    episodes: zod_1.z
        .array(zod_1.z.string())
        .nonempty(ERROR_MESSAGES.episodesArray)
        .superRefine((episodes, ctx) => {
        // Check validity of episodes
        const error = validateEpisodes(episodes);
        if (error) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: error, // e.g. "Episode asd is not a valid Star Wars episode"
            });
        }
    }),
});
const updateCharacterSchema = zod_1.z.object({
    episodes: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .or(zod_1.z.undefined())
        .superRefine((episodes, ctx) => {
        // If episodes is undefined or not provided, we skip
        if (!episodes)
            return;
        const error = validateEpisodes(episodes);
        if (error) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: error, // e.g. "Episode asd is not a valid Star Wars episode"
            });
        }
    }),
});
// Validation functions
function validateCreateCharacter(data) {
    const result = createCharacterSchema.safeParse(data);
    return result.success ? null : result.error.errors[0].message;
}
function validateUpdateCharacter(data) {
    const result = updateCharacterSchema.safeParse(data);
    return result.success ? null : result.error.errors[0].message;
}
