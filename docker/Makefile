.PHONY = init
init:
	docker network inspect es_bridge >/dev/null 2>&1 || docker network create es_bridge


.PHONY = up-petclinic
up-petclinic: init
	docker compose -p petclinic-services -f docker-compose-petclinic.yml up -d

.PHONY = down-petclinic
down-petclinic:
	docker compose -p petclinic-services -f docker-compose-petclinic.yml down

.PHONY = setup-elk
setup-elk: init
	docker compose -p petclinic-elk --profile setup -f docker-compose-elk.yml up -d

.PHONY = down-elk
down-elk:
	docker compose -p petclinic-elk --profile setup -f docker-compose-elk.yml down

.PHONY = up-elk
up-elk:
	docker compose -p petclinic-elk -f docker-compose-elk.yml up -d
