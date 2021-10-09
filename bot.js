const { Bot } = require("grammy");
const https = require('https');
const axios = require('axios').default;
const bot_api = process.env.BOT_API_KEY;
const coin_api = process.env.COIN_API_KEY;

const bot = new Bot(`${bot_api}`);




bot.command("start", (ctx) => ctx.reply("Welcome! Up and Running"));


bot.command("price", (ctx) => {
    const txt = ctx.message.text;
    const message = txt.toUpperCase().split(" ");

    if (message.length == 3) {
        ctx.reply("Please wait... Fetching data from server...")
        const crypto = message[1]
        const currency = message[2]
        fetchPrice(crypto, currency)
            .then((res) => {
                if (res.statusCode == 200) {
                    const rate = res.data.rate;
                    const reply = `Current Listing for ${crypto} in ${currency} is:` + "\n"
                        + `1 ${crypto} = ${rate} ${currency}.`;
                    bot.api.editMessageText(ctx.message.chat.id, ctx.message.message_id + 1, reply);
                }else {
                    bot.api.editMessageText(ctx.message.chat.id, ctx.message.message_id + 1, res);
                }
            });
    } else if (message.length == 2) {
        const crypto = message[1]
        ctx.reply("You have provided only one currency!")
        fetchPrice(crypto, "USD")
            .then((res) => {
                if (res.statusCode == 200) {
                    console.log(res.data)
                    const rate = res.data.rate;
                    const reply = `Current Listing for ${crypto} in USD is:` + "\n"
                        + `1 ${crypto} = ${rate} USD.`;
                    bot.api.editMessageText(ctx.message.chat.id, ctx.message.message_id + 1, reply);
                } else {
                    bot.api.editMessageText(ctx.message.chat.id, ctx.message.message_id + 1, res);
                }
            });
        // bot.api.editMessageText(ctx.message.chat.id, ctx.message.message_id+1, "Changed Text")
    } else if (message.length == 1) {
        console.log(message.length)
        ctx.reply("You are requesting the top 7 coins in the past 24hours.")
        coinGeckoApi()
            .then((res) => {
                let coins = res.coins;
                let topCoins = "CRYPTO in BTC";
                for (let coin of coins) {
                    topCoins = topCoins.concat("\n", coin.item.name + "\t" + Number.parseFloat(coin.item.price_btc).toPrecision(4))
                }
                bot.api.editMessageText(ctx.message.chat.id, ctx.message.message_id + 1, topCoins)
            })
    }
});

async function fetchPrice(crypto, currency) {
    try {
        const response = await axios.get(`https://rest.coinapi.io/v1/exchangerate/${crypto}/${currency}`, {
            headers: {
                "X-Coinapi-Key": `${coin_api}`
            },
        });
        return response;
    } catch (error) {
        return "INVALID CONVERSION ATTEMPT";
    }
}


async function coinGeckoApi() {
    const response = await axios.get("https://api.coingecko.com/api/v3/search/trending");
    return response.data;
}

bot.start();