import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
test.beforeEach(async ({request,page}) => { page.on('pageerror', e=>console.error('PAGE ERROR', e.message)); await request.get('http://127.0.0.1:3036/test/reset'); });
async function signIn(page:Page) {
 await page.goto('/login');await page.getByLabel('Электронная почта').fill('test@example.com');
 await page.getByLabel('Пароль').fill('test-pass');await page.getByRole('button',{name:'Войти',exact:true}).click();
 await expect(page.getByRole('button',{name:'Выход',exact:true})).toBeVisible();
 await expect(page.locator('.appliance-card')).toHaveCount(2);
 await expect(page.locator('.loading-overlay')).toHaveCount(0);
}
test('Гость: API через прокси, S3 через второй прокси, фильтр и новые данные',async({page,request})=>{
 const addresses:string[]=[];page.on('request',r=>addresses.push(r.url()));
 await page.goto('/');await expect(page.locator('.appliance-card')).toHaveCount(2);
 await expect(page.locator('.delete-button')).toHaveCount(0);
 await expect(page.locator('.appliance-card img').first()).toHaveAttribute('src','/s3/appliances/test.png');
 await expect(page.locator('.appliance-card img').first()).toHaveJSProperty('naturalWidth',1);
 expect(addresses.some(x=>x.includes('localhost:5173/api/appliances?minPower=0'))).toBe(true);
 expect(addresses.some(x=>x.includes('localhost:5173/s3/appliances/test.png'))).toBe(true);
 const slider=page.getByRole('slider');await slider.fill('2250');
 await page.getByRole('button',{name:'ОК',exact:true}).click();await expect(page.locator('.appliance-card')).toHaveCount(0);
 await request.get('http://127.0.0.1:3036/test/edit');await page.getByRole('button',{name:'Обновить список'}).click();
 await expect(page.getByRole('heading',{name:'Изменено в хранилище'})).toBeVisible();
 await page.getByRole('link',{name:'Лента',exact:true}).click();await expect(page.locator('.feed-page')).toBeVisible();
 await page.getByRole('link',{name:'Плитка',exact:true}).click();await expect(page.getByRole('slider')).toHaveValue('2250');
});
test('Нет бэкенда: только гостевые mock, фильтр, default media и next',async({page})=>{
 await page.route(/\/api\/(appliances|users)(\/|\?|$)/,r=>r.abort());await page.goto('/');
 await expect(page.locator('.appliance-card')).toHaveCount(6);await expect(page.getByText('Сервер недоступен.',{exact:false})).toBeVisible();
 await page.getByRole('slider').fill('2000');await page.getByRole('button',{name:'ОК',exact:true}).click();await expect(page.locator('.appliance-card')).toHaveCount(2);
 await page.goto('/appliances-feed/24');await expect(page.locator('video')).toHaveAttribute('src','/media/default.mp4');
 await expect(page.getByRole('button',{name:'Лайки доступны после входа'})).toBeDisabled();
 await page.getByRole('button',{name:'Далее',exact:true}).click();await expect(page).toHaveURL(/appliances-feed\/1$/);
 await page.goto('/appliances-draft');await expect(page).toHaveURL(/login$/);
});
test('Авторизация: неверный пароль, права владельца, F5 сохраняет HttpOnly cookie, выход сбрасывает фильтр',async({page,context})=>{
 await page.goto('/login');await page.getByLabel('Электронная почта').fill('test@example.com');await page.getByLabel('Пароль').fill('wrong');
 await page.getByRole('button',{name:'Войти',exact:true}).click();await expect(page.getByText('Неверная почта или пароль')).toBeVisible();
 await signIn(page);await expect(page.locator('.delete-button')).toHaveCount(1);
 const cookie=(await context.cookies()).find(x=>x.name==='sessionId');expect(cookie?.httpOnly).toBe(true);
 await page.reload();await expect(page.getByRole('link',{name:'Вход',exact:true})).toBeVisible();await expect(page.locator('.appliance-card')).toHaveCount(2);
 await expect(page.locator('.delete-button')).toHaveCount(0);expect((await context.cookies()).find(x=>x.name==='sessionId')?.value).toBe(cookie?.value);
 expect(await page.evaluate(()=>document.cookie)).not.toContain('sessionId');
 await signIn(page);await page.getByRole('slider').fill('2000');await page.getByRole('button',{name:'ОК',exact:true}).click();
 await expect(page.locator('.loading-overlay')).toHaveCount(0);await page.getByRole('button',{name:'Выход',exact:true}).click();
 await expect(page.getByRole('slider')).toHaveValue('0');await expect(page.getByRole('link',{name:'Вход',exact:true})).toBeVisible();
 expect((await context.cookies()).find(x=>x.name==='sessionId')).toBeUndefined();
});
test('Создание multipart, публикация, лайк, отмена лайка, soft delete',async({page})=>{
 await signIn(page);await page.getByRole('link',{name:'Добавление',exact:true}).click();
 await expect(page.getByRole('button',{name:'Далее',exact:true})).toBeVisible();
 await expect(page.getByLabel('Описание', {exact:true})).toHaveCount(0);
 await page.getByLabel('Название устройства').fill('Прибор для отчёта');
 await page.getByLabel('Фотография',{exact:true}).setInputFiles('public/media/default.png');
 await page.getByLabel('Видеозапись',{exact:true}).setInputFiles('public/media/default.mp4');
 const sent=page.waitForRequest(r=>r.method()==='POST'&&new URL(r.url()).pathname==='/api/appliances');
 await page.getByRole('button',{name:'Далее',exact:true}).click();
 expect((await sent).headers()['content-type']).toContain('multipart/form-data; boundary=');
 await expect(page.getByRole('button',{name:'Опубликовать',exact:true})).toBeVisible();
 await page.getByLabel('Описание',{exact:true}).fill('Описание нового прибора');await page.getByLabel('Мощность (Вт)',{exact:true}).fill('1500');
 await page.getByLabel('Мин. температура (°C)',{exact:true}).fill('5');await page.getByRole('button',{name:'Опубликовать',exact:true}).click();
 await expect(page).toHaveURL(/appliances-feed\/99$/);await expect(page.getByRole('heading',{name:'Прибор для отчёта'})).toBeVisible();
 await page.getByRole('link',{name:'Лента',exact:true}).click();await expect(page.locator('.feed-page')).toHaveAttribute('aria-label','Тестовый чайник');
 await page.getByRole('button',{name:'Поставить лайк',exact:true}).click();await expect(page.getByRole('button',{name:'Снять лайк',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Снять лайк',exact:true}).click();await expect(page.getByRole('button',{name:'Поставить лайк',exact:true})).toHaveAttribute('aria-pressed','false');
 await page.getByRole('link',{name:'Плитка',exact:true}).click();await expect(page.locator('.appliance-card')).toHaveCount(3);
 await page.locator('.appliance-card').filter({hasText:'Прибор для отчёта'}).getByRole('button',{name:'Удалить'}).click();
 await expect(page.locator('.appliance-card')).toHaveCount(2);
});
test('Ошибки 403/500 не заменяются mock; загрузка блокирует действия',async({page})=>{
 await signIn(page);
 await page.route('**/api/appliances?*',async r=>{await new Promise(resolve=>setTimeout(resolve,300));await r.fulfill({status:500,json:{message:'Ошибка приложения'}});});
 await page.getByRole('button',{name:'Обновить список'}).click();await expect(page.locator('.loading-overlay')).toBeVisible();await expect(page.getByRole('button',{name:'ОК',exact:true})).toBeDisabled();
 await expect(page.getByText('Ошибка приложения')).toBeVisible();await expect(page.getByText('Сервер недоступен.',{exact:false})).toHaveCount(0);
 await page.route('**/api/appliances/1',r=>r.fulfill({status:403,json:{message:'Нет права удаления'}}));
 await page.getByRole('button',{name:'Удалить',exact:true}).click();await expect(page.getByText('Нет права удаления')).toBeVisible();await expect(page.locator('.appliance-card')).toHaveCount(2);
});
test('Потеря связи после входа переключает в гостя; 401 закрывает пользовательские действия',async({page})=>{
 await signIn(page);await page.route(/\/api\/(appliances|users)(\/|\?|$)/,r=>r.abort());await page.getByRole('button',{name:'Обновить список'}).click();
 await expect(page.locator('.appliance-card')).toHaveCount(6);await expect(page.getByRole('link',{name:'Вход',exact:true})).toBeVisible();
 await page.unroute(/\/api\/(appliances|users)(\/|\?|$)/);await signIn(page);
 await page.route('**/api/appliances/1',r=>r.fulfill({status:401,json:{message:'Сессия истекла'}}));
 await page.getByRole('button',{name:'Удалить',exact:true}).click();await expect(page.getByRole('link',{name:'Вход',exact:true})).toBeVisible();await expect(page.locator('.delete-button')).toHaveCount(0);
});
test('Мобильный и настольный интерфейсы без JS-ошибок и горизонтальной прокрутки',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:844});
  for(const path of ['/appliances-catalog','/appliances-feed/1','/login']){
   await page.goto(path);await expect(page.locator('.loading-overlay')).toHaveCount(0);await expect(page.locator('h1')).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 }
 expect(errors).toEqual([]);
});
