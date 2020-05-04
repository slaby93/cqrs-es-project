const { promisify } = require("util");

const EVENTS = {
  USER_HAVE_NEW_FRIEND: 'USER_HAVE_NEW_FRIEND',
  USER_LOST_FRIEND: 'USER_LOST_FRIEND',
}

const handleKafkaConsumerEvents = (kafkaConsumer, redisClient) => {
  kafkaConsumer.run({
    eachMessage: async ({ message }) => {
      handleEvent(message, redisClient)
    },
  });
}

const handleEvent = async (message, redisClient) => {
  try {
    const parsedValue = JSON.parse(message.value.toString())
    eventHandlers[parsedValue.type](parsedValue, redisClient)
  } catch (error) {
    console.error(error)
  }
}

const eventHandlers = {
  /**
   * Creates materialized view of friends assigned to user
   */
  [EVENTS.USER_HAVE_NEW_FRIEND]: async (event, redisClient) => {
    const { userId, newFriendUserId } = event
    await promisify(redisClient.SADD).bind(redisClient)(userId, newFriendUserId)
  },
  [EVENTS.USER_LOST_FRIEND]: async (event, redisClient) => {
    const { userId, removedFriendUserId } = event
    await promisify(redisClient.SREM).bind(redisClient)(userId, removedFriendUserId)
  },
}

module.exports = {
  handleKafkaConsumerEvents
}