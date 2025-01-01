// delete-character.spec.ts

import { handler } from './delete-character'; // <-- adjust path to your delete-character handler
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import 'aws-sdk-client-mock-jest';
import { APIGatewayProxyEvent } from 'aws-lambda';

const ddbMock = mockClient(DynamoDBClient);

describe('delete-character ', () => {
  beforeEach(() => {
    ddbMock.reset(); // Reset mock calls and responses before each test
  });

  test("should return 400 if path parameter 'id' is missing", async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: undefined, // No id
    } as any;

    // Handler will return 400 without calling DynamoDB.
    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      error: "Missing path parameter 'id'",
    });
    expect(ddbMock.commandCalls(GetCommand).length).toBe(0);
    expect(ddbMock.commandCalls(DeleteCommand).length).toBe(0);
  });

  test('should return 404 if the character does not exist in DynamoDB', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: { id: 'non-existent-id' },
    } as any;

    // The CharacterService logic: "if getCharacter() returns null => 404".
    ddbMock.on(GetCommand).resolves({ Item: undefined });

    const response = await handler(event);

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toEqual({
      error: 'Character not found',
    });

    // Confirm we tried to get the item
    expect(ddbMock).toHaveReceivedCommandWith(GetCommand, {
      TableName: expect.any(String),
      Key: { id: 'non-existent-id' },
    });
    // We never issue a DeleteCommand if item doesn't exist
    expect(ddbMock.commandCalls(DeleteCommand).length).toBe(0);
  });

  test('should return 204 if the character is found and deleted', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: { id: '123' },
    } as any;

    // Mock "getCharacter" to return a valid record
    ddbMock.on(GetCommand).resolves({
      Item: {
        id: '123',
        name: 'Obi-Wan Kenobi',
        episodes: ['I', 'II', 'III', 'IV'],
        planet: 'Stewjon',
      },
    });

    // Mock the DeleteCommand to succeed with no error
    ddbMock.on(DeleteCommand).resolves({});

    const response = await handler(event);

    expect(response.statusCode).toBe(204);
    // A 204 response generally has an empty body
    expect(response.body).toBe(JSON.stringify({}));

    // Verify the DB calls
    expect(ddbMock).toHaveReceivedCommandWith(GetCommand, {
      TableName: expect.any(String),
      Key: { id: '123' },
    });
    expect(ddbMock).toHaveReceivedCommandWith(DeleteCommand, {
      TableName: expect.any(String),
      Key: { id: '123' },
    });
  });

  test('should return 500 if DynamoDB throws an error', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: { id: '999' },
    } as any;

    // Simulate an error when we call GetCommand
    ddbMock.on(GetCommand).rejects(new Error('DynamoDB Internal Error'));

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      error: 'Internal server error',
    });
  });
});
