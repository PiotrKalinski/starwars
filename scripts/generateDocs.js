const fs = require('fs');
const path = require('path');

// Get the URL from command line arguments
const urlArg = process.argv.find(arg => arg.startsWith('--url='));
if (!urlArg) {
  console.error('Error: URL not provided. Use --url=<your-url>');
  process.exit(1);
}
const apiUrl = urlArg.split('=')[1];

// Read the swagger.yaml file
const swaggerPath = path.join(__dirname, '../swagger.yaml');
let swaggerContent = fs.readFileSync(swaggerPath, 'utf8');

// Replace the placeholder with the actual URL
swaggerContent = swaggerContent.replace('${API_BASE_URL}', apiUrl);

// Write the updated content to a new file
const outputPath = path.join(__dirname, '../swagger-generated.yaml');
fs.writeFileSync(outputPath, swaggerContent);

console.log(`Swagger documentation generated at ${outputPath}`); 