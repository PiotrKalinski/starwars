"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const characterService_1 = require("../services/characterService");
const characterService = new characterService_1.CharacterService();
const handler = async (event) => {
    try {
        // Optional query parameters for pagination
        const limit = parseInt(event.queryStringParameters?.limit || "10", 10);
        const lastKey = event.queryStringParameters?.lastKey;
        const { items, lastEvaluatedKey } = await characterService.listCharacters(limit, lastKey);
        return {
            statusCode: 200,
            body: JSON.stringify({ items, lastEvaluatedKey }),
        };
    }
    catch (error) {
        console.error("Error listing characters:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
};
exports.handler = handler;
