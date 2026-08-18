const api=window.smartWikiManager,$=selector=>document.querySelector(selector);let busy=false,currentAddress='',refreshing=false;
function toast(text){const box=$('#toast');box.textContent=text;box.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>box.hidden=true,2200);}
function setBusy(value){busy=value;document.querySelectorAll('[data-action]').forEach(button=>button.classList.toggle('busy',value));}
async function refresh(){
  if(refreshing)return;
  refreshing=true;
  try {
  const [status,online]=await Promise.all([api.status(),api.online()]);
  $('#statusDot').className=`status-dot ${status.running?'running':'stopped'}`;
  $('#statusTitle').textContent=status.running?'服务器正在运行':'服务器已停止';
  $('#statusDetail').textContent=status.running?`PID ${status.pid||'独立进程'} · 本机端口 3000 · 每 10 分钟自动更新知识`:'点击“启动”开启 Smart Wiki 网站服务';
  $('#modeHint').textContent=status.running?'运行中：可以打开网站、重启或停止':'已停止：请先启动服务器';
  currentAddress=status.lan?.[0]||status.localUrl;$('#lanAddress').textContent=currentAddress;
  $('#onlineCount').textContent=`${online.count||0} 台在线`;
  $('#deviceRows').innerHTML=online.items?.length?online.items.map(item=>`<div class="device-row"><span>${escapeText(item.model)}</span><span>${escapeText(item.type)}</span><span>${escapeText(item.browser)}</span><span>${escapeText(item.ip)}</span><span>${new Date(item.lastSeenAt).toLocaleTimeString('zh-CN',{hour12:false})}</span></div>`).join(''):'<p class="empty">暂无在线设备</p>';
  $('#logs').textContent=(status.logs||[]).join('\n')||'暂无运行记录';
  $('[data-action="start"]').disabled=status.running||busy;
  $('[data-action="stop"]').disabled=!status.running||busy;
  $('[data-action="restart"]').disabled=!status.running||busy;
  } finally { refreshing=false; }
}
function escapeText(value){const div=document.createElement('div');div.textContent=String(value??'');return div.innerHTML;}
async function refreshVersion(){try{const settings=await api.getVersion();$('#currentVersion').textContent=`当前 ${settings.version}`;if(!$('#versionNumber').value)$('#versionNumber').value=settings.version;}catch{$('#currentVersion').textContent='服务器启动后可管理';}}
document.addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button)return;
  const action=button.dataset.action,link=button.dataset.link;
  if(action&&!busy){setBusy(true);try{await api.action(action);toast(action==='stop'?'服务器已停止':action==='restart'?'服务器已重新启动':'服务器已启动');}catch(error){toast(error.message||'操作失败');}finally{setBusy(false);await refresh();}}
  if(link!==undefined)api.openLink(link);
});
$('#refresh').onclick=refresh;$('#openData').onclick=()=>api.openData();$('#hideManager').onclick=()=>api.hide();
$('#copyAddress').onclick=async()=>{await navigator.clipboard.writeText(currentAddress);toast('手机访问地址已复制');};
$('#versionForm').onsubmit=async event=>{event.preventDefault();const button=event.currentTarget.querySelector('button'),version=$('#versionNumber').value.trim(),releaseNotes=$('#releaseNotes').value.trim();if(!confirm(`确定发布 Smart Wiki ${version} 吗？\n发布后会向全部用户推送更新通知。`))return;button.disabled=true;try{await api.publishVersion({version,releaseNotes});$('#currentVersion').textContent=`当前 ${version}`;$('#releaseNotes').value='';toast(`Smart Wiki ${version} 已发布`);}catch(error){toast(error.message||'版本发布失败');}finally{button.disabled=false;}};
$('#platformLabel').textContent=`${navigator.platform.includes('Mac')?'MACOS':'DESKTOP'} · 1.0.2`;
api.onLog(lines=>{$('#logs').textContent=lines.join('\n');$('#logs').scrollTop=$('#logs').scrollHeight;});
refresh();refreshVersion();setInterval(refresh,8000);
