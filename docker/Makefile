init:
	docker network create es_bridge

.PHONY = up
up:
	docker compose -f petclinic-compose.yml up -d

.PHONY = down
down:
	docker compose -f petclinic-compose.yml down
