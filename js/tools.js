const mdInput=document.querySelector("#markdownInput");
const mdPreview=document.querySelector("#markdownPreview");
const defaultMarkdown=`# Smart Wiki 文档示例

这是一段 **Markdown** 示例。你可以修改内容，并实时查看右侧预览。

## 支持的格式

- 标题与段落
- **粗体** 和 *斜体*
- [网页链接](https://example.com)
- 引用和代码块

> 清晰的结构能让知识更容易阅读。

\`\`\`javascript
console.log("Hello, Smart Wiki!");
\`\`\``;

function escapeHtml(value){const node=document.createElement("div");node.textContent=value;return node.innerHTML;}
function inlineMarkdown(text){return escapeHtml(text).replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*]+)\*/g,"<em>$1</em>").replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');}
function markdownToHtml(markdown){
  const lines=markdown.replace(/\r/g,"").split("\n");let html="",inCode=false,inList=false,code=[];
  const closeList=()=>{if(inList){html+="</ul>";inList=false;}};
  lines.forEach(line=>{
    if(line.trim().startsWith("```")){closeList();if(inCode){html+=`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`;code=[];}inCode=!inCode;return;}
    if(inCode){code.push(line);return;}
    const heading=line.match(/^(#{1,6})\s+(.+)$/);const list=line.match(/^[-*+]\s+(.+)$/);const numbered=line.match(/^\d+\.\s+(.+)$/);
    if(heading){closeList();const level=heading[1].length;html+=`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`;}
    else if(list||numbered){if(!inList){html+="<ul>";inList=true;}html+=`<li>${inlineMarkdown((list||numbered)[1])}</li>`;}
    else if(line.startsWith("> ")){closeList();html+=`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`;}
    else if(line.trim()===""){closeList();}
    else{closeList();html+=`<p>${inlineMarkdown(line)}</p>`;}
  });closeList();if(inCode)html+=`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`;return html;
}
function renderMarkdown(){mdPreview.innerHTML=markdownToHtml(mdInput.value)||'<div class="preview-empty">预览会显示在这里</div>';document.querySelector("#markdownStats").textContent=`${mdInput.value.length} 字符`;}
function showToolToast(text){const toast=document.querySelector("#toolToast");toast.textContent=text;toast.hidden=false;setTimeout(()=>toast.hidden=true,1800);}

document.querySelector(".tool-catalog").insertAdjacentHTML("beforeend",`<button class="tool-choice" data-open-tool="audio"><span>♫</span><strong>音频转换</strong><small>本地转 MP3 / FLAC / WAV</small></button>`);
document.querySelector(".tool-main").insertAdjacentHTML("beforeend",`<article class="mini-tool standalone-audio-tool" hidden><header><span>♫</span><div><h3>本地音频转换器</h3><p>转换你拥有或获授权的本地音频文件</p></div></header><div class="audio-legal-note">仅处理本地文件，不解析网易云、QQ 音乐等平台链接，也不能绕过 DRM 或会员保护。</div><label>选择音频文件<input id="audioConvertInput" type="file" accept="audio/*,.m4a,.aac,.ogg,.flac,.wav,.mp3"></label><div class="audio-convert-options"><label>输出格式<select id="audioConvertFormat"><option value="mp3">MP3</option><option value="flac">FLAC（无损）</option><option value="wav">WAV（无压缩）</option></select></label><label>MP3 音质<select id="audioConvertBitrate"><option value="192k">192 kbps</option><option value="256k">256 kbps</option><option value="320k">320 kbps</option></select></label></div><div class="mini-actions"><button id="convertAudio">开始转换</button></div><small id="audioConvertStatus">第一次使用需要联网加载约 30 MB 的转换组件</small></article>`);
const extraToolDefinitions=[
 ["image","▧","图片压缩","缩小 JPG / PNG / WebP",`<label>选择图片<input id="imageCompressInput" type="file" accept="image/jpeg,image/png,image/webp"></label><label>压缩质量 <output id="imageQualityValue">80%</output><input id="imageQuality" type="range" min="20" max="95" value="80"></label><label>输出格式<select id="imageOutputFormat"><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option><option value="image/png">PNG</option></select></label><div class="mini-actions"><button id="compressImage">压缩并下载</button></div><small id="imageCompressStatus">图片只在本机处理</small>`],
 ["pdf","PDF","PDF 合并 / 拆分","整理本地 PDF 页面",`<label>选择一个或多个 PDF<input id="pdfToolInput" type="file" accept="application/pdf,.pdf" multiple></label><div class="audio-convert-options"><label>拆分页码<input id="pdfPageRange" placeholder="例如 1-3,5；留空为全部"></label><label>操作<select id="pdfAction"><option value="merge">合并所选 PDF</option><option value="split">从第一个 PDF 提取页面</option></select></label></div><div class="mini-actions"><button id="runPdfTool">开始处理</button></div><small id="pdfToolStatus">首次使用需要联网加载 PDF 组件</small>`],
 ["unit","↔","单位换算","长度、重量、温度与数据",`<label>换算类别<select id="unitCategory"><option value="length">长度</option><option value="weight">重量</option><option value="temperature">温度</option><option value="data">数据容量</option></select></label><div class="audio-convert-options"><label>数值<input id="unitValue" type="number" value="1" step="any"></label><label>从<select id="unitFrom"></select></label><label>转换为<select id="unitTo"></select></label></div><div class="mini-actions"><button id="convertUnit">开始换算</button></div><strong id="unitResult">等待换算</strong>`],
 ["hash","#","文件哈希校验","计算 SHA-256 / SHA-1",`<label>选择文件<input id="hashFileInput" type="file"></label><label>算法<select id="hashAlgorithm"><option value="SHA-256">SHA-256</option><option value="SHA-1">SHA-1</option></select></label><div class="mini-actions"><button id="calculateHash">计算哈希</button><button data-copy="hashResult">复制结果</button></div><textarea id="hashResult" readonly placeholder="哈希值会显示在这里"></textarea><small>适合校验文件是否完整；大文件计算需要一些时间</small>`],
 ["width","Ａ","全角 / 半角转换","适合字幕和中英文排版",`<textarea id="widthTextInput" placeholder="粘贴字幕或文字…"></textarea><div class="mini-actions"><button id="toHalfWidth">转半角</button><button id="toFullWidth">转全角</button><button data-copy="widthTextInput">复制</button></div><small>会转换英文字母、数字、常用符号与空格，中文保持不变</small>`],
 ["gif","GIF","视频转 GIF","截取本地视频生成动图",`<label>选择视频<input id="gifVideoInput" type="file" accept="video/*"></label><div class="audio-convert-options"><label>开始秒数<input id="gifStart" type="number" min="0" value="0" step="0.1"></label><label>时长（最多 15 秒）<input id="gifDuration" type="number" min="1" max="15" value="5"></label><label>宽度<select id="gifWidth"><option value="480">480 px</option><option value="640">640 px</option><option value="320">320 px</option></select></label></div><div class="mini-actions"><button id="convertGif">生成 GIF</button></div><small id="gifStatus">视频只在本机处理；首次使用需要加载转换组件</small>`]
];
extraToolDefinitions.forEach(([name,icon,title,subtitle,content])=>{document.querySelector(".tool-catalog").insertAdjacentHTML("beforeend",`<button class="tool-choice" data-open-tool="${name}"><span>${icon}</span><strong>${title}</strong><small>${subtitle}</small></button>`);document.querySelector(".tool-main").insertAdjacentHTML("beforeend",`<article class="mini-tool standalone-extra-tool" hidden><header><span>${icon}</span><div><h3>${title}</h3><p>${subtitle}</p></div></header>${content}</article>`);});
const toolNames=["markdown","json","diff","qr","time","codec","password","audio",...extraToolDefinitions.map(item=>item[0])];
function openToolDirectory(name=""){
  const catalog=document.querySelector(".tool-catalog"),back=document.querySelector("#toolDirectoryBack"),miniTools=[...document.querySelectorAll(".mini-tool")];
  const heading=document.querySelector(".tool-heading h1"),description=document.querySelector(".tool-heading p"),selected=document.querySelector(`[data-open-tool="${name}"]`);heading.textContent=name?(selected?.querySelector("strong")?.textContent||"实用工具"):"Smart Wiki 实用工具箱";description.textContent=name?(selected?.querySelector("small")?.textContent||"在当前设备中完成处理"):"先选择需要的工具再进入操作。文档、图片、音视频和文件尽量只在当前设备本地处理。";
  document.body.classList.toggle("tool-selected",Boolean(name));
  catalog.hidden=Boolean(name);back.hidden=!name;
  document.querySelector(".converter-tabs").hidden=name!=="markdown";
  document.querySelector("#mdToWordPanel").hidden=name!=="markdown";
  if(name!=="markdown")document.querySelector("#wordToMdPanel").hidden=true;
  document.querySelector(".tool-notes").hidden=name!=="markdown";
  miniTools.forEach((tool,index)=>tool.hidden=name!==toolNames[index+1]);
  if(name)requestAnimationFrame(()=>back.scrollIntoView({behavior:"smooth",block:"start"}));
}
document.querySelectorAll("[data-open-tool]").forEach(button=>button.addEventListener("click",()=>openToolDirectory(button.dataset.openTool)));
document.querySelector("#toolDirectoryBack").addEventListener("click",()=>openToolDirectory());
openToolDirectory();
function loadExternalScript(src,globalName){return new Promise((resolve,reject)=>{if(globalThis[globalName])return resolve();const script=document.createElement("script");script.src=src;script.onload=resolve;script.onerror=()=>reject(new Error("转换组件加载失败，请检查网络"));document.head.appendChild(script);});}
let audioFFmpeg=null;
async function ensureAudioFFmpeg(){if(audioFFmpeg)return audioFFmpeg;const status=document.querySelector("#audioConvertStatus");status.textContent="正在加载本地转换组件…";await loadExternalScript("https://unpkg.com/@ffmpeg/ffmpeg@0.12.15/dist/umd/ffmpeg.js","FFmpegWASM");await loadExternalScript("https://unpkg.com/@ffmpeg/util@0.12.2/dist/umd/index.js","FFmpegUtil");audioFFmpeg=new FFmpegWASM.FFmpeg();const base="https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";await audioFFmpeg.load({coreURL:await FFmpegUtil.toBlobURL(`${base}/ffmpeg-core.js`,"text/javascript"),wasmURL:await FFmpegUtil.toBlobURL(`${base}/ffmpeg-core.wasm`,"application/wasm")});status.textContent="转换组件已就绪，文件只在本机内存中处理";return audioFFmpeg;}
document.querySelector("#audioConvertFormat").addEventListener("change",event=>{const format=event.target.value;document.querySelector("#audioConvertBitrate").closest("label").hidden=format!=="mp3";document.querySelector("#audioConvertStatus").textContent=format==="mp3"?"MP3 使用所选码率进行有损压缩":format==="flac"?"FLAC 为无损压缩；不会恢复源文件已经损失的音质":"WAV 为未压缩 PCM；不会恢复源文件已经损失的音质";});
document.querySelector("#convertAudio").addEventListener("click",async()=>{const input=document.querySelector("#audioConvertInput"),file=input.files[0],format=document.querySelector("#audioConvertFormat").value,status=document.querySelector("#audioConvertStatus"),button=document.querySelector("#convertAudio");if(!file){showToolToast("请先选择本地音频文件");return;}if(file.size>150*1024*1024){showToolToast("为避免浏览器内存不足，请选择小于 150 MB 的文件");return;}button.disabled=true;button.textContent="正在转换…";try{const ffmpeg=await ensureAudioFFmpeg(),extension=(file.name.split(".").pop()||"audio").replace(/[^a-z0-9]/gi,"").toLowerCase(),inputName=`input.${extension}`,outputName=`smart-wiki-audio.${format}`;await ffmpeg.writeFile(inputName,await FFmpegUtil.fetchFile(file));const args=format==="mp3"?["-i",inputName,"-vn","-c:a","libmp3lame","-b:a",document.querySelector("#audioConvertBitrate").value,outputName]:format==="flac"?["-i",inputName,"-vn","-c:a","flac",outputName]:["-i",inputName,"-vn","-c:a","pcm_s16le",outputName];status.textContent="正在转换，请保持页面打开…";await ffmpeg.exec(args);const data=await ffmpeg.readFile(outputName),mime=format==="mp3"?"audio/mpeg":format==="flac"?"audio/flac":"audio/wav";downloadBlob(new Blob([data.buffer],{type:mime}),`${file.name.replace(/\.[^.]+$/,"")}.${format}`);await ffmpeg.deleteFile(inputName);await ffmpeg.deleteFile(outputName);status.textContent="转换完成，文件已下载";showToolToast("音频转换完成");}catch(error){status.textContent=error.message||"转换失败，请换一个文件重试";showToolToast("音频转换失败");}finally{button.disabled=false;button.textContent="开始转换";}});
function downloadBlob(blob,name){const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

document.querySelectorAll(".converter-tab").forEach(tab=>tab.addEventListener("click",()=>{document.querySelectorAll(".converter-tab").forEach(item=>item.classList.toggle("active",item===tab));document.querySelector("#mdToWordPanel").hidden=tab.dataset.mode!=="md-to-word";document.querySelector("#wordToMdPanel").hidden=tab.dataset.mode!=="word-to-md";}));
mdInput.value=defaultMarkdown;mdInput.addEventListener("input",renderMarkdown);renderMarkdown();
document.querySelector("#clearMarkdown").addEventListener("click",()=>{mdInput.value="";renderMarkdown();mdInput.focus();});
document.querySelector("#markdownFile").addEventListener("change",async event=>{const file=event.target.files[0];if(!file)return;mdInput.value=await file.text();renderMarkdown();});
document.querySelector("#exportWord").addEventListener("click",()=>{if(!mdInput.value.trim()){showToolToast("请先输入 Markdown 内容");return;}const body=markdownToHtml(mdInput.value);const documentHtml=`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Calibri,'Microsoft YaHei',sans-serif;line-height:1.7;color:#20242c;max-width:760px;margin:40px auto}h1{font-size:28pt}h2{font-size:20pt;color:#3730a3}blockquote{border-left:4px solid #4f46e5;padding:8px 16px;color:#5c6370;background:#f4f5ff}pre{padding:14px;background:#f3f4f6}code{font-family:Consolas,monospace}a{color:#4f46e5}</style></head><body>${body}</body></html>`;downloadBlob(new Blob(["\ufeff",documentHtml],{type:"application/msword"}),"smart-wiki-document.doc");showToolToast("Word 文档已导出");});

const wordInput=document.querySelector("#wordFile");const dropZone=document.querySelector("#wordDropZone");const wordResult=document.querySelector("#wordResult");const wordOutput=document.querySelector("#wordMarkdownOutput");
async function convertWord(file){
  if(!file||!file.name.toLowerCase().endsWith(".docx")){showToolToast("请选择 .docx 文件");return;}
  if(typeof mammoth==="undefined"||typeof TurndownService==="undefined"){showToolToast("转换组件加载失败，请检查网络后刷新");return;}
  try{dropZone.classList.add("processing");const result=await mammoth.convertToHtml({arrayBuffer:await file.arrayBuffer()});const turndown=new TurndownService({headingStyle:"atx",bulletListMarker:"-",codeBlockStyle:"fenced"});const markdown=turndown.turndown(result.value);wordOutput.value=markdown;document.querySelector("#wordPreview").innerHTML=markdownToHtml(markdown);document.querySelector("#wordFileName").textContent=file.name;document.querySelector("#wordStatus").textContent=result.messages.length?`已完成 · ${result.messages.length} 条提示`:"转换完成";dropZone.hidden=true;wordResult.hidden=false;showToolToast("Word 已转换为 Markdown");}catch(error){showToolToast("无法读取该文档，请确认文件有效");}finally{dropZone.classList.remove("processing");}
}
wordInput.addEventListener("change",event=>convertWord(event.target.files[0]));
["dragenter","dragover"].forEach(name=>dropZone.addEventListener(name,event=>{event.preventDefault();dropZone.classList.add("dragging");}));["dragleave","drop"].forEach(name=>dropZone.addEventListener(name,event=>{event.preventDefault();dropZone.classList.remove("dragging");}));dropZone.addEventListener("drop",event=>convertWord(event.dataTransfer.files[0]));
document.querySelector("#chooseAnother").addEventListener("click",()=>{wordResult.hidden=true;dropZone.hidden=false;wordInput.value="";});
document.querySelector("#copyMarkdown").addEventListener("click",async()=>{await navigator.clipboard.writeText(wordOutput.value);showToolToast("Markdown 已复制");});
document.querySelector("#downloadMarkdown").addEventListener("click",()=>downloadBlob(new Blob([wordOutput.value],{type:"text/markdown;charset=utf-8"}),"converted-document.md"));
wordOutput.addEventListener("input",()=>document.querySelector("#wordPreview").innerHTML=markdownToHtml(wordOutput.value));
document.body.insertAdjacentHTML("beforeend",'<div class="site-version">Smart Wiki · Version 1.0.2</div>');
