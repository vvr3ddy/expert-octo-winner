const { Bot } = require("grammy");
const https = require('https');
const axios = require('axios').default;
const bot_api = process.env.BOT_API_KEY;
const coin_api = process.env.COIN_API_KEY;

const bot = new Bot(`${bot_api}`);




bot.command("start", (ctx) => ctx.reply("Welcome! Up and Running"));


bot.command("price", (ctx) => {
    const txt = ctx.message.text;
    const message = txt.split(" ");
    if (message.length < 3) {
        ctx.reply("Invalid Format!")
    } else {
        ctx.reply("Please wait... Fetching data from server...")
        const crypto = message[1]
        const currency = message[2]
        fetchPrice(crypto, currency)
            .then((res)=>{
                const rate = res.rate;
                const reply = `Current Listing for ${crypto} in ${currency} is:` + "\n"
                            +  `1 ${crypto} = ${rate} ${currency}.`;
                ctx.reply(reply);
            });
    }
});

async function fetchPrice(crypto, currency) {
    const response = await axios.get(`https://rest.coinapi.io/v1/exchangerate/${crypto}/${currency}`, {
        headers: {
            "X-Coinapi-Key": `${coin_api}`
        },
    });

    return response.data;
}


bot.start();