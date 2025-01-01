import { v4 as uuidv4 } from 'uuid';
import { Character } from '../models/character';
import { DynamoDbService } from './dynamodbService';

const TABLE_NAME = process.env.CHARACTERS_TABLE || 'StarWarsCharacters';
const dbService = new DynamoDbService<Character>(TABLE_NAME);

export class CharacterService {
  public async createCharacter(data: Partial<Character>): Promise<Character> {
    const id = uuidv4();
    const newCharacter: Character = {
      id,
      name: data.name!,
      episodes: data.episodes || [],
      planet: data.planet,
    };

    await dbService.putItem(newCharacter);

    return newCharacter;
  }

  public async getCharacter(id: string): Promise<Character | null> {
    return await dbService.getItem({ id });
  }

  /**
   * List characters with native DynamoDB pagination.
   * @param limit The maximum number of items to return in one "page"
   * @param lastEvaluatedKey The last page key to continue from, if any
   */
  public async listCharacters(
    limit: number,
    lastEvaluatedKey?: string,
  ): Promise<{ items: Character[]; lastEvaluatedKey?: string }> {
    // Convert the lastEvaluatedKey string to a DynamoDB key object, if it exists
    const exclusiveStartKey = lastEvaluatedKey
      ? { id: lastEvaluatedKey }
      : undefined;

    // Perform a paginated scan
    const { items, lastEvaluatedKey: newKey } = await dbService.scanPaginated(
      limit,
      exclusiveStartKey,
    );

    // If there's a newLastEvaluatedKey returned, store the 'id' property in lastEvaluatedKey
    const newLastEvaluatedKey = newKey?.id ? String(newKey.id) : undefined;

    return {
      items,
      lastEvaluatedKey: newLastEvaluatedKey,
    };
  }

  public async updateCharacter(
    id: string,
    data: Partial<Character>,
  ): Promise<Character | null> {
    const existing = await this.getCharacter(id);
    if (!existing) return null;

    const updated: Character = {
      ...existing,
      ...data,
    };

    await dbService.putItem(updated);

    return updated;
  }

  public async deleteCharacter(id: string): Promise<boolean> {
    const existing = await this.getCharacter(id);
    if (!existing) return false;

    await dbService.deleteItem({ id });

    return true;
  }
}
