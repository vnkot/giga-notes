PROXY_DIR = ./services/gigachat-proxy
PROXY_FILE = ${PROXY_DIR}/docker-compose.yml

# ========== Управление прокси ==========
run-proxy:
	@echo "Запуск GigaChat Proxy..."
	@docker compose -f "${PROXY_FILE}" up -d

stop-proxy:
	@echo "Остановка GigaChat Proxy..."
	@docker compose -f "${PROXY_FILE}" down

# ========== Управление плагином ==========
run-dev-plugin:
	@echo "Запуск разработки плагина..."
	npm run dev

build-plugin:
	@echo "Сборка плагина..."
	npm run build