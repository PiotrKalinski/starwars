import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from './list-character';
import 'aws-sdk-client-mock-jest';
import { APIGatewayProxyEvent } from 'aws-lambda';

const ddbMock = mockClient(DynamoDBClient);

describe('list-character handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should return a list of characters', async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: { limit: '10', lastKey: 'someKey' },
    } as any;

    const mockItems = [
      { id: '1', name: 'Luke Skywalker' },
      { id: '2', name: 'Leia Organa' },
    ];

    ddbMock.on(ScanCommand).resolves({
      Items: mockItems,
      LastEvaluatedKey: { id: 'someKey' },
    });

    const result = await handler(event);
    console.log({ result });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      items: mockItems,
      lastEvaluatedKey: 'someKey',
    });
  });

  test('should handle errors gracefully', async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: { limit: '10' },
      // ... other event properties
    } as any;

    ddbMock.on(ScanCommand).rejects(new Error('DynamoDB error'));

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({ error: 'Internal server error' });
  });
});
