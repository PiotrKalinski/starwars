import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CharacterService } from '../services/characterService';

const characterService = new CharacterService();

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    // Optional query parameters for pagination
    const limit = parseInt(event.queryStringParameters?.limit || '10', 10);
    const lastKey = event.queryStringParameters?.lastKey;

    const { items, lastEvaluatedKey } = await characterService.listCharacters(
      limit,
      lastKey,
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ items, lastEvaluatedKey }),
    };
  } catch (error) {
    console.error('Error listing characters:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
