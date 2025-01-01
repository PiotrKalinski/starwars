"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const characterService_1 = require("../services/characterService");
const validation_1 = require("../utils/validation");
const characterService = new characterService_1.CharacterService();
/**
 * Lambda handler for updating a Star Wars character in DynamoDB.
 * This endpoint supports both creating a new character with a specific ID
 * and updating an existing character, combining functionality to reduce cold starts.
 *
 * @param event - API Gateway event containing the character ID and update data
 * @returns API Gateway response with the updated/created character or error

 */
const handler = async (event) => {
    try {
        const { id } = event.pathParameters || {};
        console.log("id", id);
        console.log("event", event);
        console.log("event.body", event.body);
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing request body" }),
            };
        }
        const data = JSON.parse(event.body);
        console.log("data", data);
        const validationError = (0, validation_1.validateUpdateCharacter)(data);
        if (validationError) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: validationError }),
            };
        }
        if (id) {
            // Update flow
            const existingCharacter = await characterService.getCharacter(id);
            if (!existingCharacter) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: "Character not found" }),
                };
            }
            const updatedCharacter = await characterService.updateCharacter(id, data);
            return {
                statusCode: 200,
                body: JSON.stringify(updatedCharacter),
            };
        }
        else {
            const newCharacter = await characterService.createCharacter(data);
            return {
                statusCode: 201,
                body: JSON.stringify(newCharacter),
            };
        }
    }
    catch (error) {
        console.error("Error handling createOrUpdateCharacter:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
};
exports.handler = handler;
