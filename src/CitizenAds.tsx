import { ArrowUpRight, Check, PackageCheck, ShoppingBag, Sparkles } from 'lucide-react'
import './CitizenAds.css'

const ads = [
  { id: 'nuts', image: '/ads/shop/nuts-real-v1.webp', kicker: '世界国合成食品总厂', title: '镁盐杏仁，\n把年轻嚼出声。', copy: '灯塔同款脆烤装，观影、旅行与集体娱乐期间的理想补给。', note: '中央认证 · 每份口感一致', cta: '选购镁盐杏仁', className: 'ad-nuts' },
  { id: 'sleep', image: '/ads/shop/hypno-pillow-real-v1.webp', kicker: '中央条件设置中心', title: '八小时醒来，\n更爱自己的工作。', copy: '眠教枕按种姓自动匹配课程，让安心教育发生在不必思考的时候。', note: '62,400 次安心版 · 夜间自动播放', cta: '查看眠教枕', className: 'ad-sleep' },
  { id: 'shirt', image: '/ads/shop/silk-shirt-real-v1.webp', kicker: '本分制衣局官方店', title: '人造丝衬衫，\n穿出标准身份。', copy: '贝塔桑葚色人造丝衬衫，剪裁统一，触感柔顺，每次穿着都恰如其分。', note: '种姓标准色 · 只换不修', cta: '更新标准衣橱', className: 'ad-wardrobe' },
  { id: 'golf', image: '/ads/shop/golf-real-v1.webp', kicker: '世界国休闲交通局', title: '电磁高尔夫，\n让集体运动更精确。', copy: '标准球具套装已配齐，休闲、竞技与消费积分一次完成。', note: '全套屋顶配送 · 双倍健康积分', cta: '选配标准球具', className: 'ad-watch' },
  { id: 'scent', image: '/ads/shop/scent-organ-real-v1.webp', kicker: '伦敦感官生活馆', title: '馨香乐器，\n演奏香草随想曲。', copy: '不需要理解音乐，只需要让香气准确抵达情绪。家庭感官晚会标准设备。', note: '十二种香阶 · 官方调音', cta: '体验馨香套装', className: 'ad-shoes' },
  { id: 'sofa', image: '/ads/shop/air-sofa-real-v1.webp', kicker: '文明日用配给社', title: '气垫沙发，\n把舒适留给两个人。', copy: '双人标准款，适合共同观影和经过批准的社交，不建议独自使用。', note: '双人标准 · 社交舒适认证', cta: '配置气垫沙发', className: 'ad-sofa' },
  { id: 'mug', image: '/ads/shop/bottle-mug-real-v1.webp', kicker: '文明日用配给社', title: '孵化瓶随行杯，\n每天都是出瓶纪念。', copy: '632 mL 标准容量，以熟悉的曲线陪伴每一次公共出行。', note: 'A.F. 632 纪念款 · 同批同价', cta: '领取随行杯', className: 'ad-mug' },
  { id: 'cookie', image: '/ads/shop/sugar-cookie-real-v1.webp', kicker: '世界国合成食品总厂', title: '标准甜度小饼干，\n同批分享更快乐。', copy: '统一甜度、统一形状、统一快乐。九十六枚分享桶，不让任何人落单。', note: '96 枚同批装 · 集体活动优选', cta: '订购分享桶', className: 'ad-cookie' },
]

export function CitizenAd({ slot }: { slot: number }) {
  const ad = ads[slot]
  if (!ad) return null
  return (
    <aside className={`citizen-ad ${ad.className}`} aria-label={`T宝广告：${ad.kicker}`}>
      <div className="ad-topline"><span><ShoppingBag size={13} /> T宝 · 世界国中央消费平台</span><small>广告</small></div>
      <div className="ad-body">
        <div className="ad-copy"><span className="ad-kicker">{ad.kicker}</span><h3>{ad.title}</h3><p>{ad.copy}</p><small>{ad.note}</small></div>
        <div className="ad-product"><img src={ad.image} alt={`${ad.kicker}商品图`} /><span>中央优选 · 标准配送</span></div>
      </div>
      <div className="ad-footer"><span><Check size={13} /> 中央认证</span><span><PackageCheck size={13} /> 屋顶直达</span><a href="https://shop.wh1spered.com/" target="_blank" rel="noreferrer">{ad.cta} <ArrowUpRight size={14} /></a></div>
      <Sparkles className="ad-sparkle" size={20} aria-hidden="true" />
    </aside>
  )
}
