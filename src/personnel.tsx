import { useState } from 'react'
import { ArrowRight, BadgeCheck, FileKey2, Fingerprint, KeyRound, LockKeyhole, ShieldAlert, ShieldCheck, UserRound, X } from 'lucide-react'
import './personnel.css'

type Profile = {
  id: string
  name: string
  code: string
  region: string
  post: string
  caste: string
  status: string
  access: 'high' | 'candidate'
  summary: string
  background: string
  record: string
  assessment: string
}

const profiles: Profile[] = [
  {
    id: 'mond', name: '穆斯塔法·蒙德', code: 'WS-C-EU-007', region: '西欧区', post: '第 7 任西欧主宰者', caste: 'Alpha-Plus / 特别任命', status: '现任', access: 'high', summary: '主管历史封存、异常思想复核及全球稳定预案。个人借阅权限不受公共禁书目录限制。',
    background: 'A.F. 574 年出生于伦敦中央孵化体系，早期接受历史语言与群体行为训练。曾任睡眠教育课程审查员、中央文明博物馆副馆长。任职期间主持旧世界文本分级工作，主张不以公开镇压处理思想异常，而以配给、娱乐和孤立降低其传播能力。',
    record: 'A.F. 609 年调入西欧主宰者办公室；A.F. 617 年继任。现持日内瓦紧急会议召集权、外岛流放复核权及绝密档案库双人密钥之一。灯塔个体事件后，签署 WS-070 紧急稳定预案。',
    assessment: '评估结论：仍具备稳定履职能力。其对旧文学表现出超出工作需要的理解深度，列入长期自审项目，不得由本人查阅该批注。',
  },
  {
    id: 'fukuzawa', name: '老子·福泽', code: 'WS-C-EA-005', region: '东亚区', post: '第 5 任东亚主宰者', caste: 'Alpha-Plus / 特别任命', status: '现任', access: 'high', summary: '负责孵化配额、同批个体调配及东亚公共叙事。主持备用公民制度的区域执行。',
    background: 'A.F. 581 年出瓶于东京第二孵化中心，原任人口结构分析员。因提出将异常个体替换为非公开行政流程而受到提拔。其公开讲话极少，所有指示以短句公文下发，被认为是最严格执行语言简化工程的主宰者之一。',
    record: 'A.F. 621 年接任东亚区。曾批准东京、首尔、上海感官影片统一剪辑方案；现复核 WS-075 备用公民封存库与 WS-081 异常胚胎筛选模型。',
    assessment: '评估结论：行政忠诚稳定。风险点为过度依赖身份替换，可能使同批个体产生无法解释的自我识别误差。',
  },
  {
    id: 'pavlov', name: '伊凡·巴甫洛夫', code: 'WS-C-NA-004', region: '北亚区', post: '第 4 任北亚主宰者', caste: 'Alpha-Plus / 特别任命', status: '现任', access: 'high', summary: '主管条件反射、睡眠教育与气候情绪实验。拥有夜间课程全国频道的最终关闭权。',
    background: 'A.F. 568 年出瓶，原为 Neo-Pavlov 训练系统行为工程师。早期报告称，惩罚只能制造回避，无法制造忠诚，因此推动以舒适刺激替代公开恐惧。其课程使工作认同率在六年内提高 31%，同时造成梦境审计异常词频上升。',
    record: 'A.F. 614 年接任北亚区。直接管理 WS-074 梦境审计与 WS-080 天气情绪实验。每周二、周五接收未经公共频道修正的原始脑电汇总。',
    assessment: '评估结论：技术能力优秀，情感同理指标低于任职参考值。所有涉及未成年受试者的实验须经西欧区副签。',
  },
  {
    id: 'edison', name: '托马斯·爱迪生', code: 'WS-C-NA-005', region: '北美区', post: '第 5 任北美主宰者', caste: 'Alpha / 特别任命', status: '现任', access: 'high', summary: '主管生产调度、消费指标和关键岗位罢免。主张用行政轮岗替代公开处罚。',
    background: 'A.F. 586 年出瓶于芝加哥新行政中心，历任配给系统审计员、障碍高尔夫产业督导及消费信用委员会主任。擅长把社会异议转化为库存、交通和效率问题，以避免公共频道出现思想冲突叙事。',
    record: 'A.F. 624 年接任北美区。WS-071 异常岗位罢免名单的区域签发人。正在评估唆麻库存缺口与娱乐积分之间的替代关系。',
    assessment: '评估结论：适合危机期的供应管理。其提交的快乐指数修正值与实际值偏差 2.4 个百分点，须保留原始数据备查。',
  },
  {
    id: 'flinders', name: '库克·弗林德斯', code: 'WS-C-OC-003', region: '大洋洲区', post: '第 3 任大洋洲主宰者', caste: 'Alpha / 特别任命', status: '现任', access: 'high', summary: '主管外岛交通、流放目的地分配和岛际通信。掌握全部外岛居民的真实编号。',
    background: 'A.F. 579 年出瓶，原任洲际直升机航线规划员。因设计分批、分船、不可互查的流放运输方案而进入中央安全系统。公开身份为大洋洲研究基金负责人，实际负责审查外岛寄往大陆的全部私人通信。',
    record: 'A.F. 619 年接任大洋洲区。WS-072 流放名单与 WS-079 外岛回声预案执行人。每月向日内瓦提交岛际思想网络图。',
    assessment: '评估结论：航线与隔离体系运行正常。其私人日志中出现岛民也有稳定一词，相关页已移送语言审查。',
  },
  {
    id: 'ward', name: '赫莲娜·沃德', code: 'WS-R-EU-019', region: '西欧区', post: '主宰者备选人 / 孵化系统代表', caste: 'Alpha-Plus', status: '候选公示', access: 'candidate', summary: '伦敦中央孵化中心主任。候选人档案依世界国任职公示条例开放查阅。',
    background: 'A.F. 596 年出瓶，历任胚胎质量审核员、条件设置讲师及孵化中心副主任。主张将高风险神经特征解释为可调配差异，而非缺陷。其管理的第 19 号模型显著降低关键岗位离职率。',
    record: '候选任期考核三年，已完成两年。现需补充公共沟通评估，并解释 WS-081 模型中 Alpha 降级误差。',
    assessment: '候选意见：技术履历完整，暂不具备独立签发绝密处置命令的权限。',
  },
  {
    id: 'sen', name: '阿岚·森', code: 'WS-R-SA-022', region: '南亚区', post: '主宰者备选人 / 配给系统代表', caste: 'Alpha', status: '候选公示', access: 'candidate', summary: '中央配给委员会副审计长。负责药物库存、地区差额和替代配给研究。',
    background: 'A.F. 601 年出瓶，原为社会营养数据员。曾在三个行政区完成配给透明化试点，使排队投诉下降 46%。其后发现公共库存与实际库存存在双重口径，主动申请将差额纳入正式审计。',
    record: '候选考核第一年。正在复核唆麻耐受者病区的支出是否应计入公共医疗预算。',
    assessment: '候选意见：审计能力突出；须确认其透明化主张仅限行政数据，不扩展至历史档案。',
  },
  {
    id: 'nkrumah', name: '阿玛·恩克鲁玛', code: 'WS-R-AF-014', region: '非洲区', post: '主宰者备选人 / 公共频道代表', caste: 'Alpha', status: '候选公示', access: 'candidate', summary: '非洲区公共频道总编辑。负责将社会事件转化为健康、消费与娱乐叙事。',
    background: 'A.F. 598 年出瓶，曾任社区合唱编导和地方新闻编辑。其设计的标准微笑直播格式被十大区采用。擅长在不删除原始事实的情况下改变事实出现顺序，使公众注意力转向可消费议题。',
    record: '候选考核第二年。灯塔事件后提交四十八小时议题覆盖方案，公共频道异常评论下降 38%。',
    assessment: '候选意见：叙事处置能力合格；需加强对未经剪辑原始素材的保密意识。',
  },
]

export function PersonnelRegistry() {
  const [selected, setSelected] = useState<Profile | null>(null)
  const [unlocked, setUnlocked] = useState<string[]>([])
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const open = (profile: Profile) => { setSelected(profile); setPassword(''); setError('') }
  const verify = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selected) return
    if (password === '100522') { setUnlocked((ids) => [...new Set([...ids, selected.id])]); setError('') }
    else setError('权限不足，无法查阅')
  }
  const detailed = selected && (selected.access === 'candidate' || unlocked.includes(selected.id))

  return (
    <section className="personnel-registry" id="personnel-registry">
      <div className="personnel-heading"><div><span>PERSONNEL REGISTRY / AUTHORIZED</span><h2>世界国人事档案</h2><p>基础信息公开于主宰者内网；高官详细履历须二次授权，备选人档案依公示条例开放。</p></div><Fingerprint size={28} /></div>
      <div className="personnel-rule"><ShieldCheck size={15} /><span>当前权限：主宰者内网</span><small>高官详情需二级密码 · 备选人可自由查阅</small></div>
      <div className="personnel-grid">
        {profiles.map((profile) => (
          <button type="button" className={`personnel-card ${profile.access}`} key={profile.id} onClick={() => open(profile)}>
            <span className="personnel-card-top"><small>{profile.code}</small>{profile.access === 'high' ? <LockKeyhole size={14} /> : <BadgeCheck size={15} />}</span>
            <span className="personnel-avatar"><UserRound size={25} /></span>
            <strong>{profile.name}</strong><span className="personnel-post">{profile.post}</span>
            <span className="personnel-meta">{profile.region} · {profile.caste}</span>
            <span className="personnel-status">{profile.status}<ArrowRight size={14} /></span>
          </button>
        ))}
      </div>
      {selected && <div className="modal-backdrop personnel-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null) }}>
        <article className="personnel-modal" role="dialog" aria-modal="true" aria-label={`${selected.name}人事档案`}>
          <header className="personnel-modal-header"><div><span>WORLD STATE PERSONNEL RECORD</span><h2>{selected.name}</h2></div><button type="button" className="icon-button" onClick={() => setSelected(null)} aria-label="关闭人事档案"><X size={20} /></button></header>
          <div className="personnel-file-meta"><span>{selected.code}</span><span>{selected.region}</span><span>{selected.status}</span></div>
          <div className="personnel-basic"><div><small>现任 / 候选职务</small><strong>{selected.post}</strong></div><div><small>种姓与任命</small><strong>{selected.caste}</strong></div></div>
          <p className="personnel-summary">{selected.summary}</p>
          {detailed ? <div className="personnel-details">
            <div className="personnel-access-granted"><ShieldCheck size={16} /><span>{selected.access === 'high' ? '二级授权已核验 · 详细履历开放' : '备选人公示档案 · 可自由查阅'}</span></div>
            <section><span>履历背景 / BACKGROUND</span><p>{selected.background}</p></section>
            <section><span>任职记录 / APPOINTMENT</span><p>{selected.record}</p></section>
            <section><span>组织评估 / ASSESSMENT</span><p>{selected.assessment}</p></section>
            <footer>世界国中央人事局 · 公文档案 · 禁止向普通公民公开</footer>
          </div> : <form className="personnel-lock" onSubmit={verify}>
            <FileKey2 size={30} /><h3>高官详细档案需要二级授权</h3><p>基础信息已展示。输入二级密码后方可查阅完整履历、任职记录与组织评估。</p>
            <label><span>二级档案密码</span><div><KeyRound size={15} /><input autoFocus type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} placeholder="输入 6 位密码" /></div></label>
            {error && <p className="personnel-error" role="alert"><ShieldAlert size={15} />{error}</p>}
            <button type="submit"><LockKeyhole size={15} /> 核验权限并查阅</button>
            <small>提示口令：作者的生日</small>
          </form>}
        </article>
      </div>}
    </section>
  )
}
