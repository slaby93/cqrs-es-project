require('babel-register');

const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

router.post("/group/:groupid/:userid", (ctx, next) => {
  const [ groupid, userid ] = ctx.captures
  ctx.body = JSON.stringify({
    respone: `Added user ${userid} to group ${groupid}`
  })
  next()
})

router.delete("/group/:groupid/:userid", (ctx, next) => {
  const [ groupid, userid ] = ctx.captures
  ctx.body = JSON.stringify({
    respone: `Removed user ${userid} from group ${groupid}`
  })
  next()
})

app
  .use(router.routes())
  .listen(9001);