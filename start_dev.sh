export NODE_ENV=development
export COMPOSE_PROJECT_NAME=gw2trivia-${NODE_ENV}
docker compose up -d $@