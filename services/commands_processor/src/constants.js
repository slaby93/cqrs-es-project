const MEMBERSHIP_TOPIC_NAME = 'membership_topic'
const COMMANDS = {
  ADD_TO_GROUP: 'ADD_TO_GROUP',
  REMOVE_FROM_GROUP: 'REMOVE_FROM_GROUP',
}
const EVENTS = {
  USER_ADDED_TO_GROUP: 'USER_ADDED_TO_GROUP',
  USER_REMOVED_FROM_GROUP: 'USER_REMOVED_FROM_GROUP',
}
const ERRORS = {
  USER_ALREADY_IN_GROUP: 'USER_ALREADY_IN_GROUP',
  USER_NOT_IN_GROUP: 'USER_NOT_IN_GROUP',
}
const STREAM_NAME = "groups_stream";
const SIGNALS = ["SIGUSR2", "SIGHUP", "SIGQUIT", "SIGTERM"]

module.exports = {
  MEMBERSHIP_TOPIC_NAME,
  COMMANDS,
  EVENTS,
  ERRORS,
  STREAM_NAME,
  SIGNALS,
}