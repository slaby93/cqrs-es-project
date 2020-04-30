require('babel-register');

const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger')
const cors = require('@koa/cors');
const esClient = require('node-eventstore-client');
const uuid = require('uuid');
const { Kafka } = require('kafkajs')

const MEMBERSHIP_TOPIC_NAME = 'membership_topic'
const COMMANDS = {
  ADD_TO_GROUP: 'ADD_TO_GROUP',
  REMOVE_FROM_GROUP: 'REMOVE_FROM_GROUP',
}
const EVENTS = {
  USER_ADDED_TO_GROUP: 'USER_ADDED_TO_GROUP',
  USER_REMOVED_FROM_GROUP: 'USER_REMOVED_FROM_GROUP',
}
const ERRORS = {
  USER_ALREADY_IN_GROUP: 'USER_ALREADY_IN_GROUP',
  USER_NOT_IN_GROUP: 'USER_NOT_IN_GROUP',
}
const STREAM_NAME = "groups_stream";

const handleRoute = (command, eventType, kafkaProducer, esConnection) => (async (ctx, next) => {
  const [ groupid, userid ] = ctx.captures
  try {
    await validate[command](groupid, userid)
    const event = {
      id: uuid.v4(),
      type: eventType,
      userId: userid,
      groupId: groupid,
    };
    const eventStoreEvent = esClient.createJsonEventData(event.id, event, null, eventType);
    const eventStoreResponse = await esConnection.appendToStream(STREAM_NAME, esClient.expectedVersion.any, eventStoreEvent)
    const kafkaResponse = await kafkaProducer.send({
      topic: MEMBERSHIP_TOPIC_NAME,
      messages: [
        {
          value: JSON.stringify(event)
        }
      ],
      compression: 1
    })
    ctx.body = JSON.stringify({
      msg: `Added user ${userid} to group ${groupid}`,
      kafkaResponse,
      eventStoreResponse,
    })
    ctx.res.statusCode = 200
  } catch(error) {
    console.error(error)
    ctx.body = JSON.stringify({
      error: `${error}`,
    })
    ctx.res.statusCode = 500
  } finally {
    next()
  }
})

const validators = {
  [COMMANDS.ADD_TO_GROUP]: async (groupid, userid) => {
    // TODO: validate if can add user to group
    // throw new Error(ERRORS.USER_ALREADY_IN_GROUP)
  },
  [COMMANDS.REMOVE_FROM_GROUP]: async (groupid, userid) => {
    // TODO: validate if can remove add user to group
    // throw new Error(ERRORS.USER_NOT_IN_GROUP)
  }
}

const createRoutes = (router, kafkaProducer, esConnection) => {
  router.post("/group/:groupid/:userid",  handleRoute(COMMANDS.ADD_TO_GROUP, EVENTS.ADDED_TO_GROUP, kafkaProducer, esConnection))
  router.delete("/group/:groupid/:userid", handleRoute(COMMANDS.REMOVE_FROM_GROUP, EVENTS.REMOVED_FROM_GROUP, kafkaProducer, esConnection))
}

const createEventStoreConnection = async () => {
  try {
    const connSettings = {};  // Use defaults
    const esConnection = esClient.createConnection(connSettings, "tcp://eventstore1:1113");
    await esConnection.connect();
    esConnection.once('connected', function (tcpEndPoint) {
        console.log('Connected to eventstore at ' + tcpEndPoint.host + ":" + tcpEndPoint.port);
    });
    return esConnection
  } catch(error) {
    console.error(error)
  }
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
  const esConnection = await createEventStoreConnection()
  const kafkaProducer = kafka.producer()
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

setup()
