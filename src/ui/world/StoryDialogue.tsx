import { useEffect, useRef, useState } from 'react'
import type { Conversation } from '../../game/narrative/conversations'

export default function StoryDialogue({conversation,onFinish,onClose}:{conversation:Conversation;onFinish:()=>void;onClose:()=>void}){
 const [page,setPage]=useState(0),ref=useRef<HTMLDivElement>(null),last=page===conversation.lines.length-1
 useEffect(()=>{const before=document.activeElement as HTMLElement;ref.current?.focus();return()=>before?.focus()},[])
 return <div className="story-layer"><div className="story-dialogue" role="dialog" aria-modal="true" aria-labelledby="story-speaker" aria-describedby="story-line" tabIndex={-1} ref={ref} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();onClose()}if((e.key==='Enter'||e.key===' ')&&e.target===ref.current){e.preventDefault();if(last)onFinish();else setPage(p=>p+1)}if(e.key==='Tab'){const buttons=ref.current?.querySelectorAll<HTMLButtonElement>('button');if(!buttons?.length)return;const first=buttons[0],end=buttons[buttons.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();end.focus()}else if(!e.shiftKey&&document.activeElement===end){e.preventDefault();first.focus()}}}}>
  <strong id="story-speaker" className="speaker-tab">{conversation.speaker}</strong><button className="story-close" onClick={onClose} aria-label="Cerrar conversación">×</button>
  <p id="story-line" key={page}>{conversation.lines[page]}</p>
  <div className="story-bottom"><span aria-label={`Página ${page+1} de ${conversation.lines.length}`}>{conversation.lines.map((_,i)=><i key={i} className={i===page?'current':''}/>)}</span><button onClick={()=>last?onFinish():setPage(p=>p+1)}>{last?conversation.action:'Continuar'} <b aria-hidden="true">▶</b></button></div>
 </div></div>
}
