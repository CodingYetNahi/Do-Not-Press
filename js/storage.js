const KEY='dpt_stats_v1';
const defaults={best:0,games:0,survived:0,longest:0,muted:false,challenges:{}};
export function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...defaults}}}
export function save(data){try{localStorage.setItem(KEY,JSON.stringify(data))}catch{/* private mode: game still works */}}
export function record(stats,id,score,performance=1){stats.survived++;stats.longest=Math.max(stats.longest,score);stats.challenges[id]=Math.max(stats.challenges[id]||0,performance);save(stats)}
