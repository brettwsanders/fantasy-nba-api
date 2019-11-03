'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/example', async function (request, reply) {
    // make the request to api to get schedule data
    return 'test ing this is just one an example'
  })
}
