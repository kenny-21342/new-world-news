import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpFromLine,
  Bookmark,
  Check,
  ChevronDown,
  CircleUserRound,
  Clock3,
  Contrast,
  Download,
  Edit3,
  Eye,
  FileText,
  ImagePlus,
  Menu,
  Moon,
  MoreHorizontal,
  Move,
  Newspaper,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Share2,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  X,
  ZoomIn,
  Heart,
  Type,
} from 'lucide-react'
import {
  ArchiveEditorModal,
  ArchiveReaderModal,
  ArchiveSection,
  LoginModal,
  makeArchive,
  roleNames,
  type Role,
  type SecretArchive,
} from './access'
import {
  ControllerDashboard,
  IntelligenceControlDesk,
  IntelligenceEditorModal,
  TopSecretEditorModal,
  TopSecretLockModal,
  TopSecretReaderModal,
  normalizeIntelligence,
  type IntelligenceData,
  type TopSecretDocument,
} from './controller'
import CitizenStatus from './CitizenStatus'
import { CasteSelector, casteInfo, type Caste } from './CasteSelector'
import { CitizenAd } from './CitizenAds'
import CloudShareControls from './CloudShareControls'
import { seedArchives, seedTopSecret } from './seedArchives'
import { seedTicker, seedNewsArticles, seedSituationEvents, seedDataMetrics } from './seedContent'
import './App.css'

type ImageSettings = {
  src: string
  zoom: number
  x: number
  y: number
  brightness: number
  grayscale: number
}

export type Article = {
  id: string
  title: string
  category: string
  summary: string
  body: string
  author: string
  date: string
  featured: boolean
  createdAt: number
  image: ImageSettings
}

export type SiteData = {
  siteName: string
  englishName: string
  motto: string
  issue: string
  ticker: string
  articles: Article[]
  archives: SecretArchive[]
  intelligence: IntelligenceData
}

type Reaction = { liked: boolean; saved: boolean }

const STORAGE_KEY = 'brave-new-world-newsroom-v1'
const REACTION_KEY = 'brave-new-world-reactions-v1'
const ROLE_KEY = 'brave-new-world-role-v1'
const categories = ['全部', '社会', '科技', '文化', '观点']

const blankImage = (): ImageSettings => ({
  src: '',
  zoom: 1,
  x: 0,
  y: 0,
  brightness: 100,
  grayscale: 0,
})

const makeArticle = (featured = false): Article => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: '',
  category: '社会',
  summary: '',
  body: '',
  author: '',
  date: '',
  featured,
  createdAt: Date.now(),
  image: blankImage(),
})

const initialData: SiteData = {
  siteName: '新世界新闻',
  englishName: 'THE NEW WORLD CHRONICLE',
  motto: '记录秩序，也记录思想',
  issue: 'VOL. 001',
  ticker: seedTicker,
  articles: seedNewsArticles,
  archives: seedArchives,
  intelligence: {
    events: seedSituationEvents,
    metrics: seedDataMetrics,
    topSecret: seedTopSecret,
  },
}

function loadData(): SiteData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return initialData
    const parsed = JSON.parse(saved) as SiteData
    if (!Array.isArray(parsed.articles)) return initialData
    const transferredToTopSecret = ['ws-archive-05', 'ws-archive-07', 'ws-archive-10', 'ws-archive-12', 'ws-archive-70', 'ws-archive-73']
    const savedArchives = (Array.isArray(parsed.archives) ? parsed.archives : []).filter((archive) => !transferredToTopSecret.includes(archive.id))
    const savedArchiveIds = new Set(savedArchives.map((archive) => archive.id))
    const migratedSavedArchives = savedArchives.map((archive) =>
      archive.id === 'ws-archive-70' && archive.title === '档案 70：世界国最后一次主宰者会议'
        ? seedArchives.find((seed) => seed.id === archive.id) || archive
        : archive,
    )
    const archives = [...seedArchives.filter((archive) => !savedArchiveIds.has(archive.id)), ...migratedSavedArchives]
    const intelligence = normalizeIntelligence(parsed.intelligence)
    if ((!intelligence.topSecret.title && !intelligence.topSecret.body) || intelligence.topSecret.title.startsWith('绝密档案 70：') || (intelligence.topSecret.title === seedTopSecret.title && !intelligence.topSecret.body.includes('绝密封存附件 WS-005'))) intelligence.topSecret = seedTopSecret
    return {
      ...initialData,
      ...parsed,
      articles: parsed.articles.map((article) => ({
        ...makeArticle(),
        ...article,
        image: {
          ...blankImage(),
          ...article.image,
          src: article.image?.src || seedNewsArticles.find((seed) => seed.id === article.id)?.image.src || '',
        },
      })),
      archives: archives.map((archive, index) => ({ ...makeArchive(index), ...archive })),
      intelligence,
    }
  } catch {
    return initialData
  }
}

function formatDate(date: string) {
  if (!date) return '日期待定'
  const [year, month, day] = date.split('-')
  return `${year}.${month}.${day}`
}

function allocateArticle(article: Article, caste: Caste, isCitizen: boolean): Article {
  if (!isCitizen || caste === 'alpha' || caste === 'beta') return article
  if (caste === 'gamma') return { ...article, summary: article.summary.split(/[。！？]/)[0] + '。相关活动与消费积分已按您的岗位配给。' }
  if (caste === 'delta') return { ...article, summary: '请留意所在编组的班次、交通与配给通知，按时参加集体活动。', body: `${article.title}\n\n本通告已按德尔塔岗位需要简化。请服从编组安排，保持生产节奏，下班后按时领取唆麻。` }
  return { ...article, title: article.category === '科技' ? '生产设备运行正常' : article.category === '文化' ? '统一娱乐准时开放' : '今日公共生活通知', summary: '工作时间不变。下班后请按时领取唆麻。', body: '工作时间不变。\n\n请参加统一娱乐，保持微笑。\n\n下班后请按时领取唆麻。' }
}

function NewsImage({
  image,
  className = '',
  editable = false,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  image: ImageSettings
  className?: string
  editable?: boolean
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>
  onPointerMove?: React.PointerEventHandler<HTMLDivElement>
  onPointerUp?: React.PointerEventHandler<HTMLDivElement>
}) {
  return (
    <div
      className={`news-image ${image.src ? 'has-image' : 'is-empty'} ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {image.src ? (
        <img
          src={image.src}
          alt="新闻封面"
          draggable={false}
          style={{
            transform: `translate(${image.x}%, ${image.y}%) scale(${image.zoom})`,
            filter: `brightness(${image.brightness}%) grayscale(${image.grayscale}%)`,
          }}
        />
      ) : (
        <div className="image-placeholder">
          <span className="placeholder-corner corner-a" />
          <span className="placeholder-corner corner-b" />
          <ImagePlus size={30} strokeWidth={1.4} />
          <strong>{editable ? '添加核准新闻图片' : '图像待核准'}</strong>
          <small>公共影像处 · 标准横向制式</small>
        </div>
      )}
    </div>
  )
}

function IconButton({
  label,
  children,
  onClick,
  active = false,
}: {
  label: string
  children: React.ReactNode
  onClick: () => void
  active?: boolean
}) {
  return (
    <button type="button" className={`icon-button ${active ? 'active' : ''}`} onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  )
}

export default function App() {
  const [data, setData] = useState<SiteData>(loadData)
  const [role, setRole] = useState<Role>(() => {
    const saved = sessionStorage.getItem(ROLE_KEY)
    return saved === 'editor' || saved === 'controller' ? saved : 'citizen'
  })
  const [editing, setEditing] = useState(role === 'editor')
  const [loginOpen, setLoginOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [caste, setCaste] = useState<Caste>('beta')
  const [category, setCategory] = useState('全部')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [draft, setDraft] = useState<Article | null>(null)
  const [archiveDraft, setArchiveDraft] = useState<SecretArchive | null>(null)
  const [archiveReaderId, setArchiveReaderId] = useState<string | null>(null)
  const [intelligenceDraft, setIntelligenceDraft] = useState<IntelligenceData | null>(null)
  const [topSecretDraft, setTopSecretDraft] = useState<TopSecretDocument | null>(null)
  const [secretLockOpen, setSecretLockOpen] = useState(false)
  const [secretReaderOpen, setSecretReaderOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [siteDraft, setSiteDraft] = useState(data)
  const [readerId, setReaderId] = useState<string | null>(null)
  const [readerSize, setReaderSize] = useState(19)
  const [reactions, setReactions] = useState<Record<string, Reaction>>(() => {
    try {
      return JSON.parse(localStorage.getItem(REACTION_KEY) || '{}')
    } catch {
      return {}
    }
  })
  const [saveStatus, setSaveStatus] = useState('已自动保存')
  const [toast, setToast] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<{ pointerId: number; x: number; y: number; imageX: number; imageY: number } | null>(null)

  const isEditor = role === 'editor'
  const canSeeArchives = role !== 'citizen'
  const citizenArticles = useMemo(() => role === 'citizen' ? data.articles.slice(0, casteInfo[caste].count) : data.articles, [data.articles, role, caste])
  const featuredSource = citizenArticles.find((article) => article.featured) || citizenArticles[0]
  const featured = featuredSource ? allocateArticle(featuredSource, caste, role === 'citizen') : undefined
  const readerSource = citizenArticles.find((article) => article.id === readerId)
  const readerArticle = readerSource ? allocateArticle(readerSource, caste, role === 'citizen') : undefined
  const readerArchive = canSeeArchives ? data.archives.find((archive) => archive.id === archiveReaderId) : undefined
  const hasFilter = category !== '全部' || query.trim().length > 0

  const visibleArticles = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return citizenArticles.filter((article) => {
      const categoryMatch = category === '全部' || article.category === category
      const searchMatch = !keyword || `${article.title} ${article.summary} ${article.author}`.toLowerCase().includes(keyword)
      const featureMatch = hasFilter || article.id !== featured?.id
      return categoryMatch && searchMatch && featureMatch
    }).map((article) => allocateArticle(article, caste, role === 'citizen'))
  }, [citizenArticles, category, query, hasFilter, featured?.id, caste, role])

  const modalOpen = Boolean(draft || archiveDraft || intelligenceDraft || topSecretDraft || secretLockOpen || secretReaderOpen || settingsOpen || readerArticle || readerArchive || loginOpen)

  useEffect(() => {
    setSaveStatus('保存中…')
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        setSaveStatus('已自动保存')
      } catch {
        setSaveStatus('图片过大，暂未保存')
      }
    }, 350)
    return () => window.clearTimeout(timer)
  }, [data])

  useEffect(() => {
    localStorage.setItem(REACTION_KEY, JSON.stringify(reactions))
  }, [reactions])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    sessionStorage.setItem(ROLE_KEY, role)
    if (role !== 'editor') {
      setEditing(false)
      setDraft(null)
      setArchiveDraft(null)
      setIntelligenceDraft(null)
      setTopSecretDraft(null)
      setSettingsOpen(false)
      setExportOpen(false)
    }
    if (role === 'citizen') setArchiveReaderId(null)
    if (role !== 'controller') {
      setSecretLockOpen(false)
      setSecretReaderOpen(false)
    }
  }, [role])

  useEffect(() => {
    if (!modalOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDraft(null)
        setArchiveDraft(null)
        setArchiveReaderId(null)
        setIntelligenceDraft(null)
        setTopSecretDraft(null)
        setSecretLockOpen(false)
        setSecretReaderOpen(false)
        setSettingsOpen(false)
        setReaderId(null)
        setLoginOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [modalOpen])

  const showToast = (message: string) => setToast(message)

  const authenticate = (nextRole: Role) => {
    setRole(nextRole)
    setEditing(nextRole === 'editor')
    setLoginOpen(false)
    setReaderId(null)
    setArchiveReaderId(null)
    setSecretLockOpen(false)
    setSecretReaderOpen(false)
    setQuery('')
    setSearchOpen(false)
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    showToast(nextRole === 'citizen' ? '已退出，当前为世界公民界面' : `身份验证通过：${roleNames[nextRole]}`)
  }

  const openEditor = (article: Article) => {
    if (!isEditor) return
    setDraft(JSON.parse(JSON.stringify(article)) as Article)
  }

  const openArticle = (article: Article) => {
    if (isEditor && editing) openEditor(article)
    else setReaderId(article.id)
  }

  const addArticle = () => {
    if (!isEditor) return
    setEditing(true)
    setDraft(makeArticle())
  }

  const saveArticle = () => {
    if (!draft || !isEditor) return
    setData((current) => {
      const exists = current.articles.some((article) => article.id === draft.id)
      let articles = exists
        ? current.articles.map((article) => (article.id === draft.id ? draft : article))
        : [draft, ...current.articles]
      if (draft.featured) articles = articles.map((article) => ({ ...article, featured: article.id === draft.id }))
      return { ...current, articles }
    })
    setDraft(null)
    showToast('新闻已保存到页面')
  }

  const deleteArticle = () => {
    if (!draft || !isEditor || !window.confirm('确定删除这条新闻吗？此操作无法撤销。')) return
    setData((current) => ({ ...current, articles: current.articles.filter((article) => article.id !== draft.id) }))
    setDraft(null)
    setReaderId(null)
    showToast('新闻已删除')
  }

  const openArchive = (archive: SecretArchive) => {
    if (!canSeeArchives) return
    if (isEditor) setArchiveDraft({ ...archive })
    else setArchiveReaderId(archive.id)
  }

  const saveArchive = () => {
    if (!archiveDraft || !isEditor) return
    setData((current) => {
      const exists = current.archives.some((archive) => archive.id === archiveDraft.id)
      return {
        ...current,
        archives: exists
          ? current.archives.map((archive) => archive.id === archiveDraft.id ? archiveDraft : archive)
          : [archiveDraft, ...current.archives],
      }
    })
    setArchiveDraft(null)
    showToast('真实档案已加密保存')
  }

  const deleteArchive = () => {
    if (!archiveDraft || !isEditor || !window.confirm('确定删除这份真实档案吗？此操作无法撤销。')) return
    setData((current) => ({ ...current, archives: current.archives.filter((archive) => archive.id !== archiveDraft.id) }))
    setArchiveDraft(null)
    showToast('真实档案已删除')
  }

  const saveIntelligence = () => {
    if (!intelligenceDraft || !isEditor) return
    setData((current) => ({ ...current, intelligence: intelligenceDraft }))
    setIntelligenceDraft(null)
    showToast('形势变化与数据已更新')
  }

  const saveTopSecret = () => {
    if (!topSecretDraft || !isEditor) return
    setData((current) => ({ ...current, intelligence: { ...current.intelligence, topSecret: topSecretDraft } }))
    setTopSecretDraft(null)
    showToast('绝密文档已保存')
  }

  const updateDraft = <K extends keyof Article>(key: K, value: Article[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current))
  }

  const updateImage = <K extends keyof ImageSettings>(key: K, value: ImageSettings[K]) => {
    setDraft((current) => (current ? { ...current, image: { ...current.image, [key]: value } } : current))
  }

  const uploadImage = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast('图片请小于 8 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      updateImage('src', String(reader.result))
      setDraft((current) => current ? { ...current, image: { ...blankImage(), src: String(reader.result) } } : current)
      showToast('图片已载入，可拖动调整构图')
    }
    reader.readAsDataURL(file)
  }

  const startImageDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draft?.image.src) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      imageX: draft.image.x,
      imageY: draft.image.y,
    }
  }

  const moveImage = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const rect = event.currentTarget.getBoundingClientRect()
    updateImage('x', Math.max(-50, Math.min(50, drag.imageX + ((event.clientX - drag.x) / rect.width) * 100)))
    updateImage('y', Math.max(-50, Math.min(50, drag.imageY + ((event.clientY - drag.y) / rect.height) * 100)))
  }

  const endImageDrag = () => {
    dragRef.current = null
  }

  const exportData = () => {
    if (!isEditor) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '新世界新闻-内容备份.json'
    link.click()
    URL.revokeObjectURL(url)
    setExportOpen(false)
    showToast('内容备份已导出')
  }

  const importData = (file?: File) => {
    if (!file || !isEditor) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result)) as SiteData
        if (!Array.isArray(imported.articles)) throw new Error('invalid')
        const archives = Array.isArray(imported.archives) ? imported.archives : initialData.archives
        setData({
          ...initialData,
          ...imported,
          articles: imported.articles.map((article) => ({
            ...makeArticle(),
            ...article,
            image: { ...blankImage(), ...article.image },
          })),
          archives: archives.map((archive, index) => ({ ...makeArchive(index), ...archive })),
          intelligence: normalizeIntelligence(imported.intelligence),
        })
        setExportOpen(false)
        showToast('内容备份已恢复')
      } catch {
        showToast('无法读取，请选择本网站导出的备份文件')
      }
    }
    reader.readAsText(file)
  }

  const saveSettings = () => {
    if (!isEditor) return
    setData((current) => ({ ...current, ...siteDraft, articles: current.articles, archives: current.archives, intelligence: current.intelligence }))
    setSettingsOpen(false)
    showToast('站点设置已更新')
  }

  const toggleReaction = (id: string, key: keyof Reaction) => {
    setReactions((current) => {
      const previous: Reaction = current[id] || { liked: false, saved: false }
      return {
        ...current,
        [id]: { ...previous, [key]: !previous[key] },
      }
    })
  }

  const shareArticle = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showToast('页面链接已复制')
    } catch {
      showToast('可复制浏览器地址分享页面')
    }
  }

  const fordDate = `福特纪元 632 年 · ${new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', weekday: 'short' }).format(new Date())}`

  return (
    <div className={`app-shell ${dark ? 'night' : ''}`}>
      <div className="top-strip">
        <div className="page-width strip-inner">
          <span><span className="live-dot" /> WORLD STATE NEWS NETWORK</span>
          <span className="strip-message">{data.ticker || '在站点设置中填写你的滚动快讯'}</span>
          <span>{data.issue}</span>
        </div>
      </div>

      <header className="site-header page-width">
        <div className="masthead-row">
          <div className="date-block">
            <span>{fordDate}</span>
            <small>伦敦中央编辑部</small>
          </div>
          <button className="brand" type="button" onClick={() => { setCategory('全部'); setQuery(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <span className="brand-mark">NW</span>
            <span className="brand-copy">
              <strong>{data.siteName || '未命名新闻社'}</strong>
              <small>{data.englishName}</small>
            </span>
          </button>
          <div className="header-tools">
            <IconButton label={dark ? '切换日间模式' : '切换夜间模式'} onClick={() => setDark(!dark)}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
            {isEditor && <IconButton label="站点设置" onClick={() => { setSiteDraft(data); setSettingsOpen(true) }}><Settings2 size={18} /></IconButton>}
            <button type="button" className={`role-button ${role}`} onClick={() => setLoginOpen(true)} aria-label={`当前身份：${roleNames[role]}，点击登录或切换身份`}>
              <CircleUserRound size={17} /><span>{roleNames[role]}</span><small>{role === 'citizen' ? '身份登录' : '切换身份'}</small>
            </button>
          </div>
        </div>

        <div className="nav-row">
          <button className="mobile-menu-button" type="button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="打开导航">
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
          {role === 'controller' ? (
            <nav className={mobileMenu ? 'open' : ''} aria-label="中央档案导航">
              <button type="button" className="active" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenu(false) }}>档案首页</button>
              <button type="button" onClick={() => { document.getElementById('situation-changes')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenu(false) }}>形势变化</button>
              <button type="button" onClick={() => { document.getElementById('data-changes')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenu(false) }}>数据变动</button>
              <button type="button" onClick={() => { document.getElementById('past-archives')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenu(false) }}>往期档案</button>
            </nav>
          ) : (
            <nav className={mobileMenu ? 'open' : ''} aria-label="新闻分类">
              {categories.map((item) => <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => { setCategory(item); setMobileMenu(false) }}>{item === '全部' ? '首页' : item}</button>)}
            </nav>
          )}
          {role !== 'citizen' && <div className={`search-box ${searchOpen ? 'open' : ''}`}>
            {searchOpen && <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={role === 'controller' ? '搜索档案编号、标题…' : '搜索标题、作者…'} aria-label={role === 'controller' ? '搜索往期档案' : '搜索新闻'} />}
            <IconButton label={searchOpen ? '关闭搜索' : role === 'controller' ? '搜索档案' : '搜索新闻'} onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setQuery('') }} active={searchOpen}>{searchOpen ? <X size={18} /> : <Search size={18} />}</IconButton>
          </div>}
        </div>
      </header>

      <main className={`page-width main-content ${role === 'citizen' ? `caste-${caste}` : ''}`}>
        <section className="edition-bar">
          <div>
            <span className="section-kicker">{role === 'controller' ? 'WORLD STATE CENTRAL ARCHIVE' : 'YOUR INDEPENDENT NEWSROOM'}</span>
            <span className="motto">{role === 'controller' ? '真相、数据与历史记录' : data.motto}</span>
          </div>
          <div className="editor-actions">
            {isEditor ? (
              <>
                <span className="save-state"><Check size={14} /> {saveStatus}</span>
                <div className="export-wrap">
                  <button type="button" className="text-button" onClick={() => setExportOpen(!exportOpen)}><MoreHorizontal size={17} /> 内容管理 <ChevronDown size={14} /></button>
                  {exportOpen && <div className="export-menu"><button type="button" onClick={exportData}><Download size={15} /> 导出内容备份</button><button type="button" onClick={() => importRef.current?.click()}><Upload size={15} /> 导入内容备份</button></div>}
                  <input ref={importRef} type="file" accept="application/json" hidden onChange={(event) => { importData(event.target.files?.[0]); event.target.value = '' }} />
                </div>
                <CloudShareControls data={data} />
                <button type="button" className={`mode-button ${editing ? 'is-editing' : ''}`} onClick={() => setEditing(!editing)}>{editing ? <Eye size={17} /> : <Edit3 size={17} />}{editing ? '预览网站' : '编辑模式'}</button>
                <button type="button" className="add-button" onClick={addArticle}><Plus size={18} /> 写新闻</button>
              </>
            ) : (
              <div className="visitor-actions">
                <span><Eye size={14} /> {role === 'controller' ? '最高权限已核验' : '世界国公开信息频道'}</span>
                {role === 'controller' && <button type="button" className="mode-button" onClick={() => setSecretLockOpen(true)}><FileText size={16} /> 绝密文档</button>}
              </div>
            )}
          </div>
        </section>

        {role === 'citizen' && <><CitizenStatus /><CasteSelector caste={caste} onChange={(next) => { setCaste(next); setCategory('全部'); setReaderId(null) }} /></>}

        {isEditor && editing && (
          <div className="edit-notice"><Sparkles size={17} /><span><strong>编辑者权限已开启。</strong> 点击任意新闻框架填写内容；向下可管理真实档案。</span><button type="button" onClick={() => setEditing(false)}>预览编辑结果 <ArrowRight size={15} /></button></div>
        )}

        {role === 'controller' ? (
          <ControllerDashboard intelligence={data.intelligence} archives={data.archives} archiveQuery={query} onOpenArchive={openArchive} onOpenTopSecret={() => setSecretLockOpen(true)} />
        ) : (
          <>
        {!hasFilter && featured ? (
          <section className="lead-layout">
            <article className={`lead-story ${editing ? 'editable-frame' : ''}`} onClick={() => openArticle(featured)}>
              <div className="story-label"><span>今日头条</span><small>LEAD STORY / 01</small></div>
              <NewsImage image={featured.image} className="lead-image" editable={editing} />
              <div className="lead-copy">
                <div className="story-meta"><span>{featured.category}</span><span>{formatDate(featured.date)}</span></div>
                <h1 className={!featured.title ? 'placeholder-text' : ''}>{featured.title || '你的头条，从这里开始'}</h1>
                <p className={!featured.summary ? 'placeholder-text' : ''}>{featured.summary || '点击此框架，写下最重要的新闻摘要。它会出现在官网最醒目的位置。'}</p>
                <div className="byline">
                  <span><CircleUserRound size={15} /> {featured.author || '作者待填写'}</span>
                  <button type="button">{editing ? <Edit3 size={16} /> : <ArrowRight size={17} />} {editing ? '编辑头条' : '阅读全文'}</button>
                </div>
              </div>
              {editing && <span className="frame-edit-badge"><Edit3 size={13} /> 点击编辑</span>}
            </article>

            <aside className="news-wire">
              <div className="wire-heading">
                <div><span className="section-kicker">LATEST DISPATCHES</span><h2>新闻速报</h2></div>
                <span className="wire-count">{String(Math.max(citizenArticles.length - 1, 0)).padStart(2, '0')}</span>
              </div>
              <div className="wire-list">
                {citizenArticles.filter((article) => article.id !== featured.id).slice(0, 4).map((article, index) => (
                  <button type="button" className="wire-item" key={article.id} onClick={() => openArticle(article)}>
                    <span className="wire-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="wire-copy">
                      <small>{article.category} / {formatDate(article.date)}</small>
                      <strong className={!article.title ? 'placeholder-text' : ''}>{article.title || '待填写的新闻标题'}</strong>
                    </span>
                    {editing ? <Edit3 size={15} /> : <ArrowRight size={15} />}
                  </button>
                ))}
              </div>
              {isEditor && <button type="button" className="wire-add" onClick={addArticle}><Plus size={16} /> 添加一条新闻</button>}
              <div className="wire-note">
                <Clock3 size={18} />
                <div><strong>{isEditor ? '中央新闻内容维护' : '世界国公共新闻服务'}</strong><p>{isEditor ? '授权文稿保存于本机内网终端，请定期归档备份。' : '当前为世界公民公共信息层级。'}</p></div>
              </div>
            </aside>
          </section>
        ) : (
          <section className="section-heading filtered-heading">
            <div><span className="section-kicker">NEWS ARCHIVE</span><h2>{query ? `“${query}”的搜索结果` : category === '全部' ? '全部新闻' : `${category}新闻`}</h2></div>
            <span>{visibleArticles.length} 条新闻</span>
          </section>
        )}

        <section className="news-section">
          <div className="section-heading">
            <div><span className="section-kicker">THE NEWS MATRIX</span><h2>{hasFilter ? '新闻列表' : '新闻矩阵'}</h2></div>
            <span className="section-line" />
            <span>{visibleArticles.length} STORIES</span>
          </div>

          {visibleArticles.length ? (
            <div className="news-grid">
              {visibleArticles.map((article, index) => (
                <Fragment key={article.id}>
                  <article className={`news-card ${editing ? 'editable-frame' : ''}`} onClick={() => openArticle(article)}>
                    <div className="card-image-wrap">
                      <NewsImage image={article.image} className="card-image" editable={editing} />
                      <span className="card-index">{String(index + 1).padStart(2, '0')}</span>
                      {article.featured && <span className="featured-badge">头条</span>}
                    </div>
                    <div className="card-copy">
                      <div className="story-meta"><span>{article.category}</span><span>{formatDate(article.date)}</span></div>
                      <h3 className={!article.title ? 'placeholder-text' : ''}>{article.title || '点击填写新闻标题'}</h3>
                      <p className={!article.summary ? 'placeholder-text' : ''}>{article.summary || '用一两句话写下这条新闻的摘要，吸引读者继续阅读。'}</p>
                      <div className="card-footer">
                        <span>{article.author || '作者待填写'}</span>
                        <button type="button" aria-label={editing ? '编辑新闻' : '阅读新闻'}>{editing ? <Edit3 size={16} /> : <ArrowRight size={17} />}</button>
                      </div>
                    </div>
                    {editing && <span className="frame-edit-badge"><Edit3 size={13} /> 点击编辑</span>}
                  </article>
                  {!editing && [1, 3, 6, 9, 12, 15].includes(index) && <CitizenAd slot={[1, 3, 6, 9, 12, 15].indexOf(index)} />}
                  {!editing && role === 'citizen' && (caste === 'delta' || caste === 'epsilon') && index === 0 && <CitizenAd slot={caste === 'delta' ? 4 : 0} />}
                </Fragment>
              ))}
              {editing && (
                <button type="button" className="empty-add-card" onClick={addArticle}>
                  <span><Plus size={28} /></span>
                  <strong>创建下一条新闻</strong>
                  <small>文字、图片与排版都已准备好</small>
                </button>
              )}
            </div>
          ) : (
            <div className="empty-results">
              <Search size={30} />
              <h3>这里还没有匹配的新闻</h3>
              <p>{isEditor ? '换个关键词，或创建一条新新闻。' : '换个分类或关键词，继续浏览公开新闻。'}</p>
              {isEditor && <button type="button" className="add-button" onClick={addArticle}><Plus size={17} /> 写新闻</button>}
            </div>
          )}
        </section>

        {isEditor && <IntelligenceControlDesk intelligence={data.intelligence} onEditIntelligence={() => setIntelligenceDraft(JSON.parse(JSON.stringify(data.intelligence)) as IntelligenceData)} onEditTopSecret={() => setTopSecretDraft({ ...data.intelligence.topSecret })} />}

        {canSeeArchives && <ArchiveSection archives={data.archives} canEdit={isEditor} onSelect={openArchive} onAdd={() => setArchiveDraft(makeArchive(data.archives.length))} />}

        <section className="manifesto-banner">
          <span className="manifesto-symbol">“</span>
          <div><span className="section-kicker">COMMUNITY · IDENTITY · STABILITY</span><h2>{isEditor ? '每一条核准的信息，都在维护共同的幸福。' : '今日的新闻，明日的幸福。'}</h2></div>
          {isEditor && <button type="button" onClick={addArticle}>拟写公共通告 <ArrowRight size={18} /></button>}
        </section>
          </>
        )}
      </main>

      <footer className="site-footer">
        <div className="page-width footer-inner">
          <div className="footer-brand"><Newspaper size={25} /><strong>{data.siteName}</strong><span>© 新世界新闻编辑部</span></div>
          <p>世界国中央新闻总署核准 · 共同体、身份、稳定</p>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>回到顶部 <ArrowUpFromLine size={15} /></button>
        </div>
      </footer>

      {isEditor && draft && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDraft(null) }}>
          <section className="editor-modal" role="dialog" aria-modal="true" aria-label="编辑新闻">
            <header className="modal-header">
              <div><span className="section-kicker">NEWSROOM EDITOR</span><h2>{data.articles.some((article) => article.id === draft.id) ? '编辑新闻' : '创建新闻'}</h2></div>
              <IconButton label="关闭编辑器" onClick={() => setDraft(null)}><X size={21} /></IconButton>
            </header>
            <div className="editor-body">
              <div className="article-fields">
                <label className="field full-field">
                  <span>新闻标题 <small>{draft.title.length}/60</small></span>
                  <input className="title-input" value={draft.title} maxLength={60} onChange={(event) => updateDraft('title', event.target.value)} placeholder="输入一个醒目的标题" />
                </label>
                <div className="field-row">
                  <label className="field"><span>新闻分类</span><select value={draft.category} onChange={(event) => updateDraft('category', event.target.value)}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
                  <label className="field"><span>发布日期</span><input type="date" value={draft.date} onChange={(event) => updateDraft('date', event.target.value)} /></label>
                </div>
                <label className="field full-field"><span>作者 / 署名</span><input value={draft.author} onChange={(event) => updateDraft('author', event.target.value)} placeholder="你的名字或栏目名称" /></label>
                <label className="field full-field"><span>新闻摘要 <small>{draft.summary.length}/160</small></span><textarea className="summary-input" value={draft.summary} maxLength={160} onChange={(event) => updateDraft('summary', event.target.value)} placeholder="用一两句话概括新闻内容" /></label>
                <label className="field full-field"><span>正文内容 <small>支持换行分段</small></span><textarea className="body-input" value={draft.body} onChange={(event) => updateDraft('body', event.target.value)} placeholder={'在这里写下完整新闻……\n\n按 Enter 键开始新的段落。'} /></label>
                <label className="featured-toggle"><input type="checkbox" checked={draft.featured} onChange={(event) => updateDraft('featured', event.target.checked)} /><span><strong>设为首页头条</strong><small>将替换当前头条，其他新闻不受影响</small></span></label>
              </div>

              <aside className="image-editor">
                <div className="image-editor-heading"><div><span className="section-kicker">VISUAL DESK</span><h3>封面图片</h3></div><Move size={19} /></div>
                <NewsImage
                  image={draft.image}
                  className="editor-image-preview"
                  editable
                  onPointerDown={startImageDrag}
                  onPointerMove={moveImage}
                  onPointerUp={endImageDrag}
                />
                <p className="image-hint">{draft.image.src ? '按住图片拖动，调整新闻构图' : '上传图片后，可在这里直接编辑'}</p>
                <div className="upload-row">
                  <label className="upload-button"><ImagePlus size={16} /> {draft.image.src ? '更换图片' : '上传图片'}<input type="file" accept="image/*" hidden onChange={(event) => { uploadImage(event.target.files?.[0]); event.target.value = '' }} /></label>
                  {draft.image.src && <button type="button" className="remove-image" onClick={() => updateImage('src', '')}>移除</button>}
                </div>
                <div className={`image-controls ${!draft.image.src ? 'disabled' : ''}`}>
                  <label><span><ZoomIn size={14} /> 缩放</span><output>{draft.image.zoom.toFixed(1)}×</output><input disabled={!draft.image.src} type="range" min="1" max="3" step="0.05" value={draft.image.zoom} onChange={(event) => updateImage('zoom', Number(event.target.value))} /></label>
                  <label><span><Sun size={14} /> 亮度</span><output>{draft.image.brightness}%</output><input disabled={!draft.image.src} type="range" min="40" max="160" value={draft.image.brightness} onChange={(event) => updateImage('brightness', Number(event.target.value))} /></label>
                  <label><span><Contrast size={14} /> 黑白</span><output>{draft.image.grayscale}%</output><input disabled={!draft.image.src} type="range" min="0" max="100" value={draft.image.grayscale} onChange={(event) => updateImage('grayscale', Number(event.target.value))} /></label>
                  <button type="button" className="reset-image" disabled={!draft.image.src} onClick={() => setDraft((current) => current ? { ...current, image: { ...blankImage(), src: current.image.src } } : current)}><RotateCcw size={14} /> 重置图片调整</button>
                </div>
              </aside>
            </div>
            <footer className="modal-footer">
              <button type="button" className="delete-button" onClick={deleteArticle}><Trash2 size={16} /> 删除新闻</button>
              <div><button type="button" className="cancel-button" onClick={() => setDraft(null)}>取消</button><button type="button" className="save-button" onClick={saveArticle}><Check size={17} /> 保存并发布</button></div>
            </footer>
          </section>
        </div>
      )}

      {isEditor && settingsOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false) }}>
          <section className="settings-modal" role="dialog" aria-modal="true" aria-label="站点设置">
            <header className="modal-header"><div><span className="section-kicker">SITE IDENTITY</span><h2>站点设置</h2></div><IconButton label="关闭设置" onClick={() => setSettingsOpen(false)}><X size={21} /></IconButton></header>
            <div className="settings-fields">
              <label className="field"><span>网站名称</span><input value={siteDraft.siteName} onChange={(event) => setSiteDraft({ ...siteDraft, siteName: event.target.value })} /></label>
              <label className="field"><span>英文名称</span><input value={siteDraft.englishName} onChange={(event) => setSiteDraft({ ...siteDraft, englishName: event.target.value })} /></label>
              <label className="field"><span>刊号 / 期数</span><input value={siteDraft.issue} onChange={(event) => setSiteDraft({ ...siteDraft, issue: event.target.value })} /></label>
              <label className="field"><span>报纸标语</span><input value={siteDraft.motto} onChange={(event) => setSiteDraft({ ...siteDraft, motto: event.target.value })} /></label>
              <label className="field"><span>顶部滚动快讯</span><textarea value={siteDraft.ticker} onChange={(event) => setSiteDraft({ ...siteDraft, ticker: event.target.value })} /></label>
              <div className="settings-tip"><FileText size={18} /><p>新闻正文在首页的新闻框架中编辑。建议定期使用“内容管理 → 导出内容备份”保存你的作品。</p></div>
            </div>
            <footer className="modal-footer"><span /><div><button type="button" className="cancel-button" onClick={() => setSettingsOpen(false)}>取消</button><button type="button" className="save-button" onClick={saveSettings}><Check size={17} /> 保存设置</button></div></footer>
          </section>
        </div>
      )}

      {readerArticle && (
        <div className="modal-backdrop reader-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setReaderId(null) }}>
          <article className="reader-modal" role="dialog" aria-modal="true" aria-label="阅读新闻">
            <header className="reader-toolbar">
              <button type="button" onClick={() => setReaderId(null)}><ArrowLeft size={17} /> 返回首页</button>
              <div><IconButton label="切换正文字号" onClick={() => setReaderSize(readerSize >= 22 ? 17 : readerSize + 2)}><Type size={18} /></IconButton><IconButton label="分享页面" onClick={shareArticle}><Share2 size={18} /></IconButton><IconButton label="关闭阅读" onClick={() => setReaderId(null)}><X size={19} /></IconButton></div>
            </header>
            <div className="reader-content">
              <div className="reader-meta"><span>{readerArticle.category}</span><span>{formatDate(readerArticle.date)}</span><span>{data.issue}</span></div>
              <h1 className={!readerArticle.title ? 'placeholder-text' : ''}>{readerArticle.title || '尚未填写新闻标题'}</h1>
              <p className="reader-deck">{readerArticle.summary || '这条新闻的摘要还未填写。'}</p>
              <div className="reader-byline"><CircleUserRound size={17} /><span>{readerArticle.author || '匿名作者'}</span><span>·</span><span>约 {Math.max(1, Math.ceil(readerArticle.body.length / 400))} 分钟阅读</span></div>
              <NewsImage image={readerArticle.image} className="reader-image" />
              <div className="reader-body" style={{ fontSize: readerSize }}>
                {readerArticle.body ? readerArticle.body.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p className="placeholder-text">正文留白。返回首页并开启编辑模式，即可写下完整新闻。</p>}
              </div>
              <div className="reader-end">END OF DISPATCH</div>
              <div className="reader-reactions">
                <span>这条新闻给你带来了什么？</span>
                <div><button type="button" className={reactions[readerArticle.id]?.liked ? 'active' : ''} onClick={() => toggleReaction(readerArticle.id, 'liked')}><Heart size={17} fill={reactions[readerArticle.id]?.liked ? 'currentColor' : 'none'} /> {reactions[readerArticle.id]?.liked ? '已共鸣' : '共鸣'}</button><button type="button" className={reactions[readerArticle.id]?.saved ? 'active' : ''} onClick={() => toggleReaction(readerArticle.id, 'saved')}><Bookmark size={17} fill={reactions[readerArticle.id]?.saved ? 'currentColor' : 'none'} /> {reactions[readerArticle.id]?.saved ? '已收藏' : '收藏'}</button></div>
              </div>
            </div>
          </article>
        </div>
      )}

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onAuthenticate={authenticate} />}

      {isEditor && archiveDraft && <ArchiveEditorModal draft={archiveDraft} isNew={!data.archives.some((archive) => archive.id === archiveDraft.id)} onChange={setArchiveDraft} onClose={() => setArchiveDraft(null)} onSave={saveArchive} onDelete={deleteArchive} />}

      {readerArchive && <ArchiveReaderModal archive={readerArchive} onClose={() => setArchiveReaderId(null)} />}

      {isEditor && intelligenceDraft && <IntelligenceEditorModal draft={intelligenceDraft} onChange={setIntelligenceDraft} onClose={() => setIntelligenceDraft(null)} onSave={saveIntelligence} />}

      {isEditor && topSecretDraft && <TopSecretEditorModal draft={topSecretDraft} onChange={setTopSecretDraft} onClose={() => setTopSecretDraft(null)} onSave={saveTopSecret} />}

      {role === 'controller' && secretLockOpen && <TopSecretLockModal onClose={() => setSecretLockOpen(false)} onUnlock={() => { setSecretLockOpen(false); setSecretReaderOpen(true) }} />}

      {role === 'controller' && secretReaderOpen && <TopSecretReaderModal document={data.intelligence.topSecret} onClose={() => setSecretReaderOpen(false)} />}

      {toast && <div className="toast" role="status"><Check size={17} /> {toast}</div>}
    </div>
  )
}
