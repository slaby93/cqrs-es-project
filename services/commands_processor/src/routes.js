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
    let isEnd = false;
    let index = 0;
    let tmp = []
    while (!isEnd) {
      const { events, isEndOfStream } = await esConnection.readStreamEventsForward(STREAM_NAME, index, 1000)
      index += 1000
      isEnd = isEndOfStream
      tmp.push(events)
    }
    tmp = tmp.flatMap(events => events.map(({ event }) => event.data.toString()))
    tmp.forEach(ev => {
      const { userId } = JSON.parse(ev)
      kafkaProducer.send({
        topic: MEMBERSHIP_TOPIC_NAME,
        messages: [
          {
            key: userId,
            value: ev,
          }
        ],
        compression: 1
      })
    })
    ctx.body = JSON.stringify({
      "a": tmp
    })
    next()
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