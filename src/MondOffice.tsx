import { useState } from 'react'
import { ArrowRight, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronDown, Clock3, FileCheck2, Fingerprint, MapPinned, ShieldCheck, X } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import './MondOffice.css'

const skinTones = ['#d7ae8e', '#b97d5d', '#e2bea1', '#8f5d45', '#c89470']
function PersonnelPortrait({ name, index = 0, large = false }: { name: string; index?: number; large?: boolean }) {
  const skin = skinTones[index % skinTones.length]
  const hair = ['#2b2927', '#554437', '#252525'][index % 3]
  return <svg className={`personnel-portrait ${large ? 'large' : ''}`} viewBox="0 0 100 116" role="img" aria-label={`${name}档案照`}>
    <rect width="100" height="116" fill={index % 2 ? '#d7d8ce' : '#ded9cc'} /><path d="M0 93L100 75V116H0Z" fill="#c7c9bd" opacity=".55" />
    <path d="M18 116V101Q20 83 43 80H57Q80 83 82 101V116" fill="#263f37" /><path d="M43 78L50 94L57 78" fill="#eee9dc" /><path d="M44 69H56V86H44Z" fill={skin} />
    <ellipse cx="50" cy="49" rx="24" ry="30" fill={skin} /><path d="M26 48Q22 13 51 15Q80 16 75 49L69 31Q46 38 29 29Z" fill={hair} />
    <path d="M37 49h7m12 0h7" stroke="#40352f" strokeWidth="2" /><path d="M46 64Q50 66 54 64" fill="none" stroke="#875f50" strokeWidth="1.5" />
    <path d="M50 94L44 102L50 110L56 102Z" fill="#b99a5e" /><text x="6" y="109" fontSize="6" fill="#66736b">WORLD STATE</text>
  </svg>
}

const impactTrend = [
  { day: '灯塔事件前', happiness: 99.4, solitude: 84 }, { day: '事件当日', happiness: 98.7, solitude: 196 },
  { day: '第 2 日', happiness: 97.9, solitude: 412 }, { day: '第 4 日', happiness: 96.8, solitude: 731 },
  { day: '本日', happiness: 96.2, solitude: 1086 },
]
const reactionData = [{ name: '拒绝唆麻', value: 386 }, { name: '追问约翰', value: 297 }, { name: '自发独处', value: 342 }, { name: '手抄遗言', value: 159 }]

type Official = { code: string; name: string; post: string; division: string; background: string; duty: string; assessment: string }

const officials: Official[] = [
  { code: 'EU-A01', name: '艾琳·沃森', post: '办公室主任', division: '综合行政局', background: 'A.F. 601 年出瓶，历任日内瓦会议记录员、西欧区公文审核官。任职十二年，无信息泄露处分。', duty: '统筹主宰者日程、十区公文流转及紧急会议召集；每日核验办公室印章与双人密钥。', assessment: '可靠。建议在跨区档案调阅时继续保持两名记录员同时在场。' },
  { code: 'EU-A02', name: '朱利安·赫胥黎', post: '历史封存局局长', division: '文明遗产管制署', background: 'A.F. 598 年出瓶，曾任中央博物馆旧文本编目员，精通六种旧世界语言。', duty: '管理禁书分级、残片修复与调阅登记；每月销毁不再具有研究价值的复制本。', assessment: '业务卓越。接触原始文本后须完成标准情绪净化课程。' },
  { code: 'EU-A03', name: '克拉拉·泽恩', post: '公共叙事总监', division: '中央新闻总署', background: 'A.F. 603 年出瓶，原任伦敦公共频道副总编辑，主持过三轮议题覆盖行动。', duty: '审核头条、快讯与公共口径；将异常事件转写为健康、生产或消费新闻。', assessment: '处置迅速。不得保存未经剪辑的原始影像于私人终端。' },
  { code: 'EU-A04', name: '奥托·克莱因', post: '孵化配额委员', division: '人口与条件设置局', background: 'A.F. 594 年出瓶，历任胚胎质量审查员、伦敦中央孵化中心副主任。', duty: '平衡各区种姓配额，复核异常胚胎标记及关键岗位候补批次。', assessment: '数据可信。对 Alpha 降级误差的解释仍待补充。' },
  { code: 'EU-A05', name: '索尼娅·拉维尔', post: '唆麻配给总监', division: '中央药物委员会', background: 'A.F. 599 年出瓶，原为社会药理配给审计员，建立西欧区统一库存口径。', duty: '监控领取周期、地区库存与耐受性报告；签发紧急跨区调拨。', assessment: '合格。原始库存与公开库存须继续分册保管。' },
  { code: 'EU-A06', name: '马库斯·里德', post: '异常行为监察长', division: '社会稳定监察局', background: 'A.F. 591 年出瓶，原任社区行为观察员，建立独处与拒药联合预警模型。', duty: '汇总拒绝唆麻、自发独处、旧词追问等登记，提交每日风险分级。', assessment: '预警准确。不得将未经核验的家庭关系推定写入公文。' },
  { code: 'EU-A07', name: '安娜·柯蒂斯', post: '外岛复核专员', division: '隔离与流放事务署', background: 'A.F. 605 年出瓶，历任外岛申请审核员、航线隔离协调官。', duty: '复核流放目的地、同行隔离与外岛通信；维护居民真实编号索引。', assessment: '程序严谨。对申请动机的文学化描述应予以删节。' },
  { code: 'EU-A08', name: '亨利·福斯特', post: '条件设置督察', division: '睡眠教育总局', background: 'A.F. 597 年出瓶，曾任 Neo-Pavlov 课程设计师与夜间频道督导。', duty: '检查各龄段课程播放、词频偏差和梦境回执；批准临时课程替换。', assessment: '执行稳定。梦境审计原始脑电不得进入公共医疗记录。' },
  { code: 'EU-A09', name: '露西·阿什福德', post: '消费指标委员', division: '生产与消费协调局', background: 'A.F. 602 年出瓶，原任障碍高尔夫产业分析师与消费信用审计官。', duty: '维持商品更新频率，评估娱乐积分对配给缺口的替代效果。', assessment: '模型有效。修正值必须同时附原始值与计算依据。' },
  { code: 'EU-A10', name: '维克多·斯隆', post: '设施安全总监', division: '中央设施保卫局', background: 'A.F. 588 年出瓶，历任关键电网保卫官与日内瓦紧急设施副主任。', duty: '维护档案库、预案设施和秘密通道；每旬组织无预告封闭演练。', assessment: '可信。保卫记录中的无编号房间继续禁止进入普通索引。' },
  { code: 'EU-A11', name: '米娅·卡尔德', post: '语言简化委员会主任', division: '标准语言局', background: 'A.F. 604 年出瓶，原任公共词典审订员，主持删除二百一十四个高风险旧词。', duty: '修订公共词表，监测旧词复现，并将复杂申诉转写为标准行政语句。', assessment: '成效显著。对旧诗节奏的内部引用应减少。' },
  { code: 'EU-A12', name: '诺亚·本森', post: '交通调度总长', division: '洲际直升机管理署', background: 'A.F. 596 年出瓶，曾任洲际航线规划员与紧急运输协调官。', duty: '管理公务航线、隔离运输与身份不可互查的分批运送方案。', assessment: '调度可靠。所有外岛航次须保留双重编号。' },
  { code: 'EU-A13', name: '伊莎贝尔·莫罗', post: '感官产业审查长', division: '情绪产品管理局', background: 'A.F. 600 年出瓶，原任感官影片情绪曲线设计师，后转入内容审查。', duty: '审核影片、合成音乐与气味产品，清除引发持久悲伤或独处的段落。', assessment: '敏锐。悲剧样本只可在密闭审查室播放。' },
  { code: 'EU-A14', name: '加布里埃尔·奥登', post: '原始数据审计官', division: '中央统计核验局', background: 'A.F. 592 年出瓶，历任区域统计员、快乐指数独立复核官。', duty: '保管未经公共修正的指标，核验异常增长与各区上报差额。', assessment: '独立性强。不得向叙事部门提前透露完整原始表。' },
  { code: 'EU-A15', name: '赛勒斯·格兰特', post: '罢免复核委员', division: '职务纪律委员会', background: 'A.F. 589 年出瓶，原任关键岗位轮岗审核官与纪律档案管理员。', duty: '复核异常岗位罢免、静默调职及权限回收；维护不可申诉案件清单。', assessment: '决断稳定。免职原因不得在公共频道出现思想性描述。' },
  { code: 'EU-A16', name: '阿黛尔·桑托斯', post: '跨区联络主任', division: '十区协调秘书处', background: 'A.F. 606 年出瓶，曾任东亚区联络官与十区会议翻译审订员。', duty: '协调十大主宰者办公室，核验跨区命令版本与副签状态。', assessment: '沟通高效。未经副签的区域命令不得进入执行队列。' },
  { code: 'EU-A17', name: '埃利亚斯·芬奇', post: '档案清洁监督官', division: '记录销毁与残片室', background: 'A.F. 593 年出瓶，历任档案清洁科核验员、残片索引管理员。', duty: '监督删除命令、双人核验和残片封存；追查缺失卷宗的最后经手人。', assessment: '纪律良好。任何私人保留残片行为均须立即上报。' },
  { code: 'EU-A18', name: '莉娜·奥科耶', post: '公共健康专员', division: '社会健康与适应局', background: 'A.F. 607 年出瓶，原任社区适应医师与配给反应观察员。', duty: '监测公共病区、药物耐受与集会后适应课程；提交病区转移建议。', assessment: '专业合格。病历不得使用孤独作为公共诊断。' },
  { code: 'EU-A19', name: '罗兰·杜邦', post: '会议机要秘书', division: '主宰者机要室', background: 'A.F. 608 年出瓶，经三轮机要忠诚测验后进入办公室，无外部通信权限。', duty: '记录闭门会议、封存附件与决议副本；会议结束后立即回收全部临时纸张。', assessment: '适合现职。只记录批准版本，争议原话另卷保存。' },
  { code: 'EU-A20', name: '薇拉·科瓦奇', post: '继任评估官', division: '中央人事局西欧分局', background: 'A.F. 595 年出瓶，历任任职心理评估员、备选人考核委员会副主任。', duty: '维护备选人考察、忠诚复训和继任顺序；每季度向蒙德提交风险名单。', assessment: '评估完整。不得向备选人透露最终排序与绝密权限要求。' },
]

const meetings = [
  ['08:30', '十区原始数据核验', '日内瓦 · 第一机要室', '已核验'],
  ['11:00', '外岛通信网络复核', '西欧区 · 隔离事务署', '待副签'],
  ['14:40', '异常艺术样本闭门审查', '中央档案库 · B7', '限六人'],
  ['19:20', 'WS-070 预案值席会议', '紧急频道 · 加密', '双人密钥'],
]

export function MondOffice() {
  const [selected, setSelected] = useState<Official | null>(null)
  const [expanded, setExpanded] = useState(false)
  return <section className="mond-office" id="mond-office">
    <div className="office-banner"><div><span><Fingerprint size={14} /> WESTERN EUROPEAN CONTROLLER</span><h2>穆斯塔法·蒙德</h2><p>当前签发人：穆斯塔法·蒙德 · 第 7 任西欧主宰者 · 本日公文由内网自动呈送</p></div><div className="office-seal"><ShieldCheck size={27} /><small>身份与权限</small><strong>最高行政级</strong></div></div>
    <div className="office-personal"><div className="office-portrait"><PersonnelPortrait name="穆斯塔法·蒙德" large /><span>WS-C-EU-007</span></div><div><small>完整身份记录</small><h3>穆斯塔法·蒙德</h3><p>Alpha-Plus / 特别任命 · A.F. 574 出瓶 · 伦敦中央孵化体系</p></div><dl><div><dt>现任职务</dt><dd>西欧主宰者</dd></div><div><dt>任职起始</dt><dd>A.F. 617</dd></div><div><dt>特别授权</dt><dd>历史调阅 / 外岛复核</dd></div><div><dt>密钥状态</dt><dd>双人密钥有效</dd></div></dl></div>
    <div className="office-dashboard">
      <article className="office-metrics"><header><BriefcaseBusiness size={18} /><h3>辖区行政指标</h3></header><div><span><small>公共快乐指数</small><strong>96.2%</strong><em>约翰死后 -3.2</em></span><span><small>独处行为登记</small><strong>1,086</strong><em>事件后激增</em></span><span><small>待复核异常</small><strong>1,284</strong><em>含追问灯塔事件</em></span><span><small>待签公文</small><strong>17</strong><em>加急 4 件</em></span></div></article>
      <article className="office-territory"><header><MapPinned size={18} /><h3>控制区域与直属设施</h3></header><p>不列颠群岛、法兰西、伊比利亚、意大利及中欧行政带；直辖伦敦中央孵化中心、日内瓦紧急会议设施、西欧绝密档案库。</p><span>跨区职责：历史文本总审查 · 外岛流放终核 · 全球稳定预案召集</span></article>
    </div>
    <div className="office-columns"><article className="office-tasks"><header><FileCheck2 size={18} /><h3>当前任务</h3></header><ul><li><CheckCircle2 size={15} /><div><strong>核验灯塔个体事件后的跨区叙事</strong><p>要求各区保留原始评论，不以删除代替归档。</p></div></li><li><Clock3 size={15} /><div><strong>完成 WS-070 预案第二轮副签</strong><p>尚待北亚、大洋洲办公室确认。</p></div></li><li><Clock3 size={15} /><div><strong>复核外岛候选人画像误差</strong><p>重点检查主动申请者是否被误列为惩罚性流放。</p></div></li></ul></article><article className="office-meetings"><header><CalendarDays size={18} /><h3>会议安排</h3></header>{meetings.map(([time,title,place,status]) => <div className="meeting-row" key={time}><time>{time}</time><span><strong>{title}</strong><small>{place}</small></span><em>{status}</em></div>)}</article></div>
    <div className="office-impact-charts"><article><header><BriefcaseBusiness size={17} /><h3>约翰死后：快乐指数与独处行为</h3></header><div className="office-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={impactTrend} margin={{top:12,right:8,left:-20,bottom:0}}><CartesianGrid stroke="#ddd8cb" strokeDasharray="3 4" vertical={false}/><XAxis dataKey="day" tick={{fontSize:9,fill:'#77776e'}}/><YAxis yAxisId="happy" domain={[95,100]} tick={{fontSize:9}}/><YAxis yAxisId="solitude" orientation="right" tick={{fontSize:9}}/><Tooltip/><Area yAxisId="happy" dataKey="happiness" name="快乐指数（%）" stroke="#315f50" fill="#315f5020" strokeWidth={2}/><Area yAxisId="solitude" dataKey="solitude" name="独处行为（例）" stroke="#984f43" fill="#984f4310" strokeWidth={2}/></AreaChart></ResponsiveContainer></div><p>灯塔事件与约翰死亡未被公开报道，但其遗言片段已在私下传抄，独处和拒药行为同步增加。</p></article><article><header><FileCheck2 size={17} /><h3>事件后异常反应构成</h3></header><div className="office-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={reactionData} margin={{top:12,right:8,left:-20,bottom:0}}><CartesianGrid stroke="#ddd8cb" strokeDasharray="3 4" vertical={false}/><XAxis dataKey="name" tick={{fontSize:9,fill:'#77776e'}}/><YAxis tick={{fontSize:9}}/><Tooltip/><Bar dataKey="value" name="登记数量" fill="#8f5145"/></BarChart></ResponsiveContainer></div><p>异常反应尚无统一组织迹象；言论传播主要围绕“痛苦是否有意义”与“人是否可以独处”。</p></article></div>
    <div className="officials-heading"><div><span>DIRECTORATE PERSONNEL / OPEN RECORDS</span><h2>直属高官档案</h2><p>二十名直属官员履历依内部公示条例开放，可自由查阅完整背景、当前任务与组织评估。</p></div><button type="button" onClick={() => setExpanded(!expanded)}>{expanded ? '收起名册' : '展开全部名册'}<ChevronDown className={expanded ? 'rotated' : ''} size={16} /></button></div>
    <div className={`officials-grid ${expanded ? 'expanded' : ''}`}>{(expanded ? officials : officials.slice(0, 8)).map((official, index) => <button type="button" className="official-card" key={official.code} onClick={() => setSelected(official)}><PersonnelPortrait name={official.name} index={index}/><span><small>{official.code}</small><ArrowRight size={14} /></span><strong>{official.name}</strong><p>{official.post}</p><em>{official.division}</em></button>)}</div>
    {selected && <div className="modal-backdrop official-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null) }}><article className="official-modal" role="dialog" aria-modal="true"><header><div className="official-modal-person"><PersonnelPortrait name={selected.name} index={officials.indexOf(selected)} large/><div><span>WORLD STATE DIRECTORATE PERSONNEL</span><h2>{selected.name}</h2></div></div><button className="icon-button" type="button" onClick={() => setSelected(null)} aria-label="关闭官员档案"><X size={20} /></button></header><div className="official-file-meta"><span>{selected.code}</span><span>{selected.division}</span><span>内部公示</span></div><h3>{selected.post}</h3><section><span>履历背景 / BACKGROUND</span><p>{selected.background}</p></section><section><span>当前任务 / CURRENT DUTY</span><p>{selected.duty}</p></section><section><span>组织评估 / ASSESSMENT</span><p>{selected.assessment}</p></section><footer>西欧主宰者办公室 · 直属人事公文 · 完整记录</footer></article></div>}
  </section>
}
