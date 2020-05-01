const { Kafka } = require('kafkajs')
const redis = require("redis");


const MEMBERSHIP_TOPIC_NAME = 'membership_topic'
const KAFKA_GROUP_ID = 'test-group'
const EVENTS = {
  USER_ADDED_TO_GROUP: 'USER_ADDED_TO_GROUP',
  USER_REMOVED_FROM_GROUP: 'USER_REMOVED_FROM_GROUP',
}
const SIGNALS = ["SIGUSR2", "SIGHUP", "SIGINT", "SIGQUIT", "SIGTERM"]

const main = async () => {
  const redisClient = redis.createClient({
    host: 'redis',
    db: 1,
  });
  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [
      "kafka:9093"
    ],
    acks: 1,
    timeout: 1000,
  })

  const kafkaConsumer = kafka.consumer({
    groupId: KAFKA_GROUP_ID,
  })
  SIGNALS.forEach(signal => {
    process.on(signal, () => {
      redisClient && redisClient.quit()
      kafkaConsumer && kafkaConsumer.stop()
      process.exit();
    })
  })

  await kafkaConsumer.connect()
  await kafkaConsumer.subscribe({
    topic: MEMBERSHIP_TOPIC_NAME,
    fromBeginning: true,
  })
  redisClient.on("error", function (error) {
    console.error(error);
  });
  kafkaConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const parsedValue = JSON.parse(message.value.toString())
      eventHandlers[parsedValue.type](parsedValue, redisClient)
    },
  });
}

const eventHandlers = {
  [EVENTS.USER_ADDED_TO_GROUP]: async (event, redisClient) => {
    console.log(event)
    const { userId, groupId } = event
    redisClient.SADD(groupId, userId, redis.print);
    redisClient.SMEMBERS(groupId, members => console.log(members))
  },
  [EVENTS.USER_REMOVED_FROM_GROUP]: async (event, redisClient) => {
    console.log(event)
    const { userId, groupId } = event
    redisClient.SREM(groupId, userId, redis.print);
    redisClient.SMEMBERS(groupId, members => console.log(members))
  }
}

main()