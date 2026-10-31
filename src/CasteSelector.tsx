import { Check, ChevronDown, Layers3, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import './CasteSelector.css'

export type Caste = 'alpha' | 'beta' | 'gamma' | 'delta' | 'epsilon'
export const casteInfo: Record<Caste, { name: string; english: string; count: number; color: string; description: string }> = {
  alpha: { name: '阿尔法', english: 'ALPHA', count: 18, color: '#214d41', description: '政策、科技、文化与经核准评论' },
  beta: { name: '贝塔', english: 'BETA', count: 14, color: '#6c4b68', description: '行政、岗位、文化与消费信息' },
  gamma: { name: '伽马', english: 'GAMMA', count: 10, color: '#52725a', description: '社会服务、健康与集体娱乐' },
  delta: { name: '德尔塔', english: 'DELTA', count: 6, color: '#9a7c45', description: '生产、交通、天气与配给通知' },
  epsilon: { name: '艾普西龙', english: 'EPSILON', count: 3, color: '#454a48', description: '班次、唆麻与统一娱乐通知' },
}

export function CasteSelector({ caste, onChange }: { caste: Caste; onChange: (caste: Caste) => void }) {
  const [open, setOpen] = useState(false)
  const info = casteInfo[caste]
  return <section className="caste-selector" style={{ '--caste-color': info.color } as React.CSSProperties} aria-label="公民种姓信息配给">
    <div className="caste-current"><span><Layers3 size={18} /></span><div><small>CITIZEN INFORMATION ALLOCATION</small><strong>{info.name}公民频道</strong><p>本频道已依据您的种姓与岗位完成幸福配给。</p></div></div>
    <div className="caste-actions"><span><ShieldCheck size={14} /> 公共信息层级 · 无内部档案权限</span><button type="button" onClick={() => setOpen(!open)} aria-expanded={open}>{info.english}<ChevronDown size={15} /></button></div>
    {open && <div className="caste-options">{(Object.keys(casteInfo) as Caste[]).map((key) => { const item = casteInfo[key]; return <button type="button" key={key} onClick={() => { onChange(key); setOpen(false) }} className={key === caste ? 'selected' : ''}><i style={{ background: item.color }} /><span><strong>{item.name} <small>{item.english}</small></strong><em>{item.description}</em></span><b>{item.count} 条</b>{key === caste && <Check size={15} />}</button>})}</div>}
  </section>
}
