start:
	docker-compose rm -sf 
	docker-compose build --parallel
	docker-compose up --remove-orphans --scale groups_service=3

clear_volume:
	docker-compose rm -v 
