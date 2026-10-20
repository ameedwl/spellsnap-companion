export type Difficulty='gentle'|'explorer';
export type Verdict='empty'|'partial'|'incorrect'|'correct';
export type Attempt={word:string; verdict:Verdict; at:string};
export type WordRecord={id:string;word:string;attempts:Attempt[];hints:number;completedAt?:string;assisted?:boolean;firstTry?:boolean};
export type Session={startedAt:string;lastActiveAt:string};
export type Profile={id:string;name:string;avatar:string;difficulty:Difficulty;started:boolean;step:number;records:Record<string,WordRecord>;sessions:Session[]};
export type Store={version:1;profiles:Profile[];activeId:string|null;sound:boolean};
export function evaluate(letters:string[],word:string):Verdict {const value=letters.join(''); if(!value)return 'empty';if(value===word)return 'correct';if(value.length<word.length)return 'partial';return 'incorrect';}
export function recordAttempt(profile:Profile,id:string,word:string,letters:string[],at=new Date().toISOString()):Profile {
 const prior=profile.records[id]??{id,word,attempts:[],hints:0}; if(prior.completedAt)return profile;
 const verdict=evaluate(letters,word);const record={...prior,attempts:[...prior.attempts,{word:letters.join(''),verdict,at}]};
 if(verdict==='correct'){record.completedAt=at;record.firstTry=!prior.attempts.some(a=>a.verdict==='incorrect');record.assisted=prior.hints>0||profile.difficulty==='gentle';}
 return touch({...profile,records:{...profile.records,[id]:record}},at);
}
export function recordHint(profile:Profile,id:string,word:string):Profile {const r=profile.records[id]??{id,word,attempts:[],hints:0};return touch({...profile,records:{...profile.records,[id]:{...r,hints:r.hints+1}}});}
export function touch(profile:Profile,at=new Date().toISOString()):Profile {const sessions=[...profile.sessions];if(sessions.length)sessions[sessions.length-1]={...sessions.at(-1)!,lastActiveAt:at};return {...profile,sessions};}
export function beginSession(profile:Profile):Profile {const at=new Date().toISOString();return {...profile,sessions:[...profile.sessions,{startedAt:at,lastActiveAt:at}].slice(-100)};}
export function summary(p:Profile){const records=Object.values(p.records);const done=records.filter(r=>r.completedAt);return {done,attempts:records.flatMap(r=>r.attempts),hints:records.reduce((n,r)=>n+r.hints,0),independent:done.filter(r=>!r.assisted).length,first:done.filter(r=>r.firstTry).length};}
