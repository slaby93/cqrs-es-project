

const status = (call, callback) => {
  callback(null, { status: 1 })
}

const validate = async (call, callback) => {
  //TODO: validate if user X is in group
  callback(null, { status: 2, message: 'test' })
}

module.exports = {
  status,
  validate
}