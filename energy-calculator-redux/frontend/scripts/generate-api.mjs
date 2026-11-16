import { generateApi } from 'swagger-typescript-api';
import { resolve } from 'node:path';
await generateApi({
  name: 'Api.ts',
  output: resolve('src/api/generated'),
  ...(process.env.OPENAPI_URL
    ? { url: process.env.OPENAPI_URL }
    : { input: resolve('openapi.json') }),
  httpClientType: 'axios',
  generateClient: true,
  generateResponses: true,
});
