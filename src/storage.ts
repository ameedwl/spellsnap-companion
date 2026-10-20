import type {Store,Profile} from './game';
import {avatars,chapter} from './content';
export const STORAGE_KEY='spellsnap.islands.v1';
export const emptyStore=():Store=>({version:1,profiles:[],activeId:null,sound:false});
export interface ProgressStorage {load():{data:Store;error?:string};save(data:Store):string|undefined;}
function validProfile(p:any):p is Profile {return p&&typeof p.id==='string'&&typeof p.name==='string'&&p.name.length<=24&&avatars.includes(p.avatar)&&['gentle','explorer'].includes(p.difficulty)&&typeof p.started==='boolean'&&Number.isInteger(p.step)&&p.step>=0&&p.step<=3&&Array.isArray(p.sessions)&&p.sessions.every((s:any)=>typeof s.startedAt==='string'&&typeof s.lastActiveAt==='string')&&p.records&&typeof p.records==='object'&&Object.entries(p.records).every(([id,r]:[string,any])=>chapter.challenges.some(c=>c.id===id&&c.word===r.word)&&r.id===id&&Number.isInteger(r.hints)&&r.hints>=0&&Array.isArray(r.attempts)&&r.attempts.every((a:any)=>typeof a.word==='string'&&typeof a.at==='string'&&['empty','partial','incorrect','correct'].includes(a.verdict))&&(!r.completedAt||typeof r.completedAt==='string'));}
export const browserStorage:ProgressStorage={
 load(){try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return {data:emptyStore()};const s=JSON.parse(raw);if(s.version!==1||!Array.isArray(s.profiles)||!s.profiles.every(validProfile))throw Error();return {data:{...s,activeId:s.profiles.some((p:Profile)=>p.id===s.activeId)?s.activeId:null,sound:s.sound===true}};}catch{return {data:emptyStore(),error:'Saved progress could not be read. This session starts fresh; the old save has not been overwritten.'};}},
 save(data){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch{return 'This browser could not save progress. You can play, but progress may be lost when you close this page.';}}
};
