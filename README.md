# cqrs-es-project
Simple CQRS/ES system that contains several services capable of managing users in groups.

## Design 
Client - web_client - Simple React application that servers as commands issuer. Commands are being sent via HTTP protocol to commands_processor service.
Commands Procesor - Have simple REST API that after accepting command, create event and sends it to kafka topic and eventStore. Command must be a transaction so if either kafka or eventstore is down, we'll return 500.

Client have two avilable commands
Add user X to group
Remove user X from group

Groups service - Kafka topic consumer, makes changes to his local Redis DB.
```bash
http POST :9001/group/<group_id>/<user_id>
http DELETE :9001/group/<group_id>/<user_id>
```
![](https://github.com/slaby93/cqrs-es-project/blob/master/goal.png?raw=true)
