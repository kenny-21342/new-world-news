import { randomBytes } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { get, put } from '@vercel/blob'

const MAX_BODY_BYTES = 25 * 1024 * 1024
const SHARE_ID_PATTERN = /^[A-Za-z0-9_-]{8,32}$/
const editorPassword = process.env.EDITOR_PASSWORD || 'EDITOR-2540'
const dataFile = process.env.SHARE_DATA_FILE || path.resolve(process.cwd(), 'data', 'shares.json')

let mutationQueue = Promise.resolve()

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload)
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Content-Length', Buffer.byteLength(body))
  response.end(body)
}

function cleanString(value, maxLength = 10000) {
  return typeof value === 'string' ? value.slice(0, maxLength) : ''
}

function cleanNumber(value, fallback, min, max) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}

function publicSnapshot(input) {
  if (!input || typeof input !== 'object' || !Array.isArray(input.articles)) {
    throw Object.assign(new Error('公开新闻数据格式不正确'), { statusCode: 400 })
  }
  return {
    siteName: cleanString(input.siteName, 80),
    englishName: cleanString(input.englishName, 120),
    motto: cleanString(input.motto, 160),
    issue: cleanString(input.issue, 40),
    ticker: cleanString(input.ticker, 500),
    articles: input.articles.slice(0, 500).map((article) => ({
      id: cleanString(article?.id, 100),
      title: cleanString(article?.title, 100),
      category: cleanString(article?.category, 30),
      summary: cleanString(article?.summary, 500),
      body: cleanString(article?.body, 100000),
      author: cleanString(article?.author, 100),
      date: cleanString(article?.date, 20),
      featured: Boolean(article?.featured),
      createdAt: cleanNumber(article?.createdAt, Date.now(), 0, Number.MAX_SAFE_INTEGER),
      image: {
        src: cleanString(article?.image?.src, 20 * 1024 * 1024),
        zoom: cleanNumber(article?.image?.zoom, 1, 1, 3),
        x: cleanNumber(article?.image?.x, 0, -50, 50),
        y: cleanNumber(article?.image?.y, 0, -50, 50),
        brightness: cleanNumber(article?.image?.brightness, 100, 40, 160),
        grayscale: cleanNumber(article?.image?.grayscale, 0, 0, 100),
      },
    })),
  }
}

async function readBody(request) {
  if (request.body !== undefined) {
    if (request.body && typeof request.body === 'object' && !Buffer.isBuffer(request.body)) return request.body
    try {
      return JSON.parse(String(request.body) || '{}')
    } catch {
      throw Object.assign(new Error('请求内容不是有效 JSON'), { statusCode: 400 })
    }
  }
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) {
      throw Object.assign(new Error('发布内容超过 25 MB，请压缩新闻图片'), { statusCode: 413 })
    }
    chunks.push(chunk)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
  } catch {
    throw Object.assign(new Error('请求内容不是有效 JSON'), { statusCode: 400 })
  }
}

async function readStore() {
  try {
    const raw = await readFile(dataFile, 'utf8')
    const store = JSON.parse(raw)
    return store && typeof store === 'object' && !Array.isArray(store) ? store : {}
  } catch (error) {
    if (error?.code === 'ENOENT') return {}
    throw error
  }
}

async function writeStore(store) {
  await mkdir(path.dirname(dataFile), { recursive: true })
  const temporary = `${dataFile}.${process.pid}.${Date.now()}.tmp`
  await writeFile(temporary, JSON.stringify(store, null, 2), 'utf8')
  await rename(temporary, dataFile)
}

function mutateStore(mutator) {
  const operation = mutationQueue.then(async () => {
    const store = await readStore()
    const result = await mutator(store)
    await writeStore(store)
    return result
  })
  mutationQueue = operation.then(() => undefined, () => undefined)
  return operation
}

async function readShare(id) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return (await readStore())[id]
  const result = await get(`shares/${id}.json`, { access: 'private', useCache: false })
  if (!result) return undefined
  return JSON.parse(await new Response(result.stream).text())
}

async function saveShare(id, snapshot) {
  const now = new Date().toISOString()
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const previous = id ? await readShare(id) : undefined
    if (id && !previous) {
      throw Object.assign(new Error('分享页面不存在，请重新生成链接'), { statusCode: 404 })
    }
    const share = { id: id || randomBytes(9).toString('base64url'), data: snapshot, createdAt: previous?.createdAt || now, updatedAt: now }
    await put(`shares/${share.id}.json`, JSON.stringify(share), {
      access: 'private', addRandomSuffix: false, allowOverwrite: Boolean(id), contentType: 'application/json',
    })
    return share
  }
  if (process.env.VERCEL) {
    throw Object.assign(new Error('云端存储尚未配置'), { statusCode: 503 })
  }
  return mutateStore((store) => {
    if (id && !store[id]) {
      throw Object.assign(new Error('分享页面不存在，请重新生成链接'), { statusCode: 404 })
    }
    let newId = id
    if (!newId) {
      do { newId = randomBytes(9).toString('base64url') } while (store[newId])
    }
    store[newId] = { id: newId, data: snapshot, createdAt: store[newId]?.createdAt || now, updatedAt: now }
    return store[newId]
  })
}

function authorized(request) {
  return request.headers['x-editor-password'] === editorPassword
}

export function createApiHandler() {
  return async function apiHandler(request, response, next) {
    const url = new URL(request.url || '/', 'http://localhost')
    if (!url.pathname.startsWith('/api/')) {
      next()
      return
    }

    try {
      if (request.method === 'GET' && url.pathname === '/api/health') {
        sendJson(response, 200, { ok: true, storage: process.env.BLOB_READ_WRITE_TOKEN ? 'vercel-blob' : 'server-file' })
        return
      }

      const match = url.pathname.match(/^\/api\/shares(?:\/([A-Za-z0-9_-]+))?\/?$/)
      if (!match) {
        sendJson(response, 404, { error: '接口不存在' })
        return
      }

      const id = match[1]
      if (request.method === 'GET' && id) {
        if (!SHARE_ID_PATTERN.test(id)) {
          sendJson(response, 400, { error: '分享编号格式不正确' })
          return
        }
        const share = await readShare(id)
        if (!share) {
          sendJson(response, 404, { error: '分享页面不存在或已被移除' })
          return
        }
        sendJson(response, 200, share)
        return
      }

      if ((request.method === 'POST' && !id) || (request.method === 'PUT' && id)) {
        if (!authorized(request)) {
          sendJson(response, 401, { error: '编辑者身份验证失败' })
          return
        }
        const body = await readBody(request)
        const snapshot = publicSnapshot(body.data)
        if (id && !SHARE_ID_PATTERN.test(id)) {
          sendJson(response, 400, { error: '分享编号格式不正确' })
          return
        }
        const share = await saveShare(id, snapshot)
        sendJson(response, request.method === 'POST' ? 201 : 200, share)
        return
      }

      response.setHeader('Allow', id ? 'GET, PUT' : 'POST')
      sendJson(response, 405, { error: '不支持的请求方式' })
    } catch (error) {
      sendJson(response, Number(error?.statusCode) || 500, { error: error?.message || '云端保存失败，请稍后重试' })
    }
  }
}
