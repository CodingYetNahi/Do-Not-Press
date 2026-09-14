export const vibrate=p=>{try{navigator.vibrate?.(p)}catch{}};
export function burst(root,color='#33e6d2',count=18){const box=root.getBoundingClientRect();for(let i=0;i<count;i++){const p=document.createElement('i');p.className='particle';p.style.cssText=`left:${box.width/2}px;top:${box.height/2}px;background:${color};--x:${(Math.random()-.5)*260}px;--y:${(Math.random()-.5)*260}px`;root.append(p);setTimeout(()=>p.remove(),700)}}
export function flash(el,color='white'){el.style.background=color;el.classList.remove('go');void el.offsetWidth;el.classList.add('go')}
