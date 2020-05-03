start:
	docker-compose rm -sf 
	docker-compose build --parallel
	docker-compose up --remove-orphans