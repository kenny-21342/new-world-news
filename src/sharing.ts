export type SharedImage = {
  src: string
  zoom: number
  x: number
  y: number
  brightness: number
  grayscale: number
}

export type SharedArticle = {
  id: string
  title: string
  category: string
  summary: string
  body: string
  author: string
  date: string
  featured: boolean
  createdAt: number
  image: SharedImage
}

export type SharedSiteData = {
  siteName: string
  englishName: string
  motto: string
  issue: string
  ticker: string
  articles: SharedArticle[]
}

export type ShareRecord = {
  id: string
  data: SharedSiteData
  createdAt: string
  updatedAt: string
}

export const SHARE_ID_KEY = 'brave-new-world-share-id-v1'

export function publicSnapshot(data: SharedSiteData): SharedSiteData {
  return {
    siteName: data.siteName,
    englishName: data.englishName,
    motto: data.motto,
    issue: data.issue,
    ticker: data.ticker,
    articles: data.articles,
  }
}

export function shareIdFromPath(pathname: string) {
  return pathname.match(/^\/s\/([A-Za-z0-9_-]{8,32})\/?$/)?.[1] || null
}

export function makeShareUrl(id: string) {
  return `${window.location.origin}/s/${id}`
}
