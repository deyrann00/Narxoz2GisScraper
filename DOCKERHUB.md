# Narxoz 2GIS Scraper

MCP-сервер, который собирает отзывы из [2ГИС](https://2gis.kz) по филиалам **Университета Нархоз**, отсеивает нерелевантные с помощью LLM (через [OpenRouter](https://openrouter.ai)), раскладывает остальные на **позитивные / нейтральные / негативные** и отправляет отчёт на email.

Исходники: [github.com/deyrann00/Narxoz2GisScraper](https://github.com/deyrann00/Narxoz2GisScraper)

## Возможности

- Сбор отзывов и ответов организации по всем филиалам: обычные HTTP-запросы, без браузера и логина
- LLM-анализ каждого отзыва: релевантен ли он администрации, тональность, темы, суть одной фразой. Отзыв анализируется один раз, результат хранится в архиве
- Один самодостаточный `index.html`: фильтры по периоду, тональности и филиалу, сводная таблица «филиал × тональность», вид «лента» или «таблица»
- Отчёт на почту по SMTP: таблицы негативных, нейтральных и позитивных отзывов, интерактивный отчёт во вложении
- Архив в JSONL и CSV

## Быстрый старт

Сервер общается по протоколу MCP через stdin/stdout, поэтому контейнер запускается с флагом `-i`:

```bash
docker run -i --rm --env-file .env \
  -v "$PWD/data:/app/data" \
  -v "$PWD/config.json:/app/config.json" \
  deyrann00/narxoz-2gis-scraper
```

Подключение к Claude Code (`.mcp.json`):

```json
{
  "mcpServers": {
    "narxoz-2gis": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "--env-file", "/abs/path/.env",
               "-v", "/abs/path/data:/app/data",
               "-v", "/abs/path/config.json:/app/config.json",
               "deyrann00/narxoz-2gis-scraper"]
    }
  }
}
```

## Переменные окружения

| Переменная | Назначение | Обязательна |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Ключ [OpenRouter](https://openrouter.ai/keys) для LLM-анализа | Нет. Без него тональность определяется по звёздам, и ничего не отсеивается |
| `SMTP_USER` | Логин SMTP (адрес отправителя) | Только для отправки email |
| `SMTP_PASS` | Пароль SMTP. Для Gmail это [пароль приложения](https://myaccount.google.com/apppasswords) | Только для отправки email |
| `NARXOZ_2GIS_ROOT` | Папка с `config.json` и `data/` | Нет, по умолчанию `/app` |

Пример `.env`:

```env
OPENROUTER_API_KEY=sk-or-...
SMTP_USER=you@gmail.com
SMTP_PASS=app-password
```

> Не публикуйте `.env` и не вшивайте ключи в образ: передавайте их только при запуске.

## Конфигурация (`config.json`)

Монтируется в `/app/config.json`. Если файла нет, используется конфиг из образа.

```json
{
  "queries": ["Нархоз", "Narxoz"],
  "name_filters": ["нархоз", "narxoz"],
  "city": "almaty",
  "llm": {
    "model": "openai/gpt-4o-mini",
    "base_url": "https://openrouter.ai/api/v1"
  },
  "email": {
    "to": ["admin@example.com"],
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 465,
    "smtp_secure": true,
    "period_hours": 168
  }
}
```

`llm.model` принимает любой slug OpenRouter (`google/gemini-2.5-flash`, `anthropic/claude-haiku-4.5`, …). `llm.base_url` подходит любой OpenAI-совместимый.

## Данные (`/app/data`)

| Файл | Содержимое |
| --- | --- |
| `reviews.jsonl` | Полный архив отзывов с полем `analysis` |
| `reviews.csv` | То же для таблиц, с колонками `relevant`, `sentiment`, `topics`, `summary` |
| `index.html` | Интерактивный отчёт |
| `branches.json` | Найденные филиалы с рейтингом |
| `runs/` | JSON-сводка каждого запуска |

## MCP-инструменты

| Инструмент | Что делает |
| --- | --- |
| `scrape_narxoz_2gis` | Собрать новые отзывы и проанализировать их (`full: true` — дозагрузить архив) |
| `analyze_narxoz_2gis` | Классифицировать отзывы LLM (`force: true` — заново) |
| `latest_narxoz_2gis` | Отзывы из архива (`hours`, `sentiment`, `include_irrelevant`, …) |
| `send_narxoz_2gis_report` | Отправить отчёт на email (`to`, `hours`) |
| `view_narxoz_2gis` | Пересобрать `index.html` |
| `find_narxoz_2gis_branches` | Список отслеживаемых филиалов |
| `narxoz_2gis_status` | Пути, настройки LLM/SMTP (без секретов), последний запуск |

## Теги

- `latest` — последняя версия
- `0.4.0` — LLM-анализ, разбивка по тональности, email

Платформы: `linux/amd64`, `linux/arm64`.
