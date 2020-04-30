const { Kafka } = require('kafkajs')
const redis = require("redis");


const MEMBERSHIP_TOPIC_NAME = 'membership_topic'

const main = async () => {
  const redisClient = redis.createClient({ host: 'redis' });
  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [
      "kafka:9093"
    ],
    acks: 1,
    timeout: 1000,
  })

  const kafkaConsumer = kafka.consumer({ groupId: 'test-group' })
  await kafkaConsumer.connect()
  await kafkaConsumer.subscribe({ topic: MEMBERSHIP_TOPIC_NAME, fromBeginning: true })
  redisClient.on("error", function (error) {
    console.error(error);
  });
  kafkaConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        topic,
        partition,
        value: message.value.toString(),
      })
    },
  });

  redisClient.set("key", "value", redis.print);
  redisClient.get("key", redis.print);
}

const eventHandlers = {
  "" : async () => {

  }
}

main()