require('babel-register');

const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger')
const cors = require('@koa/cors');
const { Kafka } = require('kafkajs')

const MEMBERSHIP_TOPIC_NAME = 'membership_topic'
const COMMANDS = {
  ADD_TO_GROUP: 'ADD_TO_GROUP',
  REMOVE_FROM_GROUP: 'REMOVE_FROM_GROUP',
}

const handleRoute = (command, kafkaProducer) => (async (ctx, next) => {
  const [ groupid, userid ] = ctx.captures
  try {
    const kafkaResponse = await kafkaProducer.send({
      topic: MEMBERSHIP_TOPIC_NAME,
      messages: [
        {
          value: JSON.stringify({
            command: command,
            userId: userid,
            groupId: groupid,
          })
        }
      ],
      compression: 1
    })
    ctx.body = JSON.stringify({
      msg: `Added user ${userid} to group ${groupid}`,
      kafkaResponse,
    })
    ctx.res.statusCode = 200
  } catch(error) {
    ctx.body = JSON.stringify({
      error,
    })
    ctx.res.statusCode = 500
  } finally {
    next()
  }
})

const createRoutes = (router, kafkaProducer) => {
  router.post("/group/:groupid/:userid",  handleRoute(COMMANDS.ADD_TO_GROUP, kafkaProducer))
  
  router.delete("/group/:groupid/:userid", handleRoute(COMMANDS.REMOVE_FROM_GROUP, kafkaProducer))
}

const setup = async () => {
  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [
      "kafka:9093"
    ],
    acks: 1,
    timeout: 1000,
  })
  const kafkaProducer = kafka.producer()
  console.log('Connecting')
  await kafkaProducer.connect()
  console.log({ kafkaProducer })

  const app = new Koa();
  const router = new Router();
  createRoutes(router, kafkaProducer)
  app
    .use(cors())
    .use(logger())
    .use(router.routes())
    .listen(9001);
}

setup()
