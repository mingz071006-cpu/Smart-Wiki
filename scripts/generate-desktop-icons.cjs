const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const out=path.join(__dirname,'..','desktop','assets');fs.mkdirSync(out,{recursive:true});
const size=512,data=Buffer.alloc(size*size*4);
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=(y*size+x)*4,dx=Math.min(x,size-1-x),dy=Math.min(y,size-1-y),r=54;
  const cornerX=Math.max(0,r-dx),cornerY=Math.max(0,r-dy),inside=cornerX*cornerX+cornerY*cornerY<=r*r;
  if(!inside)continue;
  const t=(x+y)/(size*2),a=[73,55,222],b=[112,83,247];
  data[i]=Math.round(a[0]*(1-t)+b[0]*t);data[i+1]=Math.round(a[1]*(1-t)+b[1]*t);data[i+2]=Math.round(a[2]*(1-t)+b[2]*t);data[i+3]=255;
}
// Geometric white S mark, kept thick so it stays readable in the Windows tray.
function fill(x0,y0,x1,y1,c=[255,255,255,255]){for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*size+x)*4;data.set(c,i);}}
fill(152,116,362,168);fill(122,152,182,262);fill(152,224,360,280);fill(330,252,390,362);fill(150,344,360,398);
function crc32(buf){let c=0xffffffff;for(const n of buf){c^=n;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
function chunk(type,payload){const t=Buffer.from(type),len=Buffer.alloc(4),crc=Buffer.alloc(4);len.writeUInt32BE(payload.length);crc.writeUInt32BE(crc32(Buffer.concat([t,payload])));return Buffer.concat([len,t,payload,crc]);}
const raw=Buffer.alloc((size*4+1)*size);for(let y=0;y<size;y++){raw[y*(size*4+1)]=0;data.copy(raw,y*(size*4+1)+1,y*size*4,(y+1)*size*4);}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
fs.writeFileSync(path.join(out,'smart-wiki.png'),png);
const header=Buffer.alloc(22);header.writeUInt16LE(0,0);header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);header[6]=0;header[7]=0;header[8]=0;header[9]=0;header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);
fs.writeFileSync(path.join(out,'smart-wiki.ico'),Buffer.concat([header,png]));
console.log('Desktop icons generated.');
