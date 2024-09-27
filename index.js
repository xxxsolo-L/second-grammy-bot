require('dotenv').config()
const {Bot, GrammyError, HttpError, Keyboard, InlineKeyboard} = require('grammy')
const {hydrate} = require ('@grammyjs/hydrate')

const bot = new Bot (process.env.BOT_API_KEY);
bot.use(hydrate());

bot.api.setMyCommands([{
    command: 'start',
    description: 'Start a bot'
    },
    {
    command: 'mood',
    description: 'What is u настроеньице'
    },
    {
    command: 'share',
    description: 'Give me your number bitch'
    },
    {
        command: 'inline_keyboard',
        description: 'Инлайн клава'
    },
    {
        command: 'menu',
        description: 'Меню'
    }
    ])
// 'msg' вся инфа, 'from' инфо о юзере
// bot.on('msg', async (ctx) => {
//     console.log(ctx.msg);
// })

bot.command('start', async (ctx) =>{
    await ctx.reply('Привет, айм БОТ')
})

const menuKeyboard = new InlineKeyboard().text('Узнать статус заказа', 'order-status').text('Обратиться в поддержку', 'support');
const backKeyboard = new InlineKeyboard().text('< назад в меню', 'back');

bot.command('menu', async (ctx) =>{
await ctx.reply('Выберите пункт меню', {
    reply_markup: menuKeyboard,
})
})

bot.callbackQuery('order-status', async (ctx) => {
    await ctx.callbackQuery.message.editText('Статус заказа: в пути', {
        reply_markup: backKeyboard,
    })
    await ctx.answerCallbackQuery() // не забываем завершать загрузку ответа
})

bot.callbackQuery('support', async (ctx) => {
    await ctx.callbackQuery.message.editText('Напишите Ваш запрос: ', {
        reply_markup: backKeyboard,
    })
    await ctx.answerCallbackQuery()
})

bot.callbackQuery('back', async (ctx) => {
    await ctx.callbackQuery.message.editText('Выберите пункт меню: ', {
        reply_markup: menuKeyboard,
    })
    await ctx.answerCallbackQuery()
})

// oneTime() закрывает клавиатуру после нажатия
bot.command('mood', async (ctx) =>{
//    const moodKyeboard = new Keyboard().text('Хорошо').row().text('Норм').row().text('Плохо').resized()

    const moodLabels = ['Хорошо', 'Норм', 'Плохо']
    const rows = moodLabels.map((label) => {
        return [
            Keyboard.text(label)
            ]
    })
const moodKyeboard2 = Keyboard.from(rows).resized()
    await ctx.reply('Как настроение?', {
        reply_markup: moodKyeboard2
    })
})

bot.command('share', async (ctx) =>{
    const shareKeyboard = new Keyboard().requestLocation('Геолокация').requestContact('Контакт').
requestPoll('Опрос').placeholder('Выбирай давай, пожалуйста').resized()
    await ctx.reply('Чем желаешь поделиться', {
        reply_markup: shareKeyboard
    })
})

bot.command('inline_keyboard', async (ctx) =>{
    const inlineKeyboard = new InlineKeyboard().text('1', 'button-1').text('2', 'button-2').text('3', 'button-3')
    await ctx.reply('Выберите цифру', {
        reply_markup: inlineKeyboard
    })
})

// вариант ответа на inline_keyboard bot.callbackQuery(['button-1', 'button-2', 'button-3'], async (ctx) =>{
bot.callbackQuery(/button-[1-3]/, async (ctx) =>{
    await ctx.answerCallbackQuery('Good');// сообщение после загрузки
    await ctx.reply(`Вы выбрали кнопку ${ctx.callbackQuery.data}`);
});

// bot.on('callback_query:data', async (ctx) => {
//     await ctx.answerCallbackQuery('Good');// сообщение после загрузки
//     await ctx.reply(`Вы выбрали кнопку ${ctx.callbackQuery.data}`);
// })

bot.on(':contact', async (ctx) => {
    await ctx.reply('Спасибо за контакт, добавлю его в спам базу!')
})

bot.hears('Хорошо', async (ctx) =>{
    await ctx.reply('Класс', {
        reply_markup: {remove_keyboard: true} // Тоже закроет клавиатуру как получит 'Хорошо'
    })
})


bot.hears('ID', async (ctx) =>{
    await ctx.reply(`Ваш ID: ${ctx.from.id}`)
})
// Найдет в тексте
bot.hears(/пипец/, async (ctx) =>{
    await ctx.reply('Ругаемся?')
})

// Реакция на определнный текст
// bot.hears(['пинг', 'Пинг', 'Пингуеу'], async (ctx) =>{
//     await ctx.reply('понг')
// })

// Реакция на любое сообщение
// bot.on('message', async (ctx) => {
//     await ctx.reply('Надо подумать......')
// })

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError){
        console.error('Error in request: ', e.description);
    } else if (e instanceof HttpError){
        console.error('Could not contact Telegram: ', e);
    } else {
        console.error('Unknown error: ', e);
    }
})

bot.start();