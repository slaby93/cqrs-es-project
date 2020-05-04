const uuid = require('uuid');
const { promisify } = require("util");
const {
  CONTACTS_TOPIC_NAME,
  EVENTS,
} = require('./constants.js')

const EVENTS_QP = {
  USER_HAVE_NEW_FRIEND: 'USER_HAVE_NEW_FRIEND',
  USER_LOST_FRIEND: 'USER_LOST_FRIEND',
}

const handleKafkaConsumerEvents = async (kafkaConsumer, redisClient, kafkaProducer) => {
  debugger
  kafkaConsumer.run({
    eachMessage: async ({ message }) => {
      await handleMessage(message, redisClient, kafkaProducer)
    },
  });
}


const handleMessage = async (message, redisClient, kafkaProducer) => {
  try {
    const parsedValue = JSON.parse(message.value.toString())
    await eventHandlers[parsedValue.type](parsedValue, redisClient, kafkaProducer)
  } catch (error) {
    console.error(error)
  }
}

const eventHandlers = {
  [EVENTS.USER_ADDED_TO_GROUP]: async (event, redisClient, kafkaProducer) => {
    const { userId, groupId } = event
    const isAlreadyInSet = await promisify(redisClient.SISMEMBER).bind(redisClient)(groupId, userId)
    if (isAlreadyInSet) return
    const members = await promisify(redisClient.SMEMBERS).bind(redisClient)(groupId)
    const promises = members.map(async existingUser => await kafkaProducer.send({
      topic: CONTACTS_TOPIC_NAME,
      messages: [
        {
          key: existingUser,
          value: JSON.stringify({
            id: uuid.v4(),
            type: EVENTS_QP.USER_HAVE_NEW_FRIEND,
            userId: existingUser,
            newFriendUserId: userId
          }),
        }
      ],
      compression: 1
    }))
    promises.concat(members.map(async oldUserID => await kafkaProducer.send({
      topic: CONTACTS_TOPIC_NAME,
      messages: [
        {
          key: userId,
          value: JSON.stringify({
            id: uuid.v4(),
            type: EVENTS_QP.USER_HAVE_NEW_FRIEND,
            userId: userId,
            newFriendUserId: oldUserID,
          }),
        }
      ],
      compression: 1
    })))
    await Promise.all(promises)
    await promisify(redisClient.SADD).bind(redisClient)(groupId, userId)
  },
  [EVENTS.USER_REMOVED_FROM_GROUP]: async (event, redisClient, kafkaProducer) => {
    const { userId, groupId } = event
    const isAlreadyInSet = await promisify(redisClient.SISMEMBER).bind(redisClient)(groupId, userId)
    if (!isAlreadyInSet) return

    redisClient.SREM(groupId, userId);

    const members = await promisify(redisClient.SMEMBERS).bind(redisClient)(groupId)
    const promises = []
    promises.concat(members.map(existingUser => kafkaProducer.send({
      topic: CONTACTS_TOPIC_NAME,
      messages: [
        {
          key: existingUser,
          value: JSON.stringify({
            id: uuid.v4(),
            type: EVENTS_QP.USER_LOST_FRIEND,
            userId: existingUser,
            removedFriendUserId: userId
          }),
        }
      ],
      compression: 1
    })))
    promises.concat(members.map(oldUserID => kafkaProducer.send({
      topic: CONTACTS_TOPIC_NAME,
      messages: [
        {
          key: userId,
          value: JSON.stringify({
            id: uuid.v4(),
            type: EVENTS_QP.USER_LOST_FRIEND,
            userId: userId,
            removedFriendUserId: oldUserID
          }),
        }
      ],
      compression: 1
    })))
    await Promise.all(promises)
  }
}

module.exports = {
  handleKafkaConsumerEvents
}