const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('smartWikiManager',{
  status:()=>ipcRenderer.invoke('server-status'),
  action:value=>ipcRenderer.invoke('server-action',value),
  openLink:path=>ipcRenderer.invoke('open-link',path),
  openData:()=>ipcRenderer.invoke('open-data'),
  hide:()=>ipcRenderer.invoke('hide-window'),
  online:()=>ipcRenderer.invoke('online-devices'),
  getVersion:()=>ipcRenderer.invoke('site-version-get'),
  publishVersion:data=>ipcRenderer.invoke('site-version-publish',data),
  onLog:callback=>ipcRenderer.on('manager-log',(_,lines)=>callback(lines))
});
