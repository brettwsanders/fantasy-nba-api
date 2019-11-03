'use strict'

// module.exports = function (fastify, opts, next) {
//   fastify.get('/example', function (request, reply) {
//     reply.send('this is an example')
//   })

//   next()
// }

// If you prefer async/await, use the following

module.exports = async function (fastify, opts) {
  fastify.get('/example', async function (request, reply) {
    // make the request to api to get schedule data
    return 'this is just one an example'
  })
}
