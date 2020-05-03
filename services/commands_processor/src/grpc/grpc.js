const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');
const handlers = require('./handlers')
const COMMANDS_PROCESSOR_PROTO_PATH = './src/grpc/templates/commands_processor.proto'
const GROUPS_SERVICE_PROTO_PATH = './src/grpc/templates/groups_service.proto'

const GROUPS_SERVICE_GRPC_PORT = 50052

function getServer(schema) {
  const server = new grpc.Server();
  server.addProtoService(schema.service, handlers);
  return server;
}

const startGrpc = ({
  host,
  port,
}) => {
  const commandsProcessorGrpcSchema = grpc.loadPackageDefinition(
    protoLoader.loadSync(COMMANDS_PROCESSOR_PROTO_PATH)
  );
  const groupsServiceGrpcSchema = grpc.loadPackageDefinition(
    protoLoader.loadSync(GROUPS_SERVICE_PROTO_PATH)
  );
  const server = getServer(commandsProcessorGrpcSchema.CommandIssuer)
  server.bind(`${host}:${port}`, grpc.ServerCredentials.createInsecure());
  server.start()
  const groupsServiceClient = new groupsServiceGrpcSchema.GroupsService(`0.0.0.0:${GROUPS_SERVICE_GRPC_PORT}`, grpc.credentials.createInsecure());
  return { groupsServiceClient }
}

module.exports = {
  startGrpc,
}