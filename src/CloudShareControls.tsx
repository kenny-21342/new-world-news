import { useEffect, useState } from 'react'
import { Check, CloudUpload, Copy, ExternalLink, Link2, LoaderCircle, ShieldCheck, Share2, X } from 'lucide-react'
import { makeShareUrl, publicSnapshot, SHARE_ID_KEY, type ShareRecord, type SharedSiteData } from './sharing'
import './CloudShareControls.css'

export default function CloudShareControls({ data }: { data: SharedSiteData }) {
  const [open, setOpen] = useState(false)
  const [shareId, setShareId] = useState(() => localStorage.getItem(SHARE_ID_KEY) || '')
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const shareUrl = shareId ? makeShareUrl(shareId) : ''

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const publish = async () => {
    setPublishing(true)
    setError('')
    setMessage('')
    setCopied(false)
    const send = async (id: string) => fetch(id ? `/api/shares/${id}` : '/api/shares', {
      method: id ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-editor-password': 'EDITOR-2540',
      },
      body: JSON.stringify({ data: publicSnapshot(data) }),
    })

    try {
      let response = await send(shareId)
      if (response.status === 404 && shareId) {
        localStorage.removeItem(SHARE_ID_KEY)
        setShareId('')
        response = await send('')
      }
      const result = await response.json() as ShareRecord & { error?: string }
      if (!response.ok) throw new Error(result.error || '云端保存失败')
      localStorage.setItem(SHARE_ID_KEY, result.id)
      setShareId(result.id)
      setMessage(shareId ? '云端内容已更新，原分享链接保持不变。' : '公开新闻已保存，分享链接已生成。')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '云端保存失败，请检查网络后重试')
    } finally {
      setPublishing(false)
    }
  }

  const copyLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setError('')
    } catch {
      setError('无法自动复制，请选中链接后手动复制。')
    }
  }

  return (
    <>
      <button type="button" className="text-button cloud-share-trigger" onClick={() => { setOpen(true); setError(''); setMessage('') }}>
        <CloudUpload size={17} /> 云端分享
      </button>
      {open && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !publishing) setOpen(false) }}>
          <section className="cloud-share-modal" role="dialog" aria-modal="true" aria-label="云端保存与公开分享">
            <header className="modal-header">
              <div><span className="section-kicker">PUBLIC CLOUD SHARE</span><h2>云端保存与公开分享</h2></div>
              <button type="button" className="icon-button" onClick={() => setOpen(false)} disabled={publishing} aria-label="关闭云端分享"><X size={21} /></button>
            </header>
            <div className="cloud-share-body">
              <div className="cloud-share-intro">
                <span><Share2 size={25} /></span>
                <div><strong>{shareId ? '更新公共频道版本' : '发布公共新闻频道'}</strong><p>{shareId ? '再次发布会更新同一个链接，访客无需重新获取地址。' : '保存当前公开新闻，并生成任何人都能打开的只读链接。'}</p></div>
              </div>
              <div className="cloud-share-safety"><ShieldCheck size={17} /><p>只分享站名与公开新闻。<strong>真实档案、形势数据、绝密文档不会被公开。</strong></p></div>
              {shareUrl && (
                <label className="share-link-field">
                  <span><Link2 size={14} /> 公开只读链接</span>
                  <div><input readOnly value={shareUrl} onFocus={(event) => event.target.select()} /><button type="button" onClick={copyLink}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? '已复制' : '复制'}</button></div>
                </label>
              )}
              {message && <p className="cloud-share-success" role="status"><Check size={16} /> {message}</p>}
              {error && <p className="login-error" role="alert">{error}</p>}
              <p className="cloud-share-note">链接使用当前网站域名。部署到互联网后，同一功能会生成真正的公开网址。</p>
            </div>
            <footer className="modal-footer">
              <span className="cloud-share-readonly">公共终端仅限阅读，不具备内容维护权限</span>
              <div>
                {shareUrl && <button type="button" className="cancel-button" onClick={() => window.open(shareUrl, '_blank', 'noopener,noreferrer')}><ExternalLink size={15} /> 打开分享页</button>}
                <button type="button" className="save-button" onClick={publish} disabled={publishing}>
                  {publishing ? <LoaderCircle size={17} className="spin" /> : <CloudUpload size={17} />}
                  {publishing ? '正在保存…' : shareId ? '更新云端内容' : '保存并生成链接'}
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}
