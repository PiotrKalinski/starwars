// get-character.spec.ts

import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './get-character'; // Adjust path to your handler file
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import 'aws-sdk-client-mock-jest'; // Optional, for jest matchers like .toHaveReceivedCommand()

const ddbMock = mockClient(DynamoDBClient);

describe('get-character ', () => {
  beforeEach(() => {
    // Reset the mock between tests so there's a clean slate of calls/responses
    ddbMock.reset();
    jest.clearAllMocks();
  });

  it("should return 400 if 'id' path parameter is missing", async () => {
    // No pathParameters in the event
    const event: APIGatewayProxyEvent = {
      pathParameters: undefined,
    } as any;

    // Because there's no ID, the handler won't even call DynamoDB,
    // so no mock needed for GetCommand.

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      error: "Missing path parameter 'id'",
    });
    expect(ddbMock.commandCalls(GetCommand).length).toBe(0); // No calls to DB
  });

  it('should return 404 if the character does not exist in DynamoDB', async () => {
    // Provide a path parameter
    const event: APIGatewayProxyEvent = {
      pathParameters: { id: 'non-existing-id' },
    } as any;

    // Mock the GetCommand to return no Item
    ddbMock.on(GetCommand).resolves({
      Item: undefined, // No record found
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toEqual({
      error: 'Character not found',
    });

    // Optionally verify that we actually called DynamoDB
    expect(ddbMock).toHaveReceivedCommandWith(GetCommand, {
      TableName: expect.any(String),
      Key: { id: 'non-existing-id' },
    });
  });

  it('should return 200 and the character if found in DynamoDB', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: { id: '123' },
    } as any;

    // Mock the GetCommand to return a valid item
    ddbMock.on(GetCommand).resolves({
      Item: {
        id: '123',
        name: 'Darth Vader',
        episodes: ['A New Hope'],
        planet: 'Tatooine',
      },
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      id: '123',
      name: 'Darth Vader',
      episodes: ['A New Hope'],
      planet: 'Tatooine',
    });

    // Verify the DynamoDB call
    expect(ddbMock).toHaveReceivedCommandWith(GetCommand, {
      TableName: expect.any(String),
      Key: { id: '123' },
    });
  });

  it('should return 500 if an unexpected error occurs when calling DynamoDB', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: { id: '999' },
    } as any;

    // Simulate an error from DynamoDB
    ddbMock.on(GetCommand).rejects(new Error('DynamoDB error'));

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      error: 'Internal server error',
    });
  });
});
