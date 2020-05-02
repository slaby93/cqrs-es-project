const createRoutes = (router, kafkaProducer) => {
  router.get("/a", async (ctx, next) => {
    ctx.body = JSON.stringify({ "A": 1})
    next()
  })
}

module.exports = {
  createRoutes
}