DOCKER_NAME=web_client

build_docker_image:
	docker build -t ${DOCKER_NAME} .

run_docker_image:
	docker run -p 9000:9000 ${DOCKER_NAME}