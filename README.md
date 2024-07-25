<b>Настройка Google Cloud Functions</b>

1) Необходимо подключить биллинг к аккаунту <i>(если его нет)</i>
2) Добавить в аккаунт Cloud Functions <i>(то что необходимо он у вас попросит установить)</i>
3) Нужно так же установить Computer Engine <i>(он нам создаст сервисный аккаунт)</i>
4) Нужно получить ключ авторизаций
   - Заходите в раздел IAM & Admin -> Service Accounts
   - Находите аккаунт с именем Default compute service account
   - Заходите в раздел KEYS
   - Добавляете ключ с типом JSON
   - и получаете файл он нам нужен будет что бы настроить WF и плагин

<b>Создание функций</b>
1) Необходимо создать 2 функций (нужно именно так и назвать)
   - run_create
   - submit_tool_outputs_to_run

<b>Характеристики run_create</b>
- Region: us-central1
- Memory allocated: 1 GiB
- CPU: 1
- Timeout: 120 seconds
- Minimum instances: 1
- Maximum instances: 10
- Concurrency: 20

<b>Характеристики  submit_tool_outputs_to_run</b>
- Region: us-central1
- Memory allocated: 256 MiB
- CPU: 167 millis
- Timeout: 120 seconds
- Minimum instances: 0
- Maximum instances: 100
- Concurrency: 1

<b>Настройка плагина Google Cloud JWT Token Create</b>
- Нужно скопировать плагин с других аккаунтов если у вас его нет в вашем аккаунте
- Если есть в вашем аккаунте копия плагина вам так же нужно сделать копию для своего проекта и поменять там ключи в переменной "privateKey" который вы скачали из Google Cloud

<b>Настройка БД</b>
- Найти сущность system settings
- И очистить поля которые ниже
- systemGoogleDateExpiration
- systemGoogleIDToken
- И поменять ссылки в этих полях под своих из Google Cloud Functions 
- systemGoogleTargetAudienceURL
- systemGoogleTargetAudienceURL_dev (можно в целом оставить пустым)
