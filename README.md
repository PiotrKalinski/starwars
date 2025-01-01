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

3. **Set permissions for the deployment script:**

   Ensure the `deploy.sh` script is executable:

   ```bash
   chmod +x scripts/deploy.sh
   ```

## Deployment

To deploy the service, use the following command:

```bash
npm run deploy -- --stage=xxx
```

Replace `xxx` with your configured profile in AWS config

## Running Locally

To run the service locally, use:

```bash
npm start
```

This will start the serverless-offline plugin, simulating AWS services locally.

## Testing

Run tests with:

```bash
npm test
```

## API Documentation

After a successful deployment, generate the OpenAPI documentation with the deployed URL:

```bash
npm run generate:docs -- --url=https://xxxx.execute-api.us-east-1.amazonaws.com/xxx
```

This command will replace the placeholder in your `swagger.yaml` with the provided URL and output the updated file to `dist/swagger.yaml`.

## Environment Configuration

Environment variables are managed through `serverless.env.yaml` and `serverless-tags.yaml`. Ensure these files are correctly set up for your environment.

## Resources

- **DynamoDB Table:** `MyDynamoDbTable`
- **CloudWatch Alarm:** `MyDynamoDbThrottledRequestsAlarm`

## License

This project is licensed under the MIT License.