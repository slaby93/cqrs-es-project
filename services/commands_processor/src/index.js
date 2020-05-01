require('babel-register');

const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger')
const cors = require('@koa/cors');
const esClient = require('node-eventstore-client');
const { Kafka } = require('kafkajs')

const {
  MEMBERSHIP_TOPIC_NAME,
  COMMANDS,
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

const main = async () => {
  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [
      "kafka:9093"
    ],
    acks: 1,
    timeout: 1000,
  })
  // Not best way to do this, but it works and is fast, so
  //TODO: find better way to create topic :)
  const admin = kafka.admin()
  await admin.createTopics({
    waitForLeaders: true,
    topics: [{
      topic: MEMBERSHIP_TOPIC_NAME,
      numPartitions: 100,     // default: 1
    }],
  })
  const esConnection = await createEventStoreConnection()
  const kafkaProducer = kafka.producer()
  SIGNALS.forEach(signal => {
    process.on(signal, () => {
      kafkaProducer && kafkaProducer.disconnect()
    })
  })
  await kafkaProducer.connect()
  const app = new Koa();
  const router = new Router();
  createRoutes(router, kafkaProducer, esConnection)
  app
    .use(cors())
    .use(logger())
    .use(router.routes())
    .listen(9001);
}

main()
