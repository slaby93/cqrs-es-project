# cqrs-es-project
Simple CQRS/ES system that contains several services capable of managing users in groups. Purpose of this project is to implement simple CQRS/ES system and discover problems that comes with this design choice. It's handcrafted, no frameworks, only minimal set of libraries. Also system is not built with TS as main focus in this particualr project is on idea behind CQRS/ES.

## How to run
### Prerequisites
```
docker
docker-compose
```
### Commands
```bash
cd <root>
make
```
Go to `http://localhost:9000` to issue command.

![](https://i.imgur.com/gvACszB.png)

## Design
This is simplified system (without reverse proxy).

Client - web_client - Simple React application that serve as a commands issuer. Commands are being sent via REST API to Commands Processor service.

Commands Procesor - Have simple REST API that accepts command as soon as validation is complited, create event and sends it to kafka topic and eventStore. Command must be a transaction so if either kafka or eventstore is down, we'll return 500.

Groups Service - Service that reads all events from Commands Processor and manipulates users in groups. I use Redis and Set to store users within a group. Once users is added/removed from group, I generate events for each user in group with information that User X have new/lost friend, which are sent to another Kafka topic.

Query Processor - Service that have REST API to serve informations to web client. It reads events from Groups Service and creates materialized views for each user (List of friends for given UserID).

![](https://github.com/slaby93/cqrs-es-project/blob/master/goal.png?raw=true)
