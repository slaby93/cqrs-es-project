const { promisify } = require("util");

const EVENTS = {
  USER_HAVE_NEW_FRIEND: 'USER_HAVE_NEW_FRIEND'
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
    console.log(`The event was successfully handled`)
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
}

module.exports = {
  handleKafkaConsumerEvents
}