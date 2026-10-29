import { createApiHandler } from '../server/api.mjs'

const handle = createApiHandler()

export default function handler(request, response) {
  return handle(request, response, () => {
    response.statusCode = 404
    response.end('Not found')
  })
}
