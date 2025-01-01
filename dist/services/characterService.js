"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterService = void 0;
const uuid_1 = require("uuid");
const dynamodbService_1 = require("./dynamodbService");
const TABLE_NAME = process.env.CHARACTERS_TABLE || 'StarWarsCharacters';
const dbService = new dynamodbService_1.DynamoDbService(TABLE_NAME);
class CharacterService {
    async createCharacter(data) {
        const id = (0, uuid_1.v4)();
        const newCharacter = {
            id,
            name: data.name,
            episodes: data.episodes || [],
            planet: data.planet,
        };
        await dbService.putItem(newCharacter);
        return newCharacter;
    }
    async getCharacter(id) {
        return await dbService.getItem({ id });
    }
    /**
     * List characters with native DynamoDB pagination.
     * @param limit The maximum number of items to return in one "page"
     * @param lastEvaluatedKey The last page key to continue from, if any
     */
    async listCharacters(limit, lastEvaluatedKey) {
        // Convert the lastEvaluatedKey string to a DynamoDB key object, if it exists
        const exclusiveStartKey = lastEvaluatedKey
            ? { id: lastEvaluatedKey }
            : undefined;
        // Perform a paginated scan
        const { items, lastEvaluatedKey: newKey } = await dbService.scanPaginated(limit, exclusiveStartKey);
        // If there's a newLastEvaluatedKey returned, store the 'id' property in lastEvaluatedKey
        const newLastEvaluatedKey = newKey?.id ? String(newKey.id) : undefined;
        return {
            items,
            lastEvaluatedKey: newLastEvaluatedKey,
        };
    }
    async updateCharacter(id, data) {
        const existing = await this.getCharacter(id);
        if (!existing)
            return null;
        const updated = {
            ...existing,
            ...data,
        };
        await dbService.putItem(updated);
        return updated;
    }
    async deleteCharacter(id) {
        const existing = await this.getCharacter(id);
        if (!existing)
            return false;
        await dbService.deleteItem({ id });
        return true;
    }
}
exports.CharacterService = CharacterService;
