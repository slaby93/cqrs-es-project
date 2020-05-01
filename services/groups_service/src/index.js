const { Kafka } = require('kafkajs')
const redis = require("redis");


const MEMBERSHIP_TOPIC_NAME = 'membership_topic'
const KAFKA_GROUP_ID = 'test-group'

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

  const kafkaConsumer = kafka.consumer({ groupId: KAFKA_GROUP_ID })
  await kafkaConsumer.connect()
  await kafkaConsumer.subscribe({ 
    topic: MEMBERSHIP_TOPIC_NAME
  })
  redisClient.on("error", function (error) {
    console.error(error);
  });
  kafkaConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
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