// Экспорт реальных Swagger-декораторов без подключения к БД/Redis/MinIO.
require('reflect-metadata');
require('ts-node').register({ transpileOnly: true, compilerOptions: {rootDir: process.cwd()} });
const { Module } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { ApplianceApiController } = require('../src/appliance/appliance-api.controller');
const { ApplianceApiService } = require('../src/appliance/appliance-api.service');
const { UserController } = require('../src/user/user.controller');
const { UserService } = require('../src/user/user.service');
const { SessionService } = require('../src/auth/session.service');
const { writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
class ContractModule {}
Module({controllers: [ApplianceApiController, UserController], providers: [ApplianceApiService, UserService, SessionService].map(provide => ({provide, useValue: {}}))})(ContractModule);
(async () => {
 const app = await NestFactory.create(ContractModule, {logger: false});
 const config = new DocumentBuilder().setTitle('Каталог приборов').setVersion('1.0').addCookieAuth('sessionId').build();
 const schema = SwaggerModule.createDocument(app, config);
 writeFileSync(resolve(__dirname, '../frontend/openapi.json'), JSON.stringify(schema, null, 2) + '\n');
 await app.close();
 console.log('frontend/openapi.json экспортирован из Swagger-декораторов. Сервисы и данные не изменены.');
})().catch(error => {console.error(error);process.exitCode=1;});
