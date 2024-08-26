export NODE_ENV=production
export GW2TRIVIA_VERSION=1.0.6
export NODE_PORT=3033
export NODE_DEBUGGER_PORT=9230
export POSTGRES_PORT=5433
docker compose -f docker-compose.yml up -d
