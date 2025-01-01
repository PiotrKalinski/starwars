// src/services/dynamodbService.ts
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  GetCommandOutput,
  PutCommandOutput,
  UpdateCommandOutput,
  DeleteCommandOutput,
  ScanCommandOutput,
} from '@aws-sdk/lib-dynamodb';

/**
 * A generic DynamoDB service (AWS SDK v3) that can be initialized with a table name.
 * T represents the item type (for strong typing).
 */
export class DynamoDbService<T extends Record<string, any>> {
  private client: DynamoDBClient;
  private tableName: string;

  /**
   * @param tableName - DynamoDB table name
   * @param config - (Optional) Configuration for DynamoDBClient
   */
  constructor(tableName: string, config?: DynamoDBClientConfig) {
    this.tableName = tableName;
    this.client = new DynamoDBClient(config || {});
  }

  /**
   * Get an item by its key.
   */
  public async getItem(key: Record<string, unknown>): Promise<T | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: key,
    });
    const result: GetCommandOutput = await this.client.send(command);
    return (result.Item as T) ?? null;
  }

  /**
   * Put (create or overwrite) an item.
   */
  public async putItem(item: T): Promise<PutCommandOutput> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    });
    return this.client.send(command);
  }

  /**
   * Update an item. (Simple approach: fully custom update expression.)
   */
  public async updateItem(
    key: Record<string, unknown>,
    updates: Partial<T>,
  ): Promise<UpdateCommandOutput> {
    const updateExpressionParts: string[] = [];
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.entries(updates).forEach(([field, value]) => {
      updateExpressionParts.push(`${field} = :${field}`);
      expressionAttributeValues[`:${field}`] = value;
    });

    const updateExpression = `SET ${updateExpressionParts.join(', ')}`;

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });
    return this.client.send(command);
  }

  /**
   * Delete an item by its key.
   */
  public async deleteItem(
    key: Record<string, unknown>,
  ): Promise<DeleteCommandOutput> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: key,
    });
    return this.client.send(command);
  }

  /**
   * Scan with pagination. This scans a single page of results using DynamoDB's Limit and
   * ExclusiveStartKey to handle "paging" at the DynamoDB level.
   */
  public async scanPaginated(
    limit: number,
    exclusiveStartKey?: Record<string, any>,
  ): Promise<{ items: T[]; lastEvaluatedKey?: Record<string, any> }> {
    const command = new ScanCommand({
      TableName: this.tableName,
      Limit: limit,
      ExclusiveStartKey: exclusiveStartKey,
    });

    const output: ScanCommandOutput = await this.client.send(command);

    return {
      items: (output.Items as T[]) || [],
      lastEvaluatedKey: output.LastEvaluatedKey,
    };
  }
}
