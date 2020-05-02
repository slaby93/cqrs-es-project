start:
	docker-compose rm -svf 
	docker-compose build --parallel
	docker-compose up --remove-orphans