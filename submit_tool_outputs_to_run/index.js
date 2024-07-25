//Подключаем библиотеки
const { http } = require('@google-cloud/functions-framework');
const { OpenAI } = require('openai');
const axios = require('axios');
const Joi = require('joi');

// Валидация входных данных с использованием Joi
const schema = Joi.object({
    api_key: Joi.string().required(),
    thread_id: Joi.string().required(),
    run_id: Joi.string().required(),
    tool_outputs: Joi.array().required(),
    message_id: Joi.string().required(),
    version_api: Joi.string().valid('v1', 'v2').required(),
    url_endpoint_run_status: Joi.string().required(),
    url_endpoint_run_status_key: Joi.string().required()
});
// Функция для отправки о состояние статуса на бабл
async function sendStatusReport(data, url_endpoint, key_endpoint) {
    try {
        const body = { data }; // Тело запроса для отправки статуса

        const options = {
            url: url_endpoint, // URL для отправки репорта
            method: 'POST', // Метод запроса POST
            headers: {
                'Accept': 'application/json', // Ожидание ответа в формате JSON
                'Authorization': `Bearer "${key_endpoint}"` // Авторизация с использованием ключа
            },
            data: body // Данные тела запроса
        };
        const response = await axios(options); // Выполнение запроса с помощью axios
        console.log(`Report to Bubble status code ${response.status}`); // Лог ответа
    } catch (error) {
        console.error('Error status reporting:', error); // Лог ошибки
    }
}

// Функция запуска рана
async function threadRunSubmitToolOutputs(data) {
    try {
        // Настраеваем OpenAI
        const openai = new OpenAI({
            apiKey: data.api_key,
            defaultHeaders: {
                'OpenAI-Beta': `assistants=${data.version_api}`
            }
        });
        return await openai.beta.threads.runs.submitToolOutputs(
            data.thread_id,
            data.run_id,
            {
                tool_outputs: data.tool_outputs,
                stream: true
            });
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}
// Функция для отправки репортов
async function runHandler(stream,res,req) {
    try {
        // Определяем нужные нам статусы
        let expectedStatuses = [
            'thread.run.created',
            'thread.run.in_progress',
            'thread.message.in_progress',
            'thread.message.completed',
            'thread.run.completed',
            'thread.run.requires_action',
            'thread.run.failed',
            'thread.run.expired'
        ];
        // Переменная для контента
        let content = null;
        let step_number = 2;
        // Обработка Stream
        for await (const run of stream) {
            if(expectedStatuses.includes(run.event)){
                console.log(`event name: ${run.event}\nrun id: ${run.data.run_id || run.data.id}`);
                // Фиксируем задержку для бабла
                step_number++;
                // Записываем готовый контент
                if(run.event === expectedStatuses[3]) {
                    content = run.data.content.find(item => item.type === 'text')?.text.value;
                } else if(run.event === expectedStatuses[4] || run.event === expectedStatuses[5]) {
                    const responseData  = {
                        thread_id : run.data.thread_id,
                        run_id : run.data.id,
                        status : run.data.status,
                        content : content
                    };
                    res.status(200).send(responseData);
                } else if(run.event === expectedStatuses[6] || run.event === expectedStatuses[7]) {
                    console.log(run);
                    throw new Error(run.data.last_error);
                }
                // Отправляем репорты
                let responseData = {
                    event: run.event,
                    run_status: run.data.status,
                    thread_id: run.data.thread_id,
                    run_id : run.data.run_id || run.data.id,
                    message_id: req.message_id,
                    step_number: run.event === expectedStatuses[4] ? 0 : step_number
                }
                await sendStatusReport(responseData,req.url_endpoint_run_status,req.url_endpoint_run_status_key);
            }
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error)
        throw error;
    }
}
http('main', async (req, res) => {
    if (req.method === 'POST') {
        try {
            await schema.validateAsync(req.body);
            const stream = await threadRunSubmitToolOutputs(req.body);
            await runHandler(stream,res,req.body);
        }
        catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    } else {
        res.status(405).send('Method Not Allowed');
    }
});