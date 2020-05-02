const { promisify } = require("util");

const createRoutes = (router, redisClient) => {
  router.get("/user/:userId/friends/", async (ctx, next) => {
    const [userId] = ctx.captures
    const members = await promisify(redisClient.SMEMBERS).bind(redisClient)(userId)
    ctx.body = JSON.stringify({ "friends": members })
    next()
  })
}

module.exports = {
  createRoutes
}