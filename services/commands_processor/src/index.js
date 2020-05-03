require('babel-register');

const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger')
const cors = require('@koa/cors');
const esClient = require('node-eventstore-client');
const { Kafka } = require('kafkajs')

const {
  MEMBERSHIP_TOPIC_NAME,
  SIGNALS,
} = require('./constants')

const { createRoutes } = require('./routes')

const createEventStoreConnection = async () => {
  try {
    const connSettings = {};  // Use defaults
    const esConnection = esClient.createConnection(connSettings, "tcp://eventstore1:1113");
    await esConnection.connect();
    esConnection.once('connected', function (tcpEndPoint) {
      console.log('Connected to eventstore at ' + tcpEndPoint.host + ":" + tcpEndPoint.port);
    });
    return esConnection
  } catch (error) {
    console.error(error)
  }
}

const createConnections = async () => {
  const { KAFKA_HOST, KAFKA_PORT } = process.env

  const kafka = new Kafka({
    clientId: 'commands-processor',
    brokers: [
      `${KAFKA_HOST}:${KAFKA_PORT}`,
    ],
    acks: 1,
    timeout: 1000,
  })
  const admin = kafka.admin()
  await admin.createTopics({
    waitForLeaders: true,
    topics: [{
      topic: MEMBERSHIP_TOPIC_NAME,
      numPartitions: 3,
    }],
  })
  const esConnection = await createEventStoreConnection()
  const kafkaProducer = kafka.producer()
  await kafkaProducer.connect()

  return {
    esConnection,
    kafkaProducer
  }
}

const cleanup = cb => {
  SIGNALS.forEach(signal => {
    process.on(signal, async () => {
      try {
        console.log(signal)
        if (cb) await cb()
      } finally {
        process.exit()
      }
    })
  })
}

const createRESTServer = async (kafkaProducer, esConnection) => {
  const { REST_PORT } = process.env
  const app = new Koa();
  const router = new Router();
  createRoutes(router, kafkaProducer, esConnection)
  app
    .use(cors())
    .use(logger())
    .use(router.routes())
    .listen(REST_PORT);
  return app
}



const main = async () => {
  const {
    esConnection,
    kafkaProducer
  } = await createConnections()
  const app = await createRESTServer(kafkaProducer, esConnection)
  cleanup(async () => {
    if (kafkaProducer) await kafkaProducer.disconnect()
    if (esConnection) esConnection.close()
    if(app) app.removeAllListeners()
  })

}

main()
