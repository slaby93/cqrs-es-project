const MEMBERSHIP_TOPIC_NAME = 'membership_topic'
const CONTACTS_TOPIC_NAME = 'contacts_topic'
const KAFKA_GROUP_ID = 'test-group'
const EVENTS = {
  USER_ADDED_TO_GROUP: 'USER_ADDED_TO_GROUP',
  USER_REMOVED_FROM_GROUP: 'USER_REMOVED_FROM_GROUP',
}
const SIGNALS = ["SIGUSR2", "SIGHUP", "SIGINT", "SIGQUIT", "SIGTERM"]

module.exports = {
  MEMBERSHIP_TOPIC_NAME,
  CONTACTS_TOPIC_NAME,
  KAFKA_GROUP_ID,
  EVENTS,
  SIGNALS,
}