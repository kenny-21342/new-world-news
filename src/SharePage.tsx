import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpFromLine, Check, CircleUserRound, Clock3, Cloud, Copy, Eye, ImagePlus, Menu, Newspaper, X } from 'lucide-react'
import CitizenStatus from './CitizenStatus'
import type { ShareRecord, SharedImage } from './sharing'
import './SharePage.css'

const categories = ['全部', '社会', '科技', '文化', '观点']

function formatDate(date: string) {
  if (!date) return '日期待定'
  const [year, month, day] = date.split('-')
  return `${year}.${month}.${day}`
}

function PublicImage({ image, className = '' }: { image: SharedImage; className?: string }) {
  return (
    <div className={`news-image ${image.src ? 'has-image' : 'is-empty'} ${className}`}>
      {image.src ? (
        <img src={image.src} alt="新闻封面" draggable={false} style={{ transform: `translate(${image.x}%, ${image.y}%) scale(${image.zoom})`, filter: `brightness(${image.brightness}%) grayscale(${image.grayscale}%)` }} />
      ) : (
        <div className="image-placeholder"><span className="placeholder-corner corner-a" /><span className="placeholder-corner corner-b" /><ImagePlus size={30} strokeWidth={1.4} /><strong>图片留白</strong><small>公开新闻分享</small></div>
      )}
    </div>
  )
}

export default function SharePage({ shareId }: { shareId: string }) {
  const [record, setRecord] = useState<ShareRecord | null>(null)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('全部')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [readerId, setReaderId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    fetch(`/api/shares/${shareId}`, { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const result = await response.json() as ShareRecord & { error?: string }
        if (!response.ok) throw new Error(result.error || '无法打开分享页面')
        if (active) setRecord(result)
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : '分享页面加载失败') })
    return () => { active = false }
  }, [shareId])

  useEffect(() => {
    if (record?.data.siteName) document.title = `${record.data.siteName} · 公开分享`
  }, [record?.data.siteName])

  useEffect(() => {
    if (!readerId) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setReaderId(null) }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [readerId])

  const data = record?.data
  const featured = data?.articles.find((article) => article.featured) || data?.articles[0]
  const visibleArticles = useMemo(() => {
    if (!data) return []
    return data.articles.filter((article) => (category === '全部' || article.category === category) && (category !== '全部' || article.id !== featured?.id))
  }, [data, category, featured?.id])
  const readerArticle = data?.articles.find((article) => article.id === readerId)
  const fordDate = `福特纪元 632 年 · ${new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', weekday: 'short' }).format(new Date())}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setError('无法自动复制，请复制浏览器地址栏中的链接。')
    }
  }

  if (error && !data) {
    return (
      <main className="public-share-state"><span><Cloud size={34} /></span><h1>暂时无法打开分享页面</h1><p>{error}</p><a href="/">返回新世界新闻</a></main>
    )
  }

  if (!data) {
    return <main className="public-share-state"><span className="public-share-loading"><Cloud size={34} /></span><h1>正在读取公开新闻</h1><p>正在从云端获取已发布内容…</p></main>
  }

  return (
    <div className="app-shell public-share-page">
      <div className="top-strip"><div className="page-width strip-inner"><span><span className="live-dot" /> WORLD STATE NEWS NETWORK</span><span className="strip-message">{data.ticker || '世界国公开信息频道'}</span><span>{data.issue}</span></div></div>
      <header className="site-header page-width">
        <div className="masthead-row">
          <div className="date-block"><span>{fordDate}</span><small>公开新闻分享页</small></div>
          <button className="brand" type="button" onClick={() => { setCategory('全部'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><span className="brand-mark">NW</span><span className="brand-copy"><strong>{data.siteName || '新世界新闻'}</strong><small>{data.englishName}</small></span></button>
          <div className="header-tools"><span className="public-share-badge"><Eye size={16} /><span>公开分享</span><small>只读</small></span></div>
        </div>
        <div className="nav-row">
          <button className="mobile-menu-button" type="button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="打开导航">{mobileMenu ? <X size={20} /> : <Menu size={20} />}</button>
          <nav className={mobileMenu ? 'open' : ''} aria-label="新闻分类">{categories.map((item) => <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => { setCategory(item); setMobileMenu(false) }}>{item === '全部' ? '首页' : item}</button>)}</nav>
          <span className="public-share-cloud"><Cloud size={17} /><span>云端已发布</span></span>
        </div>
      </header>

      <main className="page-width main-content">
        <section className="edition-bar">
          <div><span className="section-kicker">PUBLIC NEWS SHARE</span><span className="motto">{data.motto}</span></div>
          <div className="editor-actions"><div className="visitor-actions"><span><Eye size={14} /> 访客只读模式</span><button type="button" className="text-button" onClick={copyLink}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? '链接已复制' : '复制分享链接'}</button></div></div>
        </section>
        {error && <p className="public-share-inline-error" role="alert">{error}</p>}
        <CitizenStatus />

        {category === '全部' && featured ? (
          <section className="lead-layout">
            <article className="lead-story" onClick={() => setReaderId(featured.id)}>
              <div className="story-label"><span>今日头条</span><small>LEAD STORY / 01</small></div>
              <PublicImage image={featured.image} className="lead-image" />
              <div className="lead-copy"><div className="story-meta"><span>{featured.category}</span><span>{formatDate(featured.date)}</span></div><h1 className={!featured.title ? 'placeholder-text' : ''}>{featured.title || '未命名头条新闻'}</h1><p>{featured.summary || '这条新闻尚未填写摘要。'}</p><div className="byline"><span><CircleUserRound size={15} /> {featured.author || '匿名作者'}</span><button type="button"><ArrowRight size={17} /> 阅读全文</button></div></div>
            </article>
            <aside className="news-wire">
              <div className="wire-heading"><div><span className="section-kicker">LATEST DISPATCHES</span><h2>新闻速报</h2></div><span className="wire-count">{String(Math.max(data.articles.length - 1, 0)).padStart(2, '0')}</span></div>
              <div className="wire-list">{data.articles.filter((article) => article.id !== featured.id).slice(0, 4).map((article, index) => <button type="button" className="wire-item" key={article.id} onClick={() => setReaderId(article.id)}><span className="wire-number">{String(index + 1).padStart(2, '0')}</span><span className="wire-copy"><small>{article.category} / {formatDate(article.date)}</small><strong>{article.title || '未命名新闻'}</strong></span><ArrowRight size={15} /></button>)}</div>
              <div className="wire-note"><Clock3 size={18} /><div><strong>世界国公共新闻服务</strong><p>此页面由编辑者发布，访客只能阅读。</p></div></div>
            </aside>
          </section>
        ) : (
          <section className="section-heading filtered-heading"><div><span className="section-kicker">NEWS ARCHIVE</span><h2>{category}新闻</h2></div><span>{visibleArticles.length} 条新闻</span></section>
        )}

        <section className="news-section">
          <div className="section-heading"><div><span className="section-kicker">THE NEWS MATRIX</span><h2>新闻矩阵</h2></div><span className="section-line" /><span>{visibleArticles.length} STORIES</span></div>
          {visibleArticles.length ? <div className="news-grid">{visibleArticles.map((article, index) => <article className="news-card" key={article.id} onClick={() => setReaderId(article.id)}><div className="card-image-wrap"><PublicImage image={article.image} className="card-image" /><span className="card-index">{String(index + 1).padStart(2, '0')}</span>{article.featured && <span className="featured-badge">头条</span>}</div><div className="card-copy"><div className="story-meta"><span>{article.category}</span><span>{formatDate(article.date)}</span></div><h3>{article.title || '未命名新闻'}</h3><p>{article.summary || '这条新闻尚未填写摘要。'}</p><div className="card-footer"><span>{article.author || '匿名作者'}</span><button type="button" aria-label="阅读新闻"><ArrowRight size={17} /></button></div></div></article>)}</div> : <div className="empty-results"><Newspaper size={30} /><h3>这个分类还没有公开新闻</h3><p>选择其他分类继续浏览。</p></div>}
        </section>

        <section className="manifesto-banner"><span className="manifesto-symbol">“</span><div><span className="section-kicker">A SPACE FOR YOUR IDEAS</span><h2>今日的新闻，明日的幸福。</h2></div></section>
      </main>

      <footer className="site-footer"><div className="page-width footer-inner"><div className="footer-brand"><Newspaper size={25} /><strong>{data.siteName}</strong><span>公开分享 · 只读</span></div><p>发布于 {new Date(record.updatedAt).toLocaleString('zh-CN')} · 内容以编辑者最新发布版本为准</p><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>回到顶部 <ArrowUpFromLine size={15} /></button></div></footer>

      {readerArticle && (
        <div className="modal-backdrop reader-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setReaderId(null) }}>
          <article className="reader-modal" role="dialog" aria-modal="true" aria-label="阅读新闻">
            <header className="reader-toolbar"><button type="button" onClick={() => setReaderId(null)}><ArrowLeft size={17} /> 返回分享页</button><div><button type="button" className="icon-button" onClick={() => setReaderId(null)} aria-label="关闭阅读"><X size={19} /></button></div></header>
            <div className="reader-content"><div className="reader-meta"><span>{readerArticle.category}</span><span>{formatDate(readerArticle.date)}</span><span>{data.issue}</span></div><h1>{readerArticle.title || '未命名新闻'}</h1><p className="reader-deck">{readerArticle.summary || '这条新闻尚未填写摘要。'}</p><div className="reader-byline"><CircleUserRound size={17} /><span>{readerArticle.author || '匿名作者'}</span><span>·</span><span>约 {Math.max(1, Math.ceil(readerArticle.body.length / 400))} 分钟阅读</span></div><PublicImage image={readerArticle.image} className="reader-image" /><div className="reader-body">{readerArticle.body ? readerArticle.body.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p className="placeholder-text">这条新闻尚未填写正文。</p>}</div><div className="reader-end">END OF DISPATCH</div></div>
          </article>
        </div>
      )}
    </div>
  )
}
