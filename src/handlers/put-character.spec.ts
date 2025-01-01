// src/services/characterService.spec.ts
import { CharacterService } from '../services/characterService';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Character } from '../models/character';
import { handler } from './put-character';
import 'aws-sdk-client-mock-jest';
import { APIGatewayProxyEvent } from 'aws-lambda';

const ddbMock = mockClient(DynamoDBClient);

describe('put-character handler', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  test('should throw an error if it does not exist', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: { id: 'new-id' },
      body: JSON.stringify({
        name: 'Luke Skywalker',
        episodes: ['A New Hope'],
      }),
    } as any;

    ddbMock.on(GetCommand).resolves({ Item: undefined });
    ddbMock.on(PutCommand).resolves({});

    const result = await handler(event);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toHaveProperty('error');
  });

  test('should update an existing character', async () => {
    const existingCharacter: Character = {
      id: '123',
      name: 'Leia Organa',
      episodes: ['A New Hope'],
    };
    const event: APIGatewayProxyEvent = {
      pathParameters: { id: '123' },
      body: JSON.stringify({ name: 'Leia Organa Updated' }),
      // ... other event properties
    } as any;

    ddbMock.on(GetCommand).resolves({ Item: existingCharacter });
    ddbMock.on(PutCommand).resolves({});

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).name).toBe('Leia Organa Updated');
    expect(ddbMock).toHaveReceivedCommandWith(PutCommand, {
      TableName: expect.any(String),
      Item: expect.objectContaining({ name: 'Leia Organa Updated' }),
    });
  });

  test('should return 400 if request body is missing', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: { id: 'some-id' },
      body: null, // No body provided
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ error: 'Missing request body' });
  });
});
