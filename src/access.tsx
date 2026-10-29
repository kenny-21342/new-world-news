import { useState } from 'react'
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Check,
  Edit3,
  FileLock2,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import './access.css'

export type Role = 'citizen' | 'editor' | 'controller'

export type SecretArchive = {
  id: string
  title: string
  recordNo: string
  status: string
  classification: string
  summary: string
  body: string
  createdAt: number
}

export const roleNames: Record<Role, string> = {
  citizen: '世界公民',
  editor: '新闻编辑者',
  controller: '主宰者',
}

const accessKeys = { editor: 'EDITOR-2540', controller: 'CONTROL-2540' }

export function makeArchive(index = 0): SecretArchive {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: '',
    recordNo: `WS-${String(index + 1).padStart(3, '0')}`,
    status: '待归档',
    classification: '核心机密',
    summary: '',
    body: '',
    createdAt: Date.now(),
  }
}

export function LoginModal({
  onClose,
  onAuthenticate,
}: {
  onClose: () => void
  onAuthenticate: (role: Role) => void
}) {
  const [selected, setSelected] = useState<Role>('controller')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const chooseRole = (role: Role) => {
    setSelected(role)
    setPassword('')
    setError('')
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (selected === 'citizen') {
      onAuthenticate('citizen')
      return
    }
    if (password === accessKeys.editor) {
      onAuthenticate('editor')
      return
    }
    if (password === accessKeys.controller) {
      onAuthenticate('controller')
      return
    }
    setError('身份密钥不正确，请重新输入')
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="login-modal" role="dialog" aria-modal="true" aria-label="身份登录">
        <header className="modal-header">
          <div><span className="section-kicker">WORLD STATE IDENTITY</span><h2>身份验证</h2></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="关闭登录"><X size={21} /></button>
        </header>
        <div className="login-body">
          <div className="login-intro"><span><Fingerprint size={28} /></span><div><strong>选择你的世界国身份</strong><p>不同身份将进入不同的信息层级。</p></div></div>
          <div className="role-options two-options">
            <button type="button" className={selected === 'citizen' ? 'selected' : ''} onClick={() => chooseRole('citizen')}>
              <UsersRound size={22} /><strong>世界公民</strong><small>浏览公开新闻</small><span>默认身份</span>
            </button>
            <button type="button" className={selected === 'controller' ? 'selected' : ''} onClick={() => chooseRole('controller')}>
              <KeyRound size={22} /><strong>主宰者</strong><small>档案、数据与绝密文档</small><span>编辑者也在此登录</span>
            </button>
          </div>
          <form className="login-form" onSubmit={submit}>
            {selected !== 'citizen' && (
              <label className="field"><span>主宰者 / 编辑者身份密钥</span><div className="password-field"><LockKeyhole size={16} /><input autoFocus type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} placeholder="输入主宰者或编辑者身份密钥" /></div><small className="login-role-hint">编辑者请在此使用编辑者密码，将不再单独显示登录选项。</small></label>
            )}
            {error && <p className="login-error" role="alert">{error}</p>}
            <button type="submit" className="login-submit">
              {selected === 'citizen' ? <UserRound size={17} /> : <ShieldCheck size={17} />}
              {selected === 'citizen' ? '以公民身份浏览' : '验证身份并进入'}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="login-footnote"><LockKeyhole size={12} /> 本登录用于创意作业中的前端角色演示</p>
        </div>
      </section>
    </div>
  )
}

export function ArchiveSection({
  archives,
  canEdit,
  onSelect,
  onAdd,
}: {
  archives: SecretArchive[]
  canEdit: boolean
  onSelect: (archive: SecretArchive) => void
  onAdd: () => void
}) {
  return (
    <section className="archive-section" id="restricted-archives">
      <div className="archive-classification"><span><LockKeyhole size={13} /> RESTRICTED INFORMATION</span><span>仅限授权身份 · CLEARANCE X</span></div>
      <div className="archive-heading">
        <div><span className="section-kicker">THE TRUTH BEHIND THE NEWS</span><h2>真实档案</h2><p>{canEdit ? '编辑者权限：可建立、修改与删除机密档案。' : '主宰者权限：你正在查看普通世界公民不可见的档案。'}</p></div>
        <span className="archive-seal"><FileLock2 size={25} /><small>TOP<br />SECRET</small></span>
      </div>
      <div className="archive-grid">
        {archives.map((archive, index) => (
          <button type="button" className="archive-card" key={archive.id} onClick={() => onSelect(archive)}>
            <span className="archive-card-top"><small>{archive.recordNo || `WS-${String(index + 1).padStart(3, '0')}`}</small><small>{archive.classification}</small></span>
            <Archive size={24} strokeWidth={1.4} />
            <strong className={!archive.title ? 'placeholder-text' : ''}>{archive.title || '待填写的机密档案'}</strong>
            <p className={!archive.summary ? 'placeholder-text' : ''}>{archive.summary || '记录公开新闻之外的事实、观察与处置结果。'}</p>
            <span className="archive-card-bottom"><small>{archive.status}</small>{canEdit ? <Edit3 size={15} /> : <ArrowRight size={15} />}</span>
          </button>
        ))}
        {canEdit && <button type="button" className="archive-add-card" onClick={onAdd}><Plus size={23} /><strong>建立真实档案</strong><small>普通公民不会看到此内容</small></button>}
      </div>
    </section>
  )
}

export function ArchiveEditorModal({
  draft,
  isNew,
  onChange,
  onClose,
  onSave,
  onDelete,
}: {
  draft: SecretArchive
  isNew: boolean
  onChange: (archive: SecretArchive) => void
  onClose: () => void
  onSave: () => void
  onDelete: () => void
}) {
  const update = <K extends keyof SecretArchive>(key: K, value: SecretArchive[K]) => onChange({ ...draft, [key]: value })
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="archive-editor-modal" role="dialog" aria-modal="true" aria-label="编辑真实档案">
        <header className="modal-header"><div><span className="section-kicker">RESTRICTED RECORD EDITOR</span><h2>{isNew ? '建立真实档案' : '编辑真实档案'}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="关闭档案编辑器"><X size={21} /></button></header>
        <div className="archive-editor-fields">
          <div className="archive-editor-warning"><LockKeyhole size={17} /><span>此档案只会在编辑者与主宰者界面中出现。</span></div>
          <label className="field"><span>档案标题</span><input className="title-input archive-title-input" value={draft.title} onChange={(event) => update('title', event.target.value)} placeholder="输入档案对象或事件名称" /></label>
          <div className="field-row">
            <label className="field"><span>档案编号</span><input value={draft.recordNo} onChange={(event) => update('recordNo', event.target.value)} placeholder="WS-001" /></label>
            <label className="field"><span>当前状态</span><select value={draft.status} onChange={(event) => update('status', event.target.value)}><option>待归档</option><option>观察中</option><option>已核实</option><option>已封存</option></select></label>
          </div>
          <label className="field"><span>机密等级</span><select value={draft.classification} onChange={(event) => update('classification', event.target.value)}><option>内部资料</option><option>高度机密</option><option>核心机密</option></select></label>
          <label className="field"><span>档案摘要</span><textarea className="summary-input" value={draft.summary} onChange={(event) => update('summary', event.target.value)} placeholder="概括这份档案记录的真实情况" /></label>
          <label className="field"><span>完整档案</span><textarea className="body-input" value={draft.body} onChange={(event) => update('body', event.target.value)} placeholder={'记录事实、观察过程与最终结论……\n\n按 Enter 键分段。'} /></label>
        </div>
        <footer className="modal-footer"><button type="button" className="delete-button" onClick={onDelete}><Trash2 size={16} /> 删除档案</button><div><button type="button" className="cancel-button" onClick={onClose}>取消</button><button type="button" className="save-button" onClick={onSave}><Check size={17} /> 保存机密档案</button></div></footer>
      </section>
    </div>
  )
}

export function ArchiveReaderModal({ archive, onClose }: { archive: SecretArchive; onClose: () => void }) {
  return (
    <div className="modal-backdrop reader-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <article className="reader-modal archive-reader-modal" role="dialog" aria-modal="true" aria-label="阅读真实档案">
        <header className="reader-toolbar"><button type="button" onClick={onClose}><ArrowLeft size={17} /> 返回档案库</button><span><LockKeyhole size={14} /> {archive.classification}</span><button type="button" className="icon-button" onClick={onClose} aria-label="关闭档案"><X size={19} /></button></header>
        <div className="reader-content">
          <div className="archive-reader-stamp">AUTHORIZED EYES ONLY</div>
          <div className="reader-meta"><span>{archive.recordNo}</span><span>{archive.status}</span><span>世界国中央档案局</span></div>
          <h1 className={!archive.title ? 'placeholder-text' : ''}>{archive.title || '尚未命名的真实档案'}</h1>
          <p className="reader-deck">{archive.summary || '这份档案的摘要还未填写。'}</p>
          <div className="archive-reader-rule"><Fingerprint size={21} /><span>身份核验通过 · 禁止向世界公民公开</span></div>
          <div className="reader-body archive-reader-body">{archive.body ? archive.body.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p className="placeholder-text">档案正文留白。编辑者可以登录后补充完整记录。</p>}</div>
          <div className="reader-end">END OF CLASSIFIED RECORD</div>
        </div>
      </article>
    </div>
  )
}
