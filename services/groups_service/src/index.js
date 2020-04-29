const { Kafka } = require('kafkajs')

const MEMBERSHIP_TOPIC_NAME = 'membership_topic'

const main = async () => {
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

  await kafkaConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        topic,
        partition,
        value: message.value.toString(),
      })
    },
  })
}

main()