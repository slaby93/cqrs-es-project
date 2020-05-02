require('babel-register');
const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger')
const cors = require('@koa/cors');
const { Kafka } = require('kafkajs')

const { SIGNALS, KAFKA_GROUP_ID } = require('./constants')
const { createRoutes } = require('./routes')
const { handleKafkaConsumerEvents } = require('./kafkaConsumerHanlders')

const createConnections = async () => {
  const kafka = new Kafka({
    brokers: [
      "kafka:9093"
    ],
    acks: 1,
    timeout: 1000,
  })
  const kafkaConsumer = kafka.consumer({
    groupId: `${KAFKA_GROUP_ID}-${(Math.random() % 100).toFixed(0)}`
  })
  await kafkaConsumer.connect()
  return { kafkaConsumer }
}
const cleanup = cb => {
  SIGNALS.forEach(signal => {
    process.on(signal, () => {
      try {
        cb && cb()
      } finally {
        process.exit()
      }
    })
  })
}

const main = async () => {
  const {
    kafkaConsumer
  } = await createConnections()
  cleanup(() => {
      kafkaConsumer && kafkaConsumer.stop()
  })
  handleKafkaConsumerEvents(kafkaConsumer)
  const app = new Koa();
  const router = new Router();
  createRoutes(router)
  app
    .use(cors())
    .use(logger())
    .use(router.routes())
    .listen(9002);
}

main()
