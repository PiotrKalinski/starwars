# Star Wars Serverless API

This project is a serverless REST API for managing Star Wars characters, built using Node.js and TypeScript. It leverages AWS services such as Lambda, DynamoDB, and API Gateway.

## Prerequisites

- Node.js and npm installed
- AWS CLI configured with appropriate credentials
- Serverless Framework installed globally

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build the project:**

   ```bash
   npm run build
   ```

3. **Set permissions for the deployment and removal scripts:**

   Ensure the `deploy.sh` and `remove.sh` scripts are executable:

   ```bash
   chmod +x scripts/deploy.sh
   chmod +x scripts/remove.sh
   ```

## Deployment

To deploy the service, use the following command:

```bash
npm run deploy -- --stage=<stage-name>
```

Replace `<stage-name>` with your configured profile in AWS config.

## Removal

To remove the deployed service, use the following command:

```bash
npm run remove -- --stage=<stage-name>
```

This will remove the stack for the specified stage.


## Testing

Run tests with:

```bash
npm test
```

## API Documentation

After a successful deployment, generate the OpenAPI documentation with the deployed URL:

```bash
npm run generate:docs -- --url=https://<api-id>.execute-api.us-east-1.amazonaws.com/<stage-name>
```

This command will replace the placeholder in your `swagger.yaml` with the provided URL and output the updated file to `dist/swagger.yaml`.

## Environment Configuration

Environment variables are managed through `serverless.env.yaml` and `serverless-tags.yaml`. Ensure these files are correctly set up for your environment.

## Resources

- **DynamoDB Table:** `<stage-name>-StarWarsCharacters`
- **CloudWatch Alarm:** `<stage-name>-DynamoDbThrottledRequestsAlarm`

## License

This project is licensed under the MIT License.