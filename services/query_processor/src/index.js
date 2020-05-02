require('babel-register');
const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger')
const cors = require('@koa/cors');
const redis = require("redis");
const { Kafka } = require('kafkajs')

const { SIGNALS, KAFKA_GROUP_ID } = require('./constants')
const { createRoutes } = require('./routes')
const { handleKafkaConsumerEvents } = require('./kafkaConsumerHanlders')

const createConnections = async () => {
  const { REDIS_HOST, KAFKA_HOST, KAFKA_PORT} = process.env
  const redisClient = redis.createClient({
    host: REDIS_HOST,
    db: 1,
  });
  redisClient.on("error", console.error);
  const kafka = new Kafka({
    brokers: [
      `${KAFKA_HOST}:${KAFKA_PORT}`,
    ],
    acks: 1,
    timeout: 1000,
  })
  const kafkaConsumer = kafka.consumer({
    groupId: `${KAFKA_GROUP_ID}-${(Math.random() % 100).toFixed(0)}`
  })
  await kafkaConsumer.connect()
  await kafkaConsumer.subscribe({
    topic: 'contacts_topic',
    fromBeginning: true,
  })
  return { kafkaConsumer, redisClient }
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

const createRESTServer = (redisClient) => {
  const { REST_PORT, } = process.env

  const app = new Koa();
  const router = new Router();
  createRoutes(router, redisClient)
  app
    .use(cors())
    .use(logger())
    .use(router.routes())
    .listen(REST_PORT);
  console.log(router.routes())
  
}

const main = async () => {
  const {
    kafkaConsumer,
    redisClient,
  } = await createConnections()
  cleanup(() => {
      kafkaConsumer && kafkaConsumer.stop()
  })
  handleKafkaConsumerEvents(kafkaConsumer, redisClient)
  createRESTServer(redisClient)
}

main()
