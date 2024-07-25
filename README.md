Настройка Google Cloud Functions 

1) Необходимо подключить биллинг к аккаунту (если его нет)
2) Добавить в аккаунт Cloud Functions (то что необходимо он у вас попросит установить)
3) Нужно так же установить Computer Engine (он нам создаст сервисный аккаунт)
4) Нужно получить ключ авторизаций
- Заходите в раздел IAM & Admin -> Service Accounts
- Находите аккаунт с именем Default compute service account
- Заходите в раздел KEYS
- Добавляете ключ с типом JSON
- и получаете файл он нам нужен будет что бы настроить WF и плагин

Создание функций
1) Необходимо создать 2 функций run_create и submit_tool_outputs_to_run (нужно именно так и назвать)

Характеристики run_create
Region: us-central1
Memory allocated: 1 GiB
CPU: 1
Timeout: 120 seconds
Minimum instances: 1
Maximum instances: 10
Concurrency: 20

Характеристики  submit_tool_outputs_to_run
Region: us-central1
Memory allocated: 256 MiB
CPU: 167 millis
Timeout: 120 seconds
Minimum instances: 0
Maximum instances: 100
Concurrency: 1
