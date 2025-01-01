// dynamodbService.spec.ts

import { DynamoDbService } from './dynamodbService';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import 'aws-sdk-client-mock-jest';

interface TestItem {
  id: string;
  name?: string;
  [key: string]: any;
}

describe('DynamoDbService', () => {
  const ddbMock = mockClient(DynamoDBClient); // mock the client
  let service: DynamoDbService<TestItem>;
  const tableName = 'TestTable';

  beforeAll(() => {
    // Any global or shared setup can go here
  });

  beforeEach(() => {
    ddbMock.reset(); // Reset all mock states
    service = new DynamoDbService<TestItem>(tableName);
  });

  describe('getItem', () => {
    it('should return an item if found', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: { id: '123', name: 'Test Name' },
      });

      const result = await service.getItem({ id: '123' });

      expect(result).toEqual({ id: '123', name: 'Test Name' });
      expect(ddbMock).toHaveReceivedCommandWith(GetCommand, {
        TableName: tableName,
        Key: { id: '123' },
      });
    });

    it('should return null if item not found', async () => {
      ddbMock.on(GetCommand).resolves({ Item: undefined });

      const result = await service.getItem({ id: 'not-found' });
      expect(result).toBeNull();
    });
  });

  describe('putItem', () => {
    it('should put (create or overwrite) an item', async () => {
      // Mock the PutCommand success
      ddbMock.on(PutCommand).resolves({});

      const item = { id: 'abc', name: 'New Item' };
      await service.putItem(item);

      expect(ddbMock).toHaveReceivedCommandWith(PutCommand, {
        TableName: tableName,
        Item: item,
      });
    });
  });

  describe('updateItem', () => {
    it('should update an item with the provided fields', async () => {
      ddbMock.on(UpdateCommand).resolves({
        Attributes: { id: '999', name: 'Updated' },
      });

      const updates = { name: 'Updated' };
      const result = await service.updateItem({ id: '999' }, updates);

      expect(result).toEqual({ Attributes: { id: '999', name: 'Updated' } });
      // Confirm the UpdateCommand was called with correct expression
      expect(ddbMock).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: tableName,
        Key: { id: '999' },
        UpdateExpression: 'SET name = :name',
        ExpressionAttributeValues: {
          ':name': 'Updated',
        },
        ReturnValues: 'ALL_NEW',
      });
    });
  });

  describe('deleteItem', () => {
    it('should delete an item by key', async () => {
      ddbMock.on(DeleteCommand).resolves({});

      const key = { id: '123' };
      await service.deleteItem(key);

      expect(ddbMock).toHaveReceivedCommandWith(DeleteCommand, {
        TableName: tableName,
        Key: key,
      });
    });
  });

  describe('scanPaginated', () => {
    it('should scan the table with limit and no ExclusiveStartKey if not provided', async () => {
      ddbMock.on(ScanCommand).resolves({
        Items: [{ id: '1' }, { id: '2' }],
        LastEvaluatedKey: undefined,
      });

      const { items, lastEvaluatedKey } = await service.scanPaginated(2);

      expect(items).toEqual([{ id: '1' }, { id: '2' }]);
      expect(lastEvaluatedKey).toBeUndefined();

      expect(ddbMock).toHaveReceivedCommandWith(ScanCommand, {
        TableName: tableName,
        Limit: 2,
        ExclusiveStartKey: undefined,
      });
    });

    it('should scan the table with an ExclusiveStartKey if provided', async () => {
      ddbMock.on(ScanCommand).resolves({
        Items: [{ id: '3' }, { id: '4' }],
        LastEvaluatedKey: { id: '4' },
      });

      const { items, lastEvaluatedKey } = await service.scanPaginated(2, {
        id: '2',
      });

      expect(items).toEqual([{ id: '3' }, { id: '4' }]);
      expect(lastEvaluatedKey).toEqual({ id: '4' });

      expect(ddbMock).toHaveReceivedCommandWith(ScanCommand, {
        TableName: tableName,
        Limit: 2,
        ExclusiveStartKey: { id: '2' },
      });
    });
  });
});
