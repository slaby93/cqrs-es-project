const SIGNALS = ["SIGUSR2", "SIGHUP", "SIGINT", "SIGQUIT", "SIGTERM"]
const KAFKA_GROUP_ID = 'query-processor'
module.exports = {
  SIGNALS,
  KAFKA_GROUP_ID
}