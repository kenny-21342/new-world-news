import { ArrowUpRight, Check, PackageCheck, ShoppingBag, Sparkles } from 'lucide-react'
import './CitizenAds.css'

const ads = [
  { id: 'soma', image: '/ads/soma.jpg', kicker: '中央唆麻局 · 快乐焕新季', title: '烦恼不必理解，\n快乐可以领取。', copy: '标准唆麻配给，同批同价。把疑问留在昨天，把微笑带进今天。', note: 'SOMA® / ALL CASTES WELCOME', cta: '领取标准快乐', className: 'ad-soma' },
  { id: 'nuts', image: '/ads/almonds.jpg', kicker: 'MAGNESIUM ALMONDS CLUB', title: '镁盐杏仁，\n把年轻嚼出声。', copy: '中央认证的标准化酥脆。观影、旅行与集体娱乐期间的理想补给。', note: '灯塔同款杏仁 · 每份口感一致', cta: '加入消费车', className: 'ad-nuts' },
  { id: 'sleep', image: '/ads/pillow.jpg', kicker: '中央睡眠教育频道', title: '八小时醒来，\n更爱自己的工作。', copy: '眠教枕按种姓自动匹配课程。无需记忆，无需理解，好教育发生在不必思考的时候。', note: '夜间课程 40 门 · 无法自行关闭', cta: '查看夜间课程', className: 'ad-sleep' },
  { id: 'wardrobe', image: '/ads/wardrobe.jpg', kicker: 'WORLD STATE WARDROBE', title: '旧的不去，\n新的不来。', copy: '换季不换阶级，穿搭服从分工。每种颜色都是归属，也是骄傲。', note: '旧衣回收 · 只换不修 · 屋顶直达', cta: '更新标准衣橱', className: 'ad-wardrobe' },
  { id: 'watch', image: '/ads/watch.jpg', kicker: 'FORD STANDARD TIME', title: '每一秒归属集体，\n每一刻准时快乐。', copy: '福特纪元标准腕表，自动同步上下班、娱乐与唆麻领取时间。', note: '十区统一校时 · 终身无需思考迟到', cta: '选配标准时间', className: 'ad-watch' },
  { id: 'shoes', image: '/ads/shoes.jpg', kicker: 'CENTRAL RECREATION STORE', title: '为集体运动而生，\n为消费积分而走。', copy: '新款障碍高尔夫训练鞋，轻盈、统一、每一步都计入健康积分。', note: '本周双倍积分 · 同批尺码齐备', cta: '领取运动装备', className: 'ad-shoes' },
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
