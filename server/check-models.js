import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key:', apiKey ? 'Found' : 'Not found');

if (!apiKey) {
  console.error('Please add GEMINI_API_KEY to your .env file');
  process.exit(1);
}

// List all available models
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
);
const data = await response.json();

console.log('\n=== Available Models ===\n');
if (data.models) {
  data.models.forEach(model => {
    console.log(`Model: ${model.name}`);
    console.log(`Display Name: ${model.displayName}`);
    console.log(`Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
    console.log('---');
  });
} else {
  console.log('Error:', data);
}