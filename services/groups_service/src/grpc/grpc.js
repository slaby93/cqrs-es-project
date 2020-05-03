const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');
const handlers = require('./handlers')
const PROTO_PATH = './src/grpc/templates/groups_service.proto'

function getServer(schema) {
  const server = new grpc.Server();
  server.addProtoService(schema.service, handlers);
  return server;
}

const startGrpc = ({
  host,
  port,
}) => {
  const grpcSchema = grpc.loadPackageDefinition(
    protoLoader.loadSync(
      PROTO_PATH,
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      })
  );
  const server = getServer(grpcSchema.GroupsService)
  const grpc_url = `${host}:${port}`
  server.bind(grpc_url, grpc.ServerCredentials.createInsecure());
  server.start()
  console.debug(`GRPC started on ${grpc_url}`)
}

module.exports = {
  startGrpc,
}