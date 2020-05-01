start:
	docker-compose rm -svf 
	docker-compose up --build --remove-orphans --scale groups_service=3