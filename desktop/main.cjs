const {app,BrowserWindow,ipcMain,shell,dialog,Tray,Menu,nativeImage}=require('electron');
const {spawn}=require('node:child_process');
const {join}=require('node:path');
const {cp,mkdir,access}=require('node:fs/promises');
const os=require('node:os');

const port=3000,localUrl=`http://127.0.0.1:${port}/`;
let window=null,tray=null,serverProcess=null,closing=false,quitting=false,logLines=[];
const backgroundLaunch=process.argv.includes('--background');
const hasSingleInstanceLock=app.requestSingleInstanceLock();
if(!hasSingleInstanceLock)app.quit();
function paths(){const packaged=app.isPackaged;return{wikiRoot:packaged?join(process.resourcesPath,'wiki'):join(__dirname,'..'),dataDir:packaged?join(app.getPath('userData'),'data'):join(__dirname,'..','data')};}
function iconPath(){return join(__dirname,'assets','smart-wiki.png');}
function log(text){logLines.push(`[${new Date().toLocaleTimeString('zh-CN',{hour12:false})}] ${text}`);logLines=logLines.slice(-120);window?.webContents.send('manager-log',logLines);}
async function ensureData(){const {wikiRoot,dataDir}=paths();await mkdir(dataDir,{recursive:true});if(app.isPackaged){try{await access(join(dataDir,'users.json'));}catch{await cp(join(wikiRoot,'seed-data'),dataDir,{recursive:true,force:false});}}}
async function probe(){try{const response=await fetch(`${localUrl}api/health`,{signal:AbortSignal.timeout(1200)});return response.ok?await response.json():null;}catch{return null;}}
async function startServer(){if(await probe())return true;await ensureData();const {wikiRoot,dataDir}=paths();const env={...process.env,SMART_WIKI_DATA_DIR:dataDir};if(app.isPackaged)env.ELECTRON_RUN_AS_NODE='1';serverProcess=spawn(process.execPath,[join(wikiRoot,'server.mjs')],{cwd:wikiRoot,env,windowsHide:true,stdio:['ignore','pipe','pipe']});serverProcess.stdout.on('data',data=>log(String(data).trim()));serverProcess.stderr.on('data',data=>log(`错误：${String(data).trim()}`));serverProcess.once('exit',code=>{serverProcess=null;log(`服务器已停止${code?`（代码 ${code}）`:''}`);});for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,200));if(await probe()){log('服务器已启动');return true;}}throw new Error('服务器启动超时');}
async function stopServer(){try{await fetch(`${localUrl}api/server/shutdown`,{method:'POST',signal:AbortSignal.timeout(1200)});}catch{}for(let i=0;i<25;i++){if(!(await probe())){serverProcess=null;log('服务器已停止');return true;}await new Promise(r=>setTimeout(r,100));}if(serverProcess&&!serverProcess.killed)serverProcess.kill();return !(await probe());}
async function restartServer(){await stopServer();await startServer();return true;}
function lanAddresses(){const result=[];for(const entries of Object.values(os.networkInterfaces()))for(const item of entries||[])if(item.family==='IPv4'&&!item.internal)result.push(`http://${item.address}:${port}/`);return [...new Set(result)];}
function showWindow(){if(!window||window.isDestroyed())return;window.show();window.restore();window.focus();}
function createWindow(){window=new BrowserWindow({width:980,height:800,minWidth:820,minHeight:650,show:!backgroundLaunch,title:'Smart Wiki 服务端管理器',icon:iconPath(),backgroundColor:'#f5f7fb',autoHideMenuBar:true,webPreferences:{preload:join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false}});window.loadFile(join(__dirname,'manager.html'));window.on('close',event=>{if(closing||quitting)return;event.preventDefault();const choice=dialog.showMessageBoxSync(window,{type:'question',icon:iconPath(),buttons:['隐藏到后台','停止服务器并退出','取消'],defaultId:0,cancelId:2,title:'Smart Wiki 后台运行',message:'是否让服务器继续在后台运行？'});if(choice===2)return;if(choice===0){window.hide();return;}(async()=>{await stopServer();closing=true;window.close();})().catch(()=>{closing=true;window.close();});});}
function createTray(){if(tray)return;let image=nativeImage.createFromPath(iconPath());if(image.isEmpty())throw new Error('托盘图标加载失败');image=image.resize({width:24,height:24,quality:'best'});tray=new Tray(image);tray.setToolTip('Smart Wiki 服务端管理器');tray.setContextMenu(Menu.buildFromTemplate([{label:'打开管理器',click:showWindow},{label:'打开 Smart Wiki',click:()=>shell.openExternal(localUrl)},{type:'separator'},{label:'重新启动服务器',click:()=>restartServer().catch(error=>log(error.message))},{label:'停止服务器并退出',click:async()=>{await stopServer();closing=true;app.quit();}}]));tray.on('click',showWindow);tray.on('double-click',showWindow);}

ipcMain.handle('server-status',async()=>({running:Boolean(await probe()),pid:serverProcess?.pid||null,localUrl,lan:lanAddresses(),logs:logLines}));
ipcMain.handle('server-action',async(_,action)=>{if(action==='start')await startServer();else if(action==='restart')await restartServer();else if(action==='stop')await stopServer();return{running:Boolean(await probe())};});
ipcMain.handle('open-link',(_,path='')=>shell.openExternal(localUrl+path.replace(/^\//,'')));
ipcMain.handle('open-data',()=>shell.openPath(paths().dataDir));
ipcMain.handle('hide-window',()=>window.hide());
ipcMain.handle('online-devices',async()=>{try{const response=await fetch(`${localUrl}api/online-devices`,{signal:AbortSignal.timeout(1500)});return await response.json();}catch{return{count:0,items:[]};}});
ipcMain.handle('site-version-get',async()=>{const response=await fetch(`${localUrl}api/site-version`,{signal:AbortSignal.timeout(1500)});if(!response.ok)throw new Error('无法读取当前版本');return response.json();});
ipcMain.handle('site-version-publish',async(_,data)=>{const response=await fetch(`${localUrl}api/site-version`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(5000)}),result=await response.json();if(!response.ok)throw new Error(result.error||'版本发布失败');return result;});
app.on('second-instance',()=>{if(window)showWindow();});
app.on('before-quit',event=>{if(quitting||!serverProcess)return;event.preventDefault();quitting=true;closing=true;stopServer().finally(()=>app.quit());});
app.whenReady().then(async()=>{if(!hasSingleInstanceLock)return;createWindow();createTray();try{await startServer();}catch(error){log(`启动失败：${error.message}`);}});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();else showWindow();});
