const EVENTS = {
  USER_HAVE_NEW_FRIEND: 'USER_HAVE_NEW_FRIEND'
}

const handleKafkaConsumerEvents = kafkaConsumer => {
  kafkaConsumer.run({
    eachMessage: async ({ message }) => {
      const parsedValue = JSON.parse(message.value.toString())
      eventHandlers[parsedValue.type](parsedValue)
    },
  });
}

const eventHandlers = {
  [EVENTS.USER_HAVE_NEW_FRIEND] : async (event) => {
    console.log(`Got new event: ${event}`)
  }
}

module.exports = {
  handleKafkaConsumerEvents
}