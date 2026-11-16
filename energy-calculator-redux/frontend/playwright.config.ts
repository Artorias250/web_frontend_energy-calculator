import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir: './tests', workers: 1,
 use: { baseURL: 'http://localhost:5173', viewport: {width:390,height:844}, browserName:'chromium' },
 webServer: [
  {command:'node tests/fixture-server.mjs',url:'http://127.0.0.1:3036/health',reuseExistingServer:false},
  {command:'npm run dev',url:'http://127.0.0.1:5173',reuseExistingServer:false,
   env:{API_TARGET:'http://127.0.0.1:3036',S3_TARGET:'http://127.0.0.1:3037'}},
 ],
});
