import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApiHandler } from './server/api.mjs'

const root = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(root, 'dist')
const apiHandler = createApiHandler()
const args = process.argv.slice(2)
const portFlag = args.indexOf('--port')
const port = Number(portFlag >= 0 ? args[portFlag + 1] : process.env.PORT || 3000)
const host = process.env.HOST || '0.0.0.0'
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

async function serveStatic(request, response) {
  const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname)
  let filePath = path.resolve(dist, `.${pathname}`)
  if (!filePath.startsWith(`${dist}${path.sep}`) && filePath !== dist) {
    response.statusCode = 403
    response.end('Forbidden')
    return
  }

  try {
    const info = await stat(filePath)
    if (info.isDirectory()) filePath = path.join(filePath, 'index.html')
    else if (!info.isFile()) throw Object.assign(new Error('Not found'), { code: 'ENOENT' })
  } catch {
    filePath = path.join(dist, 'index.html')
  }

  try {
    const info = await stat(filePath)
    response.statusCode = 200
    response.setHeader('Content-Type', mimeTypes[path.extname(filePath)] || 'application/octet-stream')
    response.setHeader('Content-Length', info.size)
    if (request.method === 'HEAD') {
      response.end()
      return
    }
    createReadStream(filePath).pipe(response)
  } catch {
    response.statusCode = 503
    response.setHeader('Content-Type', 'text/plain; charset=utf-8')
    response.end('网站尚未构建，请先运行 npm run build')
  }
}

createServer((request, response) => {
  void apiHandler(request, response, () => {
    void serveStatic(request, response).catch(() => {
      response.statusCode = 500
      response.end('Server error')
    })
  })
}).listen(port, host, () => {
  console.log(`新世界新闻共享服务器：http://localhost:${port}`)
})
