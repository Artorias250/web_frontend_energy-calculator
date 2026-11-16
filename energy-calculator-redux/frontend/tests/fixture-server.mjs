// Изолированный HTTP-стенд только для browser-тестов: рабочие БД и Redis не используются.
import http from 'node:http';
const initial = () => [
 {id:1, applianceName:'Тестовый чайник', description:'Описание тестового чайника', powerWatts:2200, minTemperature:5, publicationStatus:'published', likesCount:0, imageUrl:'http://localhost:9000/appliances/test.png',videoUrl:'http://localhost:9000/appliances/test.mp4',creator:1},
 {id:3, applianceName:'Чужой утюг', description:'Описание утюга', powerWatts:2000, minTemperature:10, publicationStatus:'published', likesCount:0,imageUrl:'',videoUrl:'',creator:2},
];
let rows=initial(),draft=null,liked=false,sequence=0;
const sessions=new Set();
const api=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');const path=url.pathname;
 res.setHeader('Content-Type','application/json');
 const reply=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data));};
 if(path==='/health') return reply(200,{});
 if(path==='/test/reset'){rows=initial();draft=null;liked=false;sessions.clear();return reply(200,{});}
 if(path==='/test/edit'){rows[0].applianceName='Изменено в хранилище';rows[0].powerWatts=2300;return reply(200,{});}
 if(path==='/test/fail'){return reply(500,{message:'Ошибка приложения'});}
 let raw='';for await(const chunk of req)raw+=chunk.toString();
 const token=/(?:^|;\s*)sessionId=([^;]+)/.exec(req.headers.cookie||'')?.[1];const auth=sessions.has(token);
 const format=row=>({...row,isOwner:auth&&row.creator===1?1:0,isLiked:auth&&liked&&row.id===1?1:0});
 if(path==='/api/users/login'){
  const body=JSON.parse(raw);if(body.password!=='test-pass')return reply(401,{message:'Неверная почта или пароль'});
  if(token)sessions.delete(token);const session='test-session-'+(++sequence);sessions.add(session);
  res.setHeader('Set-Cookie',`sessionId=${session}; HttpOnly; Path=/; SameSite=Lax`);
  return reply(200,{userId:1,userName:'Тестовый пользователь',email:body.email});
 }
 if(path==='/api/users/logout'){
  if(!auth)return reply(401,{message:'Требуется вход'});sessions.delete(token);
  res.setHeader('Set-Cookie','sessionId=; HttpOnly; Path=/; Max-Age=0');return reply(200,{message:'Вы вышли из аккаунта'});
 }
 if(path==='/api/appliances'&&req.method==='GET')return reply(200,rows.filter(x=>x.publicationStatus==='published'&&x.powerWatts>=Number(url.searchParams.get('minPower')||0)).map(format));
 if(path.startsWith('/api/appliances/feed')){
  const list=rows.filter(x=>x.publicationStatus==='published');let index=path.split('/')[4]?list.findIndex(x=>x.id===Number(path.split('/')[4])):0;
  if(url.searchParams.get('next')==='true'&&index>=0)index=(index+1)%list.length;
  return list[index]?reply(200,format(list[index])):reply(404,{message:'Прибор не найден'});
 }
 if(!auth)return reply(401,{message:'Требуется вход'});
 if(path==='/api/appliances/draft'&&req.method==='GET')return draft?reply(200,format(draft)):reply(404,{message:'Черновик не найден'});
 if(path==='/api/appliances'&&req.method==='POST'){
  if(!req.headers['content-type']?.includes('multipart/form-data')||!raw.includes('name="image"; filename=')||!raw.includes('name="video"; filename='))return reply(400,{message:'Нужны файлы image и video'});
  const name=/name="applianceName"\r\n\r\n([^\r]+)/.exec(raw)?.[1];
  const created=!draft;draft={...rows[0],id:99,applianceName:name,description:null,powerWatts:null,minTemperature:null,publicationStatus:'draft',creator:1};
  return reply(created?201:200,{id:99,applianceName:name,imageUrl:draft.imageUrl,videoUrl:draft.videoUrl});
 }
 if(path==='/api/appliances/draft'&&req.method==='PUT'){
  if(!draft)return reply(404,{message:'Черновик не найден'});
  draft={...draft,...JSON.parse(raw),publicationStatus:'published'};rows.push(draft);const item=draft;draft=null;return reply(200,format(item));
 }
 const id=Number(path.split('/')[3]);const row=rows.find(x=>x.id===id);
 if(req.method==='DELETE'){
  if(!row)return reply(404,{message:'Прибор не найден'});if(row.creator!==1)return reply(403,{message:'Чужой прибор'});
  row.publicationStatus='deleted';return reply(200,{id,message:'Удалён'});
 }
 if(path.endsWith('/like')){
  liked=JSON.parse(raw).value===1;row.likesCount=liked?1:0;return reply(200,{applianceId:id,value:liked?1:0,isLiked:liked?1:0,likesCount:row.likesCount});
 }
 reply(404,{message:'Неизвестный маршрут'});
});
api.listen(3036,'127.0.0.1');
http.createServer((req,res)=>{
 if(req.url==='/health'){res.end('ok');return;}
 if(req.url==='/appliances/test.png'){
  res.setHeader('Content-Type','image/png');res.end(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6lS8AAAAASUVORK5CYII=','base64'));return;
 }
 res.statusCode=404;res.end();
}).listen(3037,'127.0.0.1');
