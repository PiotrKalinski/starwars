"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const characterService_1 = require("../services/characterService");
const characterService = new characterService_1.CharacterService();
const handler = async (event) => {
    try {
        const { id } = event.pathParameters || {};
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing path parameter 'id'" }),
            };
        }
        const character = await characterService.getCharacter(id);
        if (!character) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Character not found' }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify(character),
        };
    }
    catch (error) {
        console.error('Error retrieving character:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
exports.handler = handler;
