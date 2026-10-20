export type LinkState='simulated'|'connecting'|'connected'|'disconnected';
export type Context={challengeId:string;contentId:string;target:string};
export type Packet={v:1;type:string;sessionId:string;challengeId:string;seq:number;payload:Record<string,unknown>};
export type DeviceView={state:LinkState;letters:string[];fresh:boolean;message:string;hint?:{id:string;text:string}};
export interface DeviceAdapter {view:DeviceView;subscribe(fn:()=>void):()=>void;start(c:Context):void;send(type:string,payload?:Record<string,unknown>):void;disconnect():void;reconnect():void;dispose():void;}
export class MessageGate {
 seq=-1;constructor(public sessionId:string,public challengeId:string){}
 accept(p:unknown):p is Packet {const v=p as Packet;if(!v||v.v!==1||v.sessionId!==this.sessionId||v.challengeId!==this.challengeId||!Number.isSafeInteger(v.seq)||v.seq<=this.seq||typeof v.type!=='string'||!v.payload||typeof v.payload!=='object')return false;if(v.type==='letters.snapshot'&&(!Array.isArray(v.payload.letters)||v.payload.letters.length>10||!v.payload.letters.every(x=>typeof x==='string'&&/^[A-Z]$/.test(x))))return false;this.seq=v.seq;return true;}
}
class Observable {listeners=new Set<()=>void>();view:DeviceView={state:'disconnected',letters:[],fresh:false,message:''};subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn);}};emit(next:Partial<DeviceView>){this.view={...this.view,...next};this.listeners.forEach(f=>f());}}
export class SimulatedToy extends Observable implements DeviceAdapter {
 private context?:Context;private blocks:string[]=[];private online=true;
 constructor(){super();this.view={state:'simulated',letters:[],fresh:true,message:'Simulated toy'};}
 start(c:Context){if(this.context?.challengeId!==c.challengeId)this.blocks=[];this.context=c;this.emit({letters:[...this.blocks],fresh:this.online,hint:undefined});}
 add(letter:string){if(this.online&&this.blocks.length<10&&/^[A-Z]$/.test(letter)){this.blocks.push(letter);this.snapshot();}}
 remove(index:number){if(this.online){this.blocks.splice(index,1);this.snapshot();}}
 clear(){if(this.online){this.blocks=[];this.snapshot();}}
 private snapshot(){this.emit({letters:[...this.blocks],fresh:true,hint:undefined});}
 send(type:string){if(type==='state.request'&&this.online)this.snapshot();if(type==='hint.cancel')this.emit({hint:undefined});}
 disconnect(){this.online=false;this.emit({state:'disconnected',fresh:false,message:'Toy paused. Reconnect to keep building.',hint:undefined});}
 reconnect(){this.emit({state:'connecting',fresh:false,message:'Finding your toy…'});this.online=true;this.emit({state:'simulated',message:'Simulated toy'});this.send('state.request');}
 dispose(){this.listeners.clear();}
}
export class WebSocketToy extends Observable implements DeviceAdapter {
 private socket?:WebSocket;private context?:Context;private sid='';private seq=0;private gate?:MessageGate;private timer?:ReturnType<typeof setTimeout>;private hintId?:string;
 constructor(private endpoint:string){super();}
 start(c:Context){this.context=c;this.hintId=undefined;this.gate=new MessageGate(this.sid,c.challengeId);this.emit({letters:[],fresh:false,hint:undefined});if(this.socket?.readyState===WebSocket.OPEN){this.send('challenge.start',{contentId:c.contentId,target:c.target,helperMode:'app-orchestrated'});this.send('state.request');this.waitForSnapshot();}}
 private waitForSnapshot(){clearTimeout(this.timer);this.timer=setTimeout(()=>{if(!this.view.fresh){this.emit({state:'disconnected',fresh:false,message:'The toy did not send its letters. Check that the firmware supports the SpellSnap protocol.'});this.socket?.close();}},8000);}
 reconnect(){this.disconnect();let url:URL;try{url=new URL(this.endpoint);if(!['ws:','wss:'].includes(url.protocol))throw Error();}catch{this.emit({message:'Enter a WebSocket address starting with ws:// or wss://.'});return;}
 if(location.protocol==='https:'&&url.protocol==='ws:'){this.emit({message:'This secure page cannot use an insecure toy connection. Use a trusted wss:// relay, or the documented local development setup.'});return;}
 this.sid=crypto.randomUUID();this.seq=0;this.gate=new MessageGate(this.sid,this.context?.challengeId??'');this.emit({state:'connecting',letters:[],fresh:false,message:'Connecting to your toy…',hint:undefined});
 try{const socket=new WebSocket(url);this.socket=socket;this.waitForSnapshot();socket.onopen=()=>{if(socket!==this.socket)return;this.send('session.hello',{role:'story-controller'});if(this.context)this.start(this.context);};socket.onmessage=e=>{if(socket!==this.socket)return;try{const p:unknown=JSON.parse(e.data);if(!this.gate?.accept(p))return;if(p.type==='letters.snapshot'){clearTimeout(this.timer);this.emit({state:'connected',letters:p.payload.letters as string[],fresh:true,message:'Toy connected',hint:undefined});}else if(p.type==='device.status'&&p.payload.connected===false){this.emit({state:'disconnected',fresh:false,message:'The toy lost its connection.',hint:undefined});}else if(p.type==='hint.ready'&&p.payload.requestId===this.hintId&&typeof p.payload.text==='string'){this.emit({hint:{id:this.hintId!,text:p.payload.text.slice(0,500)}});}}catch{/* Ignore malformed frames. */}};socket.onerror=()=>{if(socket===this.socket)this.emit({state:'disconnected',fresh:false,message:'Could not reach the toy. Check its address, Wi-Fi, certificate and browser network permission.'});};socket.onclose=()=>{if(socket===this.socket){clearTimeout(this.timer);this.emit({state:'disconnected',fresh:false,hint:undefined,message:this.view.message.startsWith('Could')||this.view.message.includes('did not')?this.view.message:'Toy disconnected. Reconnect when it is ready.'});}};}catch{this.emit({state:'disconnected',message:'The browser could not open this connection.'});}}
 send(type:string,payload:Record<string,unknown>={}){if(type==='hint.request')this.hintId=String(payload.requestId);if(type==='hint.cancel'){this.hintId=undefined;this.emit({hint:undefined});}if(this.socket?.readyState!==WebSocket.OPEN||!this.context)return;this.socket.send(JSON.stringify({v:1,type,sessionId:this.sid,challengeId:this.context.challengeId,seq:++this.seq,payload} satisfies Packet));}
 disconnect(){clearTimeout(this.timer);const old=this.socket;this.socket=undefined;old?.close();this.hintId=undefined;this.emit({state:'disconnected',fresh:false,hint:undefined,message:'Toy disconnected.'});}
 dispose(){this.disconnect();this.listeners.clear();}
}
