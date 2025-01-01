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
        const deleted = await characterService.deleteCharacter(id);
        if (!deleted) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Character not found' }),
            };
        }
        return {
            statusCode: 204,
            body: JSON.stringify({}),
        };
    }
    catch (error) {
        console.error('Error deleting character:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
exports.handler = handler;
