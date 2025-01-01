"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDbService = void 0;
// src/services/dynamodbService.ts
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
/**
 * A generic DynamoDB service (AWS SDK v3) that can be initialized with a table name.
 * T represents the item type (for strong typing).
 */
class DynamoDbService {
    client;
    tableName;
    /**
     * @param tableName - DynamoDB table name
     * @param config - (Optional) Configuration for DynamoDBClient
     */
    constructor(tableName, config) {
        this.tableName = tableName;
        this.client = new client_dynamodb_1.DynamoDBClient(config || {});
    }
    /**
     * Get an item by its key.
     */
    async getItem(key) {
        const command = new lib_dynamodb_1.GetCommand({
            TableName: this.tableName,
            Key: key
        });
        const result = await this.client.send(command);
        return result.Item ?? null;
    }
    /**
     * Put (create or overwrite) an item.
     */
    async putItem(item) {
        const command = new lib_dynamodb_1.PutCommand({
            TableName: this.tableName,
            Item: item
        });
        return this.client.send(command);
    }
    /**
     * Update an item. (Simple approach: fully custom update expression.)
     */
    async updateItem(key, updates) {
        const updateExpressionParts = [];
        const expressionAttributeValues = {};
        Object.entries(updates).forEach(([field, value]) => {
            updateExpressionParts.push(`${field} = :${field}`);
            expressionAttributeValues[`:${field}`] = value;
        });
        const updateExpression = `SET ${updateExpressionParts.join(", ")}`;
        const command = new lib_dynamodb_1.UpdateCommand({
            TableName: this.tableName,
            Key: key,
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "ALL_NEW"
        });
        return this.client.send(command);
    }
    /**
     * Delete an item by its key.
     */
    async deleteItem(key) {
        const command = new lib_dynamodb_1.DeleteCommand({
            TableName: this.tableName,
            Key: key
        });
        return this.client.send(command);
    }
    /**
     * Scan with pagination. This scans a single page of results using DynamoDB's Limit and
     * ExclusiveStartKey to handle "paging" at the DynamoDB level.
     */
    async scanPaginated(limit, exclusiveStartKey) {
        const command = new lib_dynamodb_1.ScanCommand({
            TableName: this.tableName,
            Limit: limit,
            ExclusiveStartKey: exclusiveStartKey
        });
        const output = await this.client.send(command);
        return {
            items: output.Items || [],
            lastEvaluatedKey: output.LastEvaluatedKey
        };
    }
}
exports.DynamoDbService = DynamoDbService;
