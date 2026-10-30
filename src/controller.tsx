import { useState } from 'react'
import {
  Activity,
  Archive,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  Clock3,
  Database,
  Edit3,
  FileLock2,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SecretArchive } from './access'
import './controller.css'

const stabilityTrend = [
  { week: '第 1 周', happiness: 100, soma: 5.1, anomalies: 41 },
  { week: '第 2 周', happiness: 99.8, soma: 5.4, anomalies: 73 },
  { week: '第 3 周', happiness: 99.5, soma: 5.9, anomalies: 126 },
  { week: '第 4 周', happiness: 99.1, soma: 6.3, anomalies: 288 },
  { week: '第 5 周', happiness: 98.4, soma: 6.8, anomalies: 614 },
  { week: '本周', happiness: 97.6, soma: 7.2, anomalies: 1284 },
]

const anomalyTypes = [
  { name: '拒绝唆麻', value: 386, color: '#8f3f35' },
  { name: '自发独处', value: 342, color: '#b17b45' },
  { name: '追问旧词', value: 297, color: '#426c60' },
  { name: '手抄文本', value: 159, color: '#6e5b78' },
  { name: '其他异常', value: 100, color: '#7a8179' },
]

export type SituationEvent = {
  id: string
  title: string
  date: string
  status: string
  summary: string
}

export type DataMetric = {
  id: string
  label: string
  value: string
  delta: string
  note: string
}

export type TopSecretDocument = {
  title: string
  code: string
  summary: string
  body: string
}

export type IntelligenceData = {
  events: SituationEvent[]
  metrics: DataMetric[]
  topSecret: TopSecretDocument
}

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const makeSituation = (index: number): SituationEvent => ({
  id: makeId(),
  title: '',
  date: '',
  status: index === 0 ? '近期' : '观察中',
  summary: '',
})

const makeMetric = (): DataMetric => ({ id: makeId(), label: '', value: '', delta: '', note: '' })

export function makeIntelligence(): IntelligenceData {
  return {
    events: [makeSituation(0), makeSituation(1), makeSituation(2)],
    metrics: [makeMetric(), makeMetric(), makeMetric(), makeMetric()],
    topSecret: { title: '', code: 'DOC-X-001', summary: '', body: '' },
  }
}

export function normalizeIntelligence(value?: Partial<IntelligenceData>): IntelligenceData {
  const fallback = makeIntelligence()
  return {
    events: Array.isArray(value?.events)
      ? value.events.map((event, index) => ({ ...makeSituation(index), ...event }))
      : fallback.events,
    metrics: Array.isArray(value?.metrics)
      ? value.metrics.map((metric) => ({ ...makeMetric(), ...metric }))
      : fallback.metrics,
    topSecret: { ...fallback.topSecret, ...value?.topSecret },
  }
}

export function ControllerDashboard({
  intelligence,
  archives,
  archiveQuery = '',
  onOpenArchive,
  onOpenTopSecret,
}: {
  intelligence: IntelligenceData
  archives: SecretArchive[]
  archiveQuery?: string
  onOpenArchive: (archive: SecretArchive) => void
  onOpenTopSecret: () => void
}) {
  const keyword = archiveQuery.trim().toLowerCase()
  const visibleArchives = archives.filter((archive) => !keyword || `${archive.recordNo} ${archive.title} ${archive.summary} ${archive.body} ${archive.status}`.toLowerCase().includes(keyword))

  return (
    <div className="controller-dashboard">
      <section className="controller-hero">
        <div className="controller-hero-copy">
          <span className="controller-eyebrow"><Fingerprint size={14} /> WORLD STATE CENTRAL ARCHIVE</span>
          <h1>中央档案与形势记录</h1>
          <p>公开叙事之外的变化、数据与历史记录，仅供世界国最高权限查阅。</p>
        </div>
        <div className="controller-clearance"><ShieldCheck size={29} /><span><small>IDENTITY VERIFIED</small><strong>主宰者权限</strong></span></div>
      </section>

      <nav className="controller-anchor-nav" aria-label="档案页面导航">
        <button type="button" onClick={() => document.getElementById('situation-changes')?.scrollIntoView({ behavior: 'smooth' })}>近期形势变化</button>
        <button type="button" onClick={() => document.getElementById('data-changes')?.scrollIntoView({ behavior: 'smooth' })}>数据变动</button>
        <button type="button" onClick={() => document.getElementById('past-archives')?.scrollIntoView({ behavior: 'smooth' })}>往期档案</button>
        <button type="button" className="secret-anchor" onClick={onOpenTopSecret}><LockKeyhole size={13} /> 绝密文档</button>
      </nav>

      <section className="intelligence-section" id="data-changes">
        <div className="intelligence-heading"><div><span>DATA MOVEMENT / 01</span><h2>数据变动</h2></div><BarChart3 size={23} /></div>
        <div className="metric-grid">
          {intelligence.metrics.map((metric, index) => (
            <article className="metric-card" key={metric.id}>
              <span className="metric-index">M-{String(index + 1).padStart(2, '0')}</span>
              <small className={!metric.label ? 'placeholder-text' : ''}>{metric.label || '待命名数据指标'}</small>
              <strong className={!metric.value ? 'placeholder-text' : ''}>{metric.value || '—'}</strong>
              <div><span className={!metric.delta ? 'placeholder-text' : ''}>{metric.delta || '变动待录入'}</span><small>{metric.note || '暂无补充说明'}</small></div>
            </article>
          ))}
        </div>
        <div className="intelligence-chart-grid">
          <article className="intelligence-chart-card">
            <div className="chart-card-heading"><div><span>STABILITY TREND / 6 WEEKS</span><h3>快乐指数与异常行为趋势</h3></div><small>内部监测</small></div>
            <div className="chart-legend"><span><i className="legend-happiness" />快乐指数（%）</span><span><i className="legend-anomaly" />异常行为（例）</span></div>
            <div className="intelligence-chart" aria-label="六周快乐指数与异常行为趋势图">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stabilityTrend} margin={{ top: 12, right: 4, left: -18, bottom: 0 }}>
                  <defs><linearGradient id="happinessFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#315f50" stopOpacity={0.3} /><stop offset="100%" stopColor="#315f50" stopOpacity={0.02} /></linearGradient></defs>
                  <CartesianGrid stroke="#dedbd1" strokeDasharray="3 4" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: '#77776e', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="happiness" domain={[96, 101]} tick={{ fill: '#315f50', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="anomaly" orientation="right" tick={{ fill: '#984f43', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#f7f4ec', border: '1px solid #cfc9bb', borderRadius: 0, fontSize: 12 }} />
                  <Area yAxisId="happiness" type="monotone" dataKey="happiness" name="快乐指数（%）" stroke="#315f50" fill="url(#happinessFill)" strokeWidth={2.2} />
                  <Area yAxisId="anomaly" type="monotone" dataKey="anomalies" name="异常行为（例）" stroke="#984f43" fill="#984f4312" strokeWidth={2.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p>快乐指数仍接近满值，但异常行为六周增长约 31 倍；秩序稳定，风险苗头上升。</p>
          </article>
          <article className="intelligence-chart-card">
            <div className="chart-card-heading"><div><span>ANOMALY TAXONOMY / 1,284</span><h3>异常行为构成</h3></div><small>本周登记</small></div>
            <div className="intelligence-chart anomaly-bar-chart" aria-label="本周异常行为类型柱状图">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={anomalyTypes} layout="vertical" margin={{ top: 8, right: 18, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="#dedbd1" strokeDasharray="3 4" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#77776e', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={70} tick={{ fill: '#42463f', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#f7f4ec', border: '1px solid #cfc9bb', borderRadius: 0, fontSize: 12 }} />
                  <Bar dataKey="value" name="登记数量（例）" radius={[0, 2, 2, 0]}>{anomalyTypes.map((item) => <Cell key={item.name} fill={item.color} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p>所有类别合计 1,284 例。多数为个体行为，尚未发现统一指挥或跨区组织。</p>
          </article>
        </div>
      </section>

      <div className="controller-two-column">
        <section className="intelligence-section situation-panel" id="situation-changes">
          <div className="intelligence-heading"><div><span>SITUATION REPORT / 02</span><h2>近期形势变化</h2></div><Activity size={23} /></div>
          <div className="situation-list">
            {intelligence.events.map((event, index) => (
              <article className="situation-item" key={event.id}>
                <span className="situation-marker">{String(index + 1).padStart(2, '0')}</span>
                <div><div className="situation-meta"><span>{event.date || '日期待定'}</span><span>{event.status}</span></div><h3 className={!event.title ? 'placeholder-text' : ''}>{event.title || '待记录的形势变化'}</h3><p className={!event.summary ? 'placeholder-text' : ''}>{event.summary || '由编辑者录入近期形势变化与影响说明。'}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="intelligence-section data-ledger">
          <div className="intelligence-heading"><div><span>CHANGE LEDGER</span><h2>变动明细</h2></div><Database size={22} /></div>
          <div className="data-ledger-table">
            <div className="ledger-row ledger-header"><span>指标</span><span>当前值</span><span>变动</span></div>
            {intelligence.metrics.map((metric) => <div className="ledger-row" key={metric.id}><span>{metric.label || '待命名'}</span><strong>{metric.value || '—'}</strong><span>{metric.delta || '—'}</span></div>)}
          </div>
          <p className="ledger-note"><Clock3 size={13} /> 数据由编辑者维护，普通公民不可见。</p>
        </section>
      </div>

      <section className="intelligence-section past-archives" id="past-archives">
        <div className="intelligence-heading"><div><span>ARCHIVE COLLECTION / 03</span><h2>往期档案</h2><p>{keyword ? `正在筛选包含“${archiveQuery.trim()}”的档案` : '按时间保存的历史记录与真实事件档案。'}</p></div><Archive size={23} /></div>
        <div className="controller-archive-list">
          {visibleArchives.map((archive, index) => (
            <button type="button" key={archive.id} onClick={() => onOpenArchive(archive)}>
              <span className="past-archive-no">{archive.recordNo || `WS-${String(index + 1).padStart(3, '0')}`}</span>
              <span className="past-archive-copy"><strong className={!archive.title ? 'placeholder-text' : ''}>{archive.title || '待填写的历史档案'}</strong><small>{archive.summary || '档案摘要尚未填写。'}</small></span>
              <span className="past-archive-status">{archive.status}</span><ArrowRight size={16} />
            </button>
          ))}
          {!visibleArchives.length && <p className="controller-archive-empty">没有找到匹配的往期档案。</p>}
        </div>
      </section>

      <section className="top-secret-panel" id="top-secret-document">
        <div className="secret-watermark">X</div>
        <span className="secret-icon"><FileLock2 size={29} /></span>
        <div><span>ULTRA CLASSIFIED / LEVEL X</span><h2>绝密档案库</h2><p>6 份封存记录：紧急稳定预案 + 5 份最高风险档案</p><small><KeyRound size={12} /> 往期档案中不可见 · 提示口令：作者的生日</small></div>
        <button type="button" onClick={onOpenTopSecret}><LockKeyhole size={16} /> 解锁整个档案库 <ArrowRight size={16} /></button>
      </section>
    </div>
  )
}

export function IntelligenceControlDesk({
  intelligence,
  onEditIntelligence,
  onEditTopSecret,
}: {
  intelligence: IntelligenceData
  onEditIntelligence: () => void
  onEditTopSecret: () => void
}) {
  return (
    <section className="intelligence-control-desk">
      <div className="control-desk-heading"><div><span className="section-kicker">CONTROLLER PAGE EDITOR</span><h2>主宰者页面内容</h2><p>维护形势变化、数据指标和需要二次密码的绝密文档。</p></div><ShieldAlert size={25} /></div>
      <div className="control-desk-grid">
        <button type="button" onClick={onEditIntelligence}><BarChart3 size={24} /><span><strong>局势与数据</strong><small>{intelligence.events.length} 条形势记录 · {intelligence.metrics.length} 项数据指标</small></span><Edit3 size={16} /></button>
        <button type="button" onClick={onEditTopSecret}><FileLock2 size={24} /><span><strong>绝密文档</strong><small>{intelligence.topSecret.title || '内容待填写'} · 编辑者无需二次密码</small></span><Edit3 size={16} /></button>
      </div>
    </section>
  )
}

export function IntelligenceEditorModal({
  draft,
  onChange,
  onClose,
  onSave,
}: {
  draft: IntelligenceData
  onChange: (draft: IntelligenceData) => void
  onClose: () => void
  onSave: () => void
}) {
  const updateEvent = (id: string, key: keyof SituationEvent, value: string) => onChange({ ...draft, events: draft.events.map((event) => event.id === id ? { ...event, [key]: value } : event) })
  const updateMetric = (id: string, key: keyof DataMetric, value: string) => onChange({ ...draft, metrics: draft.metrics.map((metric) => metric.id === id ? { ...metric, [key]: value } : metric) })
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="intelligence-editor-modal" role="dialog" aria-modal="true" aria-label="编辑局势与数据">
        <header className="modal-header"><div><span className="section-kicker">SITUATION & DATA EDITOR</span><h2>编辑局势与数据</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="关闭局势数据编辑器"><X size={21} /></button></header>
        <div className="intelligence-editor-body">
          <section className="editor-subsection">
            <div className="editor-subsection-heading"><div><span>01</span><h3>近期形势变化</h3></div><button type="button" onClick={() => onChange({ ...draft, events: [...draft.events, makeSituation(draft.events.length)] })}><Plus size={14} /> 添加记录</button></div>
            {draft.events.map((event, index) => (
              <div className="event-editor-row" key={event.id}>
                <span className="editor-row-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="event-editor-fields">
                  <div className="field-row"><label className="field"><span>变化标题</span><input value={event.title} onChange={(e) => updateEvent(event.id, 'title', e.target.value)} placeholder="输入形势变化标题" /></label><label className="field"><span>日期</span><input type="date" value={event.date} onChange={(e) => updateEvent(event.id, 'date', e.target.value)} /></label></div>
                  <label className="field"><span>状态</span><input value={event.status} onChange={(e) => updateEvent(event.id, 'status', e.target.value)} placeholder="近期 / 观察中 / 已核实" /></label>
                  <label className="field"><span>变化说明</span><textarea value={event.summary} onChange={(e) => updateEvent(event.id, 'summary', e.target.value)} placeholder="记录变化及其影响" /></label>
                </div>
                <button type="button" className="editor-row-delete" onClick={() => onChange({ ...draft, events: draft.events.filter((item) => item.id !== event.id) })} aria-label="删除此形势记录"><Trash2 size={15} /></button>
              </div>
            ))}
          </section>
          <section className="editor-subsection">
            <div className="editor-subsection-heading"><div><span>02</span><h3>数据变动指标</h3></div><button type="button" onClick={() => onChange({ ...draft, metrics: [...draft.metrics, makeMetric()] })}><Plus size={14} /> 添加指标</button></div>
            {draft.metrics.map((metric, index) => (
              <div className="metric-editor-row" key={metric.id}>
                <span className="editor-row-number">M{index + 1}</span>
                <div className="metric-editor-fields"><label className="field"><span>指标名称</span><input value={metric.label} onChange={(e) => updateMetric(metric.id, 'label', e.target.value)} placeholder="如：社会稳定指数" /></label><label className="field"><span>当前值</span><input value={metric.value} onChange={(e) => updateMetric(metric.id, 'value', e.target.value)} placeholder="如：98.6" /></label><label className="field"><span>变动值</span><input value={metric.delta} onChange={(e) => updateMetric(metric.id, 'delta', e.target.value)} placeholder="如：+2.4%" /></label><label className="field"><span>补充说明</span><input value={metric.note} onChange={(e) => updateMetric(metric.id, 'note', e.target.value)} placeholder="统计周期或来源说明" /></label></div>
                <button type="button" className="editor-row-delete" onClick={() => onChange({ ...draft, metrics: draft.metrics.filter((item) => item.id !== metric.id) })} aria-label="删除此数据指标"><Trash2 size={15} /></button>
              </div>
            ))}
          </section>
        </div>
        <footer className="modal-footer"><span className="editor-save-note">更改将显示在主宰者档案仪表盘</span><div><button type="button" className="cancel-button" onClick={onClose}>取消</button><button type="button" className="save-button" onClick={onSave}><Check size={17} /> 保存局势与数据</button></div></footer>
      </section>
    </div>
  )
}

export function TopSecretEditorModal({
  draft,
  onChange,
  onClose,
  onSave,
}: {
  draft: TopSecretDocument
  onChange: (draft: TopSecretDocument) => void
  onClose: () => void
  onSave: () => void
}) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="secret-editor-modal" role="dialog" aria-modal="true" aria-label="编辑绝密文档">
        <header className="modal-header"><div><span className="section-kicker">ULTRA CLASSIFIED EDITOR</span><h2>编辑绝密文档</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="关闭绝密文档编辑器"><X size={21} /></button></header>
        <div className="secret-editor-fields">
          <div className="secret-editor-warning"><ShieldAlert size={18} /><div><strong>二次密码保护已启用</strong><p>主宰者查看此文档时，必须额外输入密码。提示口令为“作者的生日”。</p></div></div>
          <label className="field"><span>文档标题</span><input className="title-input" value={draft.title} onChange={(e) => onChange({ ...draft, title: e.target.value })} placeholder="输入绝密文档标题" /></label>
          <label className="field"><span>文档编号</span><input value={draft.code} onChange={(e) => onChange({ ...draft, code: e.target.value })} /></label>
          <label className="field"><span>文档摘要</span><textarea className="summary-input" value={draft.summary} onChange={(e) => onChange({ ...draft, summary: e.target.value })} placeholder="输入文档摘要" /></label>
          <label className="field"><span>绝密正文</span><textarea className="body-input secret-body-input" value={draft.body} onChange={(e) => onChange({ ...draft, body: e.target.value })} placeholder={'在这里编辑绝密文档内容……\n\n按 Enter 键分段。'} /></label>
        </div>
        <footer className="modal-footer"><span className="editor-save-note">仅编辑者可修改此文档</span><div><button type="button" className="cancel-button" onClick={onClose}>取消</button><button type="button" className="save-button" onClick={onSave}><Check size={17} /> 保存绝密文档</button></div></footer>
      </section>
    </div>
  )
}

export function TopSecretLockModal({ onClose, onUnlock }: { onClose: () => void; onUnlock: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (password === '100522') onUnlock()
    else setError('绝密文档密码错误，访问被拒绝')
  }
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="secret-lock-modal" role="dialog" aria-modal="true" aria-label="绝密文档二次验证">
        <button type="button" className="icon-button secret-lock-close" onClick={onClose} aria-label="关闭二次验证"><X size={20} /></button>
        <span className="secret-lock-icon"><LockKeyhole size={30} /></span>
        <span className="secret-lock-kicker">SECONDARY CLEARANCE REQUIRED</span>
        <h2>绝密文档二次验证</h2>
        <p>主宰者权限已确认。此文档还需要独立访问密码。</p>
        <form onSubmit={submit}>
          <label className="field"><span>绝密文档密码</span><div className="password-field"><KeyRound size={16} /><input autoFocus type="password" inputMode="numeric" value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} placeholder="请输入 6 位密码" /></div></label>
          <div className="secret-password-hint"><Fingerprint size={14} /><span>提示口令：<strong>作者的生日</strong></span></div>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" className="secret-unlock-button"><ShieldCheck size={17} /> 验证并查看绝密文档 <ArrowRight size={16} /></button>
        </form>
      </section>
    </div>
  )
}

export function TopSecretReaderModal({ document, onClose }: { document: TopSecretDocument; onClose: () => void }) {
  return (
    <div className="modal-backdrop reader-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <article className="reader-modal top-secret-reader" role="dialog" aria-modal="true" aria-label="阅读绝密文档">
        <header className="reader-toolbar"><button type="button" onClick={onClose}><ArrowLeft size={17} /> 返回中央档案</button><span><LockKeyhole size={14} /> 二次验证已通过</span><button type="button" className="icon-button" onClick={onClose} aria-label="关闭绝密文档"><X size={19} /></button></header>
        <div className="reader-content">
          <div className="top-secret-stamp">ULTRA CLASSIFIED · LEVEL X</div>
          <div className="reader-meta"><span>{document.code}</span><span>世界国最高机密</span><span>禁止复制与传播</span></div>
          <h1 className={!document.title ? 'placeholder-text' : ''}>{document.title || '尚未命名的绝密文档'}</h1>
          <p className="reader-deck">{document.summary || '这份绝密文档的摘要还未填写。'}</p>
          <div className="secret-reader-rule"><Fingerprint size={21} /><span>二次身份核验通过 · 本次访问已被记录</span></div>
          <div className="reader-body">{document.body ? document.body.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p className="placeholder-text">文档正文留白。编辑者可登录后修改全部内容。</p>}</div>
          <div className="reader-end">END OF ULTRA CLASSIFIED DOCUMENT</div>
        </div>
      </article>
    </div>
  )
}
