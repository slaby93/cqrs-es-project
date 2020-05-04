const uuid = require('uuid');
const esClient = require('node-eventstore-client');
const {
  MEMBERSHIP_TOPIC_NAME,
  COMMANDS,
  EVENTS,
  STREAM_NAME,
} = require('./constants')

const createRoutes = (router, kafkaProducer, esConnection) => {
  router.post("/group/:groupid/:userid", handleRoute(
    COMMANDS.ADD_TO_GROUP,
    EVENTS.USER_ADDED_TO_GROUP,
    kafkaProducer,
    esConnection
  ))
  router.delete("/group/:groupid/:userid", handleRoute(
    COMMANDS.REMOVE_FROM_GROUP,
    EVENTS.USER_REMOVED_FROM_GROUP,
    kafkaProducer,
    esConnection
  ))
  router.get("/restart", async (ctx, next) => {
    await _restoreAllEvents(esConnection, kafkaProducer)
    ctx.res.statusCode = 200
    next()
  })
}

const _restoreAllEvents = async (esConnection, kafkaProducer) => {
  const BATCH_SIZE = 1000
  const response = await esConnection.readStreamEventsForward(STREAM_NAME, 0, 1)
  const totalNumberOfEvents = response.lastEventNumber.low
  if (!totalNumberOfEvents) throw new Error('No events to reload!')

  let arrayOfPromise = []
  for (let index = 0; index < totalNumberOfEvents; index += BATCH_SIZE) {
    arrayOfPromise.push(_handleEventBatch(esConnection, kafkaProducer, STREAM_NAME, index, BATCH_SIZE))
  }
  await Promise.all(arrayOfPromise)
}

const _handleEventBatch = async (esConnection, kafkaProducer, stream_name, offset, count) => {
  const { events } = await esConnection.readStreamEventsForward(stream_name, offset, count)
  events
    .map(({ event }) => event.data.toString())
    .forEach(event => {
      const { userId } = JSON.parse(event)
      kafkaProducer.send({
        topic: MEMBERSHIP_TOPIC_NAME,
        messages: [
          {
            key: userId,
            value: event,
          }
        ],
        compression: 1
      })
    })
}

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

const handleRoute = (command, eventType, kafkaProducer, esConnection) => (async (ctx, next) => {
  const [groupid, userid] = ctx.captures
  try {
    await validators[command](groupid, userid)
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
          key: userid,
          value: JSON.stringify(event),
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
  } catch (error) {
    console.error(error)
    ctx.body = JSON.stringify({
      error: `${error}`,
    })
    ctx.res.statusCode = 500
  } finally {
    next()
  }
})

module.exports = {
  createRoutes,
}