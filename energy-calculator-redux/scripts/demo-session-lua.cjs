const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { randomUUID } = require('node:crypto');
const Redis = require('ioredis');
require('dotenv').config({ path: join(__dirname, '../.env'), quiet: true });

async function main() {
  const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
    lazyConnect: true,
    connectTimeout: 3000,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });
  redis.on('error', () => {});
  const key = `lab4:lua-demo:${randomUUID()}`;
  const script = readFileSync(
    join(__dirname, '../src/auth/lua/get-session.lua'),
    'utf8',
  );
  try {
    await redis.connect();
    console.log('ЛР4. Lua-скрипт чтения сессии из Redis');
    console.log('Файл: src/auth/lua/get-session.lua');
    console.log('Используется отдельный демонстрационный ключ, userId = 42.');
    await redis.set(key, '42', 'EX', 3600);
    const before = await redis.pttl(key);
    const result = await redis.eval(script, 1, key);
    const after = await redis.pttl(key);
    console.log(`EVAL get-session.lua: ID пользователя = ${result}`);
    console.log(`TTL сессии = ${await redis.ttl(key)} сек.`);
    assert.equal(result, '42');
    assert(after > 0 && after <= before);
    console.log('Чтение не продлевает срок сессии: проверено.');
    await redis.del(key);
    assert.equal(await redis.eval(script, 1, key), null);
    console.log('Отсутствующая сессия: nil.');
    await redis.set(key, '42', 'EX', 60);
    await redis.pexpireat(key, Date.now() - 1);
    assert.equal(await redis.eval(script, 1, key), null);
    console.log('Истёкшая сессия: nil.');
    console.log('Все проверки пройдены.');
  } finally {
    if (redis.status === 'ready') {
      await redis.del(key);
      console.log('Временные ключи удалены.');
    }
    redis.disconnect();
  }
}

main().catch((error) => {
  console.error('Ошибка демонстрации:', error.message);
  process.exitCode = 1;
});
