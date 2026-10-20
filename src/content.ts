export type Challenge = {id:string; word:string; title:string; instruction:string; clue:string; hints:string[]; outcome:string; next:string};
export const chapter = {
 id:'forest-home', title:'Help Pip Get Home', island:'Whisperwood Island', intro:'A little explorer. A very big way home.',
 story:'Pip followed a butterfly a little too far. Now the clouds are gathering, the path is hidden, and a river stands between Pip and home. Your letters can help!',
 challenges:[
 {id:'forest-sun',word:'SUN',title:'A little sunshine, please!',instruction:'Build the word for the bright light in the sky.',clue:'It warms your face and helps flowers grow.',hints:['Look up! What shines in the sky during the day?','It starts with S. Say the sounds slowly: /s/ /ŭ/ /n/.','Try these letters in order: S · U · N.'],outcome:'Hello, sunshine! The clouds drift away and the forest wakes up.',next:'Find the way'},
 {id:'forest-map',word:'MAP',title:'Which way is home?',instruction:'Build the word for a picture that shows the way.',clue:'Pip needs a guide to the winding forest paths.',hints:['You can unfold it to find where you are going.','It starts with M and ends with P. What goes in the middle?','Try these letters in order: M · A · P.'],outcome:'A path appears! Follow the dotted trail down to the river.',next:'To the river'},
 {id:'forest-boat',word:'BOAT',title:'One river. One little adventure.',instruction:'Build the word for something you can sail across the river.',clue:'It floats on water and carries Pip safely across.',hints:['Pip needs a little vessel that floats.','It starts with B. The letters O and A work together in the middle.','Try these letters in order: B · O · A · T.'],outcome:'All aboard! Pip floats across the river, right to the doorstep.',next:'Bring Pip home'}
 ] satisfies Challenge[]
};
export const avatars=['🦊','🐸','🐻','🐰','🐼','🦉'];
