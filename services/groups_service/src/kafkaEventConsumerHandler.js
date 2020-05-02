const uuid = require('uuid');
const { promisify } = require("util");
const {
  CONTACTS_TOPIC_NAME,
  EVENTS,
} = require('./constants.js')

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
    eventHandlers[parsedValue.type](parsedValue, redisClient, kafkaProducer)
    console.log(`The event was successfully handled`)
  } catch(error) {
    console.error(error)
  }
}

const eventHandlers = {
  [EVENTS.USER_ADDED_TO_GROUP]: async (event, redisClient, kafkaProducer) => {
    const { userId, groupId } = event
    // Add user to group
    // for each user in group, add
    const members = await promisify(redisClient.SMEMBERS).bind(redisClient)(groupId)
    const promises = members.map(existingUser => kafkaProducer.send({
      topic: CONTACTS_TOPIC_NAME,
      messages: [
        {
          key: existingUser,
          value: JSON.stringify({
            id: uuid.v4(),
            type: 'USER_HAVE_NEW_FRIEND',
            userId: existingUser,
            newFriendUserId: userId
          }),
        }
      ],
      compression: 1
    }))
    await Promise.all(promises)
    await promisify(redisClient.SADD).bind(redisClient)(groupId, userId)
  },
  [EVENTS.USER_REMOVED_FROM_GROUP]: async (event, redisClient, kafkaProducer) => {
    throw new Error('IMPLEMENT ME')
    const { userId, groupId } = event
    const newEvent = {
      id: uuid.v4(),
      type: ''
    };
    redisClient.SREM(groupId, userId);
    await kafkaProducer.send({
      topic: CONTACTS_TOPIC_NAME,
      messages: [
        {
          key: userId,
          value: JSON.stringify(newEvent),
        }
      ],
      compression: 1
    })
  }
}

module.exports = {
  handleKafkaConsumerEvents
}