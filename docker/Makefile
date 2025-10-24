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
up-elk: init
	docker compose -p petclinic-elk -f docker-compose-elk.yml up -d

.PHONY = clean
clean: down-elk down-fleet
	docker compose -p petclinic-elk --env-file .env --env-file fleet.env --profile setup --profile fleet -f docker-compose-elk.yml down -v --remove-orphans
	docker network rm es_bridge

.PHONY = up-fleet
up-fleet:
	./01_fleet_pre_configuration.sh
	docker compose --env-file .env --env-file fleet.env -p petclinic-elk --profile fleet -f docker-compose-elk.yml up -d fleet-server

.PHONY = down-fleet
down-fleet:
	docker compose --env-file .env --env-file fleet.env -p petclinic-elk --profile fleet -f docker-compose-elk.yml down fleet-server
