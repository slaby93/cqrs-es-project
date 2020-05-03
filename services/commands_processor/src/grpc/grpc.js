const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');
const handlers = require('./handlers')
const PROTO_PATH = './src/grpc/template.proto'

function getServer(schema) {
  const server = new grpc.Server();
  server.addProtoService(schema.service, handlers);
  return server;
}

const startGrpc = () => {
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
  const server = getServer(grpcSchema.CommandIssuer)
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start()
}

module.exports = {
  startGrpc,
}