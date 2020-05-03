const { Kafka } = require('kafkajs')
const redis = require("redis");
const {
  MEMBERSHIP_TOPIC_NAME,
  KAFKA_GROUP_ID,
  SIGNALS
} = require('./constants.js')
const { startGrpc } = require('./grpc/grpc')
const { handleKafkaConsumerEvents } = require('./kafkaEventConsumerHandler')

const createConnections = async () => {
  const {
    GRPC_HOST, 
    GRPC_PORT,
    REDIS_HOST,
    KAFKA_HOST,
    KAFKA_PORT,
  } = process.env
  if (!REDIS_HOST || !KAFKA_HOST || !KAFKA_PORT) {
    throw new Error('Missing env varaibles!')
  }
  startGrpc({ 
    host: GRPC_HOST,
    port: GRPC_PORT,
  })
  const redisClient = redis.createClient({
    host: REDIS_HOST,
    db: 1,
  });
  redisClient.on("error", console.error);
  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [
      `${KAFKA_HOST}:${KAFKA_PORT}`
    ],
    acks: 1,
    timeout: 1000,
  })
  const kafkaProducer = kafka.producer({
  })
  const kafkaConsumer = kafka.consumer({
    groupId: KAFKA_GROUP_ID,
    maxInFlightRequests: 5,
  })
  await kafkaProducer.connect()
  await kafkaConsumer.connect()
  await kafkaConsumer.subscribe({
    topic: MEMBERSHIP_TOPIC_NAME,
    fromBeginning: true,
  })
  return {
    kafkaProducer,
    kafkaConsumer,
    redisClient,
  }
}

const cleanup = cb => {
  SIGNALS.forEach(signal => {
    process.on(signal, () => {
      try {
        cb && cb()
      } finally {
        process.exit()
      }
    })
  })

}

const main = async () => {
  const {
    kafkaProducer,
    kafkaConsumer,
    redisClient,
  } = await createConnections()
  cleanup(() => {
    redisClient && redisClient.quit()
    kafkaConsumer && kafkaConsumer.stop()
    kafkaProducer && kafkaProducer.disconnect()
  })
  handleKafkaConsumerEvents(kafkaConsumer, redisClient, kafkaProducer)
}

main()