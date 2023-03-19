// Require the necessary discord.js classes
const Discord = require("discord.js")
const {
  MessageEmbed,
  MessageAttachment,
  MessageButton,
  MessageActionRow,
  MessageSelectMenu,
  Permissions,
} = require("discord.js")
require("azury-perms")
const { Client, Intents } = require("discord.js")
const { red, green, blue, magenta, cyan, white, gray, black } = require("chalk")
const { execSync } = require("child_process")
let cpuStat = require("cpu-stat")
let os = require("os")
const { connect } = require("mongoose")
const discordModals = require("discord-modals")
const { Modal, TextInputComponent, showModal } = require("discord-modals")
const ms = require("ms")
const parsec = require("parsec")
const dayjs = require("dayjs")
const { drawCard, LinearGradient } = require("discord-welcome-card")
const { inviteTracker } = require("azury-invites")
const { evaluate } = require("mathjs")
const { Manager } = require("erela.js")
const Spotify = require("erela.js-spotify")
const Deezer = require("erela.js-deezer")
const FaceBook = require("erela.js-facebook")
const { readdirSync } = require("fs")
const fs = require("fs")
const { parse } = require("twemoji-parser")
const { convertTime } = require("./convert.js")
const { RankCardBuilder } = require("discord-card-canvas")
const axios = require(`axios`)
const { azury_page } = require("./button.js")
const sourcebin = require('sourcebin');

//database
const remind = require("./database/remind.js")
const giveaway = require("./database/giveaway.js")
const audit = require("./database/audit.js")
const afk = require("./database/afk.js")
const responders = require("./database/responders.js")
const sticky = require("./database/sticky.js")
const welcome = require("./database/welcome.js")
const invitelog = require("./database/invitelog.js")
const suggestion_channel = require("./database/suggestchannel.js")
const suggestion_system = require("./database/suggestion.js")
const warns = require("./database/warns.js")
const warn_action = require("./database/warn_action.js")
const rank = require("./database/rank.js")
const level = require("./database/level.js")
const rank_theme = require("./database/rank_theme.js")
const ranklog = require("./database/levelchannel.js")
const gpt = require("./database/gpt.js")
const antiBadWord = require("./database/antiBadWord.js")
//--------

//openai
const openai_key = "Bearer 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"
//--------

// Create a new client instance
const client = new Client({
    intents: [32767, Intents.FLAGS.GUILD_INVITES],
    allowedMentions: {
        parse: ["roles", "users"],
        repliedUser: false,
    },
})

module.exports = client

discordModals(client)

client.config = require("./config.json")

require(`./commands.js`) // Import the cmds to the deployment

function new_set() {
    var length = 5,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = ""
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n))
    }
    return retVal
}

function format(text, number) {
    text = text.slice(0, number)

    return text + "..."
}

function channelType(type) {
    let channelType

    if (type == "GUILD_TEXT") {
        channelType = "Text Channel"
    } else if (type == "GUILD_VOICE") {
        channelType = "Voice Channel"
    } else if (type == "GUILD_CATEGORY") {
        channelType = "Category Channel"
    } else if (type == "GUILD_NEWS") {
        channelType = "Announcement Channel"
    } else if (type == "GUILD_STORE") {
        channelType = "Store Channel"
    } else if (type == "GUILD_STAGE_VOICE") {
        channelType = "Stage Channel"
    } else {
        channelType = "Unknown Channel"
    }

    return channelType
}

async function ask(userd, guildd, prompt) {
    const response = await axios("https://api.openai.com/v1/completions", {
        data: JSON.stringify({
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 0,
            max_tokens: 3000,
        }),
        method: "POST",
        headers: {
            Authorization: openai_key,
            "Content-Type": "application/json",
        },
    }).catch(async (e) => {
        return 'OFFLINE_ERR'
    })



    const answer = response.data.choices[0].text

    const user = client.users.cache.get(userd)
    const guild = client.guilds.cache.get(guildd)
    if (user && guild) {

        const channel = client.channels.cache.get(`1071209829881872394`);

        const webhooks = await channel.fetchWebhooks();
        let webhook = webhooks.find(w => w?.name === user.username)

        if (!webhook) {
            webhook = await channel.createWebhook(user.username || 'UnknownUser', {
                avatar: user.displayAvatarURL({
                    dynamic: true
                }) || guild.iconURL({
                    format: 'png'
                })
            }).catch(r => {})
        }

        sourcebin.create([{
            content: `> ` + answer,
            language: 'text',
        }], {
            title: 'GPT Output',
            description: `Output, by ${user.tag}`,
        }).then(async haste => {

            webhook.send(`${user.tag} (${user.id}) | ${guild.name} -> Used GPT:\n\`\`\`${prompt}\`\`\`\n[Output redirect here](${haste.short ? haste.short : haste.url})`).catch(async (e) => {})
        })
    }

    return answer
}

async function dalle(userd, guildd, prompt) {
    const response = await axios("https://api.openai.com/v1/images/generations", {
        data: JSON.stringify({
            prompt: prompt,
            size: "1024x1024",
            n: 1,
        }),
        method: "POST",
        headers: {
            Authorization: openai_key,
            "Content-Type": "application/json",
        },
    }).catch(async (e) => {
        return 'OFFLINE_ERR'
    })



    const answer = response.data.data[0].url

    const user = client.users.cache.get(userd)
    const guild = client.guilds.cache.get(guildd)
    if (user && guild) {

        const channel = client.channels.cache.get(`1071209829881872394`);

        const webhooks = await channel.fetchWebhooks();
        let webhook = webhooks.find(w => w?.name === user.username)

        if (!webhook) {
            webhook = await channel.createWebhook(user.username || 'UnknownUser', {
                avatar: user.displayAvatarURL({
                    dynamic: true
                }) || guild.iconURL({
                    format: 'png'
                })
            }).catch(r => {})
        }



        webhook.send(`${user.tag} (${user.id}) | ${guild.name} -> Used DALLE:\n\`\`\`${prompt}\`\`\`\n[Output redirect here](${answer})`).catch(async (e) => {})

    }

    return answer
}

async function checkAI(text) {
    try {
        const response = await axios.post('https://api.gptzero.me/v2/predict/text', { document: text }, { headers: { 'Content-Type': 'application/json' } });
  
        const completely_generated_prob = response.data.documents[0].completely_generated_prob;
  
        if (completely_generated_prob <= 0.05) return 'Text is likely to be written entirely by a human.';
        else if (completely_generated_prob <= 0.10) return 'Text is likely to be written mostly by a human, with a small amount of AI-generated content.';
        else if (completely_generated_prob <= 0.25) return 'Text is likely to be mostly written by a human, with a moderate amount of AI-generated content.';
        else if (completely_generated_prob <= 0.45) return 'Text is likely to be a mixture of content generated by both an AI and a human, with no clear predominance of either type of content.';
        else if (completely_generated_prob <= 0.55) return 'Text is likely to be equally written by an AI and a human.';
        else if (completely_generated_prob <= 0.75) return 'Text is likely to be mostly written by an AI, with a moderate amount of human-generated content.';
        else if (completely_generated_prob <= 0.90) return 'Text is likely to be written mostly by an AI, with a small amount of human-generated content.';
        else return 'Text is likely to be written entirely by an AI.';
  
    } catch (error) {
        console.error(error);
        return 'OFFLINE_ERR';
    }
}

const colorMap = {"default":"#000000","aqua":"#1abc9c","darkaqua":"#11806a","green":"#57f287","darkgreen":"#1f8b4c","blue":"#3498db","darkblue":"#206694","purple":"#9b59b6","darkpurple":"#71368a","luminousvividpink":"#e91e63","darkvividpink":"#ad1457","gold":"#f1c40f","darkgold":"#c27c0e","orange":"#e67e22","darkorange":"#a84300","red":"#ed4245","darkred":"#992d22","grey":"#95a5a6","darkgrey":"#979c9f","darkergrey":"#7f8c8d","lightgrey":"#bcc0c0","navy":"#34495e","darknavy":"#2c3e50","yellow":"#ffff00"};
client.color = process.env.COLOR;
if (!client.color) client.color = "303135";
else if (colorMap[client.color.toLowerCase()]) client.color = colorMap[client.color];
else if (isNaN(parseInt(client.color, 16))) client.color = "303135";

const ad1 = [
    "\n\n" + client.config.emojis.mail + " Are you enjoying **Cactus**? Leave a review at <https://top.gg/bot/1063575057508618360#reviews>",
    " ", " ", " ", " ", " ", " ", " ", " ", " ", // Chance of not showing the AD
    "\n\n" + client.config.emojis.mail + " Ever wanted a discord bot of your own? Get one at discord.gg/azury today for a cheap price!",
    " ", " ", " ", " ", " ", " ", " ", " ", " ", // Chance of not showing the AD
    "\n\n" + client.config.emojis.mail + " Are you enjoying **Cactus**? Leave a review at <https://top.gg/bot/1063575057508618360#reviews>",
    "\n\n" + client.config.emojis.mail + " Are you enjoying **Cactus**? Leave a review at <https://top.gg/bot/1063575057508618360#reviews>",
    "\n\n" + client.config.emojis.mail + " Are you enjoying **Cactus**? Leave a review at <https://top.gg/bot/1063575057508618360#reviews>",
    "\n\n" + client.config.emojis.mail + " Are you enjoying **Cactus**? Vote for me at <https://top.gg/bot/1063575057508618360/vote>",
    " ", " ", " ", " ", " ", " ", " ", " ", " ", // Chance of not showing the AD
    "\n\n" + client.config.emojis.mail + " Are you enjoying **Cactus**? Vote for me at <https://top.gg/bot/1063575057508618360/vote>",
    "\n\n" + client.config.emojis.mail + " Are you enjoying **Cactus**? Vote for me at <https://top.gg/bot/1063575057508618360/vote>",
]


// When the client is ready, run this code (only once)
client.once("ready", () => {
    console.log(
        green(`[🚩BOT] → ` + magenta(`${client.user.tag}`) + ` is up & ready!`)
    )
    console.log(
        green(
            `[🚩BOT] → https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`
        )
    )

    const statustypes = client.config.status.activities

    client.user.setPresence({
        activities: [{
            name: statustypes[Math.floor(Math.random() * statustypes.length)],
            type: client.config.status.type,
        }, ],
        status: client.config.status.switch,
    })
    console.log(cyan.bold(`⭐ This code is Powered by Azury Studios`))

    setInterval(async () => {
        const statustypes = client.config.status.activities

        client.user.setPresence({
            activities: [{
                name: statustypes[Math.floor(Math.random() * statustypes.length)],
                type: client.config.status.type,
            }, ],
            status: client.config.status.switch,
        })
    }, 60000)

    

    connect(client.config.mongodb, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: false,
        })
        .then(() => {
            console.log("(!) Connected to database!")
        })
        .catch((err) => {
            console.log(err)
            console.log("(!) Failed connecting to database!")
            process.exit(1)
        })
})


var tracker = new inviteTracker(client)

client.on('guildCreate', (g) => {
    const channel = g.channels.cache.find(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(g.me).has('SEND_MESSAGES'))
    if (channel) {
        channel.send({
            content: `${client.config.emojis.timestamp2} Thank you for inviting **${client.user.username}** across your server!\n${client.config.emojis.ping} To get started by using my features type ***\`/help\`***`
        })
    }
    //console.log(`I have joined the amazing server, ${g.name}, with ${g.cache.map(g => g.memberCount).reduce((a,b)=>a+b,0)} members!`)
})

tracker.on("error", (guild, err) => {
    console.error(`Invite tracker: ` + guild?.name, err);
});

tracker.on("guildMemberAdd", async (member, inviter, invite, error) => {
    const data = await welcome.findOne({
        guild: member.guild.id
    })
    if (!data) return;


    const channel = client.guilds.cache.get(data.guild).channels.cache.get(data.channel)
    if (!channel) return;

    let time = dayjs(member.user.createdAt).unix();

    const image = await drawCard({
        theme: 'circuit',
        text: {
            title: `Welcome | ${member.guild.memberCount} members`,
            text: member.user.tag,
            subtitle: `Joined ${member.guild.name.length > 27 ? member.guild.name.substring(0, 27) + "..." : member.guild.name}`,
            color: `#bcbcbc`,
        },
        avatar: {
            image: member.user.displayAvatarURL({
                format: 'png'
            }),
            outlineWidth: 5,
            outlineColor: new LinearGradient([0, '#33f'], [1, '#f33']),
        },
        background: 'https://cdn.discordapp.com/attachments/1065022316645449728/1066571557427752980/Vcodez_1.png',
        blur: 1,
        border: true,
        rounded: true,
    });

    const row = new MessageActionRow()
        .addComponents([
            new MessageButton()
            .setLabel(`Invited by ${inviter.tag}`)
            .setStyle(`SECONDARY`)
            .setCustomId(`invite_btn`)
            .setDisabled(true)
        ])

    const perms = channel.permissionsFor(client.user);
    if (!perms.has('MANAGE_WEBHOOKS')) return channel.send({
        content: `Everyone welcome ${member.user}, created <t:${time}:D>\u2000(<t:${time}:R>)`,
        files: [image],
        components: [row]
    });

    const webhooks = await channel.fetchWebhooks();
    let webhook = webhooks.find(w => w?.owner?.id === client.user.id)

    if (!webhook) {
        webhook = await channel.createWebhook(client.user.username + `- Welcome` || 'Cactus - Welcome', {
            avatar: client.user.displayAvatarURL({
                dynamic: true
            }) || guild.iconURL({
                format: 'png'
            })
        }).catch(r => {})
    }

    if (!webhook) return channel.send({
        content: `Everyone welcome ${member.user}, created <t:${time}:D>\u2000(<t:${time}:R>)`,
        files: [image],
        components: [row]
    });

    webhook.send({
        content: `Everyone welcome ${member.user}, created <t:${time}:D>\u2000(<t:${time}:R>)`,
        files: [image],
        components: [row]
    })


});
client.on('guildMemberRemove', async function(member) {
    const data = await welcome.findOne({
        guild: member.guild.id
    })
    if (!data) return;


    const channel = client.guilds.cache.get(data.guild).channels.cache.get(data.channel)
    if (!channel) return;

    let time = dayjs(member.user.createdAt).unix();



    const perms = channel.permissionsFor(client.user);
    if (!perms.has('MANAGE_WEBHOOKS')) return channel.send({
        content: `Everyone say good bye to **${member.user.tag}**, they left the server!`
    });

    const webhooks = await channel.fetchWebhooks();
    let webhook = webhooks.find(w => w?.owner?.id === client.user.id)

    if (!webhook) {
        webhook = await channel.createWebhook(client.user.username + `- Welcome` || 'Cactus - Welcome', {
            avatar: client.user.displayAvatarURL({
                dynamic: true
            }) || guild.iconURL({
                format: 'png'
            })
        }).catch(r => {})
    }

    if (!webhook) return channel.send({
        content: `Everyone say good bye to **${member.user.tag}**, they left the server!`
    });

    webhook.send({
        content: `Everyone say good bye to **${member.user.tag}**, they left the server!`
    })

});

tracker.on("guildMemberAdd", async (member, inviter, invite, error) => {

    if (error) return;


    const data = await invitelog.findOne({
        guild: member.guild.id
    })
    if (!data) return;


    const channel = client.guilds.cache.get(data.guild).channels.cache.get(data.channel)
    if (!channel) return;




    const perms = channel.permissionsFor(client.user);
    if (!perms.has('MANAGE_WEBHOOKS')) return channel.send(`Welcome ${member.user}, invited by ${inviter.tag}, code <https://discord.gg/${invite.code}>, which has **${invite.count}** invites`);

    const webhooks = await channel.fetchWebhooks();
    let webhook = webhooks.find(w => w?.owner?.id === client.user.id)

    if (!webhook) {
        webhook = await channel.createWebhook(client.user.username + `- Invites` || 'Cactus - Invites', {
            avatar: client.user.displayAvatarURL({
                dynamic: true
            }) || guild.iconURL({
                format: 'png'
            })
        }).catch(r => {})
    }

    if (!webhook) return channel.send(`Welcome ${member.user}, invited by ${inviter.tag}, code <https://discord.gg/${invite.code}>, which has **${invite.count}** invites`);

    webhook.send({
        content: `Welcome ${member.user}, invited by ${inviter.tag}, code <https://discord.gg/${invite.code}>, which has **${invite.count}** invites`
    })

    // change welcome message when the member is bot

    if (member.user.bot) channel.send(`Welcome ${member.user}, invited by ${inviter.target}`);

});



client.on('messageCreate', async (message) => {
    // Ignore messages sent by the bot itself
    if (message.author.bot) return;
    let userXp = await rank.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    }).exec();
    let levelXp = await level.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    }).exec();

    let index = 0
    // Check if the user is on cooldown
    const now = new Date();

    /*const cooldown = await rank.findOne({ userId: message.author.id }).select('cooldown').exec();
    if (cooldown && cooldown.getTime() + ms('1m') > now.getTime()) {
      // The user is still on cooldown, so do nothing
      return;
    }*/

    // The user is not on cooldown, so give them some XP
    const xp = Math.floor(Math.random() * (25 - 15 + 1)) + 7;

    // Find the user's XP and level in the database




    // If the user doesn't have an XP record in the database, create one
    if (!userXp) {
        userXp = new rank({
            userId: message.author.id,
            guildId: message.guild.id,
            xp: xp,
            level: 0,
            rank: 0,
            cooldown: now,
        });
    } else {
        const level = userXp.level || 0
        // Update the user's XP and cooldown




        userXp.xp += xp;
        userXp.cooldown = now;
        userXp.level = level;

    }

    if (!levelXp) {
        levelXp = new level({
            userId: message.author.id,
            guildId: message.guild.id,
            rank: 0,
        });
    } else {


        level.find({
                guildId: message.guild.id
            })
            .sort({
                score: -1
            })
            .exec((err, topTen) => {

                topTen.forEach(async (xp) => {

                    index = index + 1

                    const a = await level.findOne({
                            guildId: xp.guildId,
                            userId: xp.userId
                        })
                        .sort({
                            score: -1
                        })
                        .exec()

                    a.rank = index;

                    await a.save()

                })
            })



    }

    // Calculate the XP needed until the next level up
    const xpNeeded = 5 * (userXp.level ^ 2) + (50 * userXp.level) + 100 - userXp.xp;
    const xpTotal = xpNeeded + userXp.xp;
    const xpRank = 0;

    // If the user has reached the next level, level them up and reset their XP
    if (xpNeeded <= 0) {
        userXp.level += 1;
        userXp.xp = Math.abs(xpNeeded);

        const data = await rank_theme.findOne({
            guildId: message.guild.id,
            userId: message.author.id
        })

        if (!data) {
            const canvasRank = await new RankCardBuilder({
                currentLvl: userXp.level,
                currentRank: '',
                currentXP: userXp.xp,
                requiredXP: xpTotal,
                backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069722510146420876/Widget_2.png',
                avatarImgURL: `${message.author.displayAvatarURL({format: "jpg"})}`,
                avatarBackgroundColor: '#0CA7FF',
                lvlPrefix: 'LEVEL',
                rankPrefix: '',
                nicknameText: {
                    content: message.author.username,
                    font: 'Nunito',
                    color: '#1ABC9C'
                },
                userStatus: message.member.presence?.status,
                progressBarColor: '#f48b2d',
                currentXPColor: '#1ABC9C',
                colorTextDefault: '#1ABC9C',
                requiredXPColor: '#7F8381',
            }).build();



            const data = await ranklog.findOne({
                guild: message.guild.id
            })

            // Send a message to the channel to let the user know that they gained XP
            if (!data) {
                message.reply({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    files: [{
                        attachment: canvasRank.toBuffer(),
                        name: 'rank.png'
                    }]
                }).then(async (m) => {
                    setTimeout(async () => {
                        m.delete()
                    }, 7000)
                })
            } else if (data.channel == 'default_azury2023') {
                return;
            } else {
                const channel = client.channels.cache.get(data.channel)
                if (!channel) return;
                const row = new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                        .setLabel(`View rank-card`)
                        .setEmoji(`1065412777767870514`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`viewrank_${message.author.id}`)
                    ])
                const perms = channel.permissionsFor(client.user);
                if (!perms.has('MANAGE_WEBHOOKS')) return channel.send({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    components: [row]
                });

                const webhooks = await channel.fetchWebhooks();
                let webhook = webhooks.find(w => w?.owner?.id === client.user.id)

                if (!webhook) {
                    webhook = await channel.createWebhook(client.user.username + `- Leveling` || 'Cactus - Leveling', {
                        avatar: client.user.displayAvatarURL({
                            dynamic: true
                        }) || guild.iconURL({
                            format: 'png'
                        })
                    }).catch(r => {})
                }

                if (!webhook) return channel.send({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    components: [row]
                });

                webhook.send({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    components: [row]
                })
            }
        } else if (data.theme == 'g') {
            const canvasRank = await new RankCardBuilder({
                currentLvl: userXp.level,
                currentRank: '',
                currentXP: userXp.xp,
                requiredXP: xpTotal,
                backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069722510146420876/Widget_2.png',
                avatarImgURL: `${message.author.displayAvatarURL({format: "jpg"})}`,
                avatarBackgroundColor: '#0CA7FF',
                lvlPrefix: 'LEVEL',
                rankPrefix: '',
                nicknameText: {
                    content: message.author.username,
                    font: 'Nunito',
                    color: '#1ABC9C'
                },
                userStatus: message.member.presence?.status,
                progressBarColor: '#f48b2d',
                currentXPColor: '#1ABC9C',
                colorTextDefault: '#1ABC9C',
                requiredXPColor: '#7F8381',

            }).build();



            const data = await ranklog.findOne({
                guild: message.guild.id
            })

            // Send a message to the channel to let the user know that they gained XP
            if (!data) {
                message.reply({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    files: [{
                        attachment: canvasRank.toBuffer(),
                        name: 'rank.png'
                    }]
                }).then(async (m) => {
                    setTimeout(async () => {
                        m.delete()
                    }, 7000)
                })
            } else if (data.channel == 'default_azury2023') {
                return;
            } else {
                const channel = client.channels.cache.get(data.channel)
                if (!channel) return;
                const row = new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                        .setLabel(`View rank-card`)
                        .setEmoji(`1065412777767870514`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`viewrank_${message.author.id}`)
                    ])

                const perms = channel.permissionsFor(client.user);
                if (!perms.has('MANAGE_WEBHOOKS')) return channel.send({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    components: [row]
                });

                const webhooks = await channel.fetchWebhooks();
                let webhook = webhooks.find(w => w?.owner?.id === client.user.id)

                if (!webhook) {
                    webhook = await channel.createWebhook(client.user.username + `- Leveling` || 'Cactus - Leveling', {
                        avatar: client.user.displayAvatarURL({
                            dynamic: true
                        }) || guild.iconURL({
                            format: 'png'
                        })
                    }).catch(r => {})
                }

                if (!webhook) return channel.send({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    components: [row]
                });

                webhook.send({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    components: [row]
                })
            }
        } else if (data.theme == 'b') {
            const canvasRank = await new RankCardBuilder({
                currentLvl: userXp.level,
                currentRank: '',
                currentXP: userXp.xp,
                requiredXP: xpTotal,
                backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069774336690507776/Widget_3.png',
                avatarImgURL: `${message.author.displayAvatarURL({format: "jpg"})}`,
                avatarBackgroundColor: '#FF0004',
                lvlPrefix: 'LEVEL',
                rankPrefix: '',
                nicknameText: {
                    content: message.author.username,
                    font: 'Nunito',
                    color: '#AF2426'
                },
                userStatus: message.member.presence?.status,
                progressBarColor: '#f48b2d',
                currentXPColor: '#AF2426',
                colorTextDefault: '#AF2426',
                requiredXPColor: '#7F8381',

            }).build();



            const data = await ranklog.findOne({
                guild: message.guild.id
            })

            // Send a message to the channel to let the user know that they gained XP
            if (!data) {
                message.reply({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    files: [{
                        attachment: canvasRank.toBuffer(),
                        name: 'rank.png'
                    }]
                }).then(async (m) => {
                    setTimeout(async () => {
                        m.delete()
                    }, 7000)
                })
            } else if (data.channel == 'default_azury2023') {
                return;
            } else {
                const channel = client.channels.cache.get(data.channel)
                if (!channel) return;
                const row = new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                        .setLabel(`View rank-card`)
                        .setEmoji(`1065412777767870514`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`viewrank_${message.author.id}`)
                    ])
                const perms = channel.permissionsFor(client.user);
                if (!perms.has('MANAGE_WEBHOOKS')) return channel.send({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    components: [row]
                });

                const webhooks = await channel.fetchWebhooks();
                let webhook = webhooks.find(w => w?.owner?.id === client.user.id)

                if (!webhook) {
                    webhook = await channel.createWebhook(client.user.username + `- Leveling` || 'Cactus - Leveling', {
                        avatar: client.user.displayAvatarURL({
                            dynamic: true
                        }) || guild.iconURL({
                            format: 'png'
                        })
                    }).catch(r => {})
                }

                if (!webhook) return channel.send({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    components: [row]
                });

                webhook.send({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    components: [row]
                })
            }
        } else if (data.theme == 'r') {
            const canvasRank = await new RankCardBuilder({
                currentLvl: userXp.level,
                currentRank: '',
                currentXP: userXp.xp,
                requiredXP: xpTotal,
                backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069722510146420876/Widget_2.png',
                avatarImgURL: `${message.author.displayAvatarURL({format: "jpg"})}`,
                avatarBackgroundColor: '#FF0004',
                lvlPrefix: 'LEVEL',
                rankPrefix: '',
                nicknameText: {
                    content: message.author.username,
                    font: 'Nunito',
                    color: '#AF2426'
                },
                userStatus: message.member.presence?.status,
                progressBarColor: '#f48b2d',
                currentXPColor: '#AF2426',
                colorTextDefault: '#AF2426',
                requiredXPColor: '#7F8381',

            }).build();



            const data = await ranklog.findOne({
                guild: message.guild.id
            })

            // Send a message to the channel to let the user know that they gained XP
            if (!data) {
                message.reply({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    files: [{
                        attachment: canvasRank.toBuffer(),
                        name: 'rank.png'
                    }]
                }).then(async (m) => {
                    setTimeout(async () => {
                        m.delete()
                    }, 7000)
                })
            } else if (data.channel == 'default_azury2023') {
                return;
            } else {
                const channel = client.channels.cache.get(data.channel)
                if (!channel) return;
                const row = new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                        .setLabel(`View rank-card`)
                        .setEmoji(`1065412777767870514`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`viewrank_${message.author.id}`)
                    ])
                channel.send({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    components: [row]
                })
            }
        } else if (data.theme == 'p') {
            const canvasRank = await new RankCardBuilder({
                currentLvl: userXp.level,
                currentRank: '',
                currentXP: userXp.xp,
                requiredXP: xpTotal,
                backgroundImgURL: 'https://media.discordapp.net/attachments/886652161465917520/1069798197431631962/image0.jpg',
                avatarImgURL: `${message.author.displayAvatarURL({format: "jpg"})}`,
                avatarBackgroundColor: '#D06FF9',
                lvlPrefix: 'LEVEL',
                rankPrefix: '',
                nicknameText: {
                    content: message.author.username,
                    font: 'Nunito',
                    color: '#9B59B6'
                },
                userStatus: message.member.presence?.status,
                progressBarColor: '#f48b2d',
                currentXPColor: '#9B59B6',
                colorTextDefault: '#9B59B6',
                requiredXPColor: '#7F8381',

            }).build();

            const data = await ranklog.findOne({
                guild: message.guild.id
            })

            // Send a message to the channel to let the user know that they gained XP
            if (!data) {
                message.reply({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    files: [{
                        attachment: canvasRank.toBuffer(),
                        name: 'rank.png'
                    }]
                }).then(async (m) => {
                    setTimeout(async () => {
                        m.delete()
                    }, 7000)
                })
            } else if (data.channel == 'default_azury2023') {
                return;
            } else {
                const channel = client.channels.cache.get(data.channel)
                if (!channel) return;
                const row = new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                        .setLabel(`View rank-card`)
                        .setEmoji(`1065412777767870514`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`viewrank_${message.author.id}`)
                    ])
                const perms = channel.permissionsFor(client.user);
                if (!perms.has('MANAGE_WEBHOOKS')) return channel.send({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    components: [row]
                });

                const webhooks = await channel.fetchWebhooks();
                let webhook = webhooks.find(w => w?.owner?.id === client.user.id)

                if (!webhook) {
                    webhook = await channel.createWebhook(client.user.username + `- Leveling` || 'Cactus - Leveling', {
                        avatar: client.user.displayAvatarURL({
                            dynamic: true
                        }) || guild.iconURL({
                            format: 'png'
                        })
                    }).catch(r => {})
                }

                if (!webhook) return channel.send({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    components: [row]
                });

                webhook.send({
                    content: `Congratulations, **${message.author.username}**! You gained ${xp} XP! You are now level ${userXp.level}`,
                    components: [row]
                })
            }
        }
    }

    // Save the user's XP and level to the database
    await userXp.save();


});

client.on(`messageCreate`, async (message) => {
    if (message.author.bot) return;
    const data_ch = await suggestion_channel.findOne({
        guild: message.guild.id
    })
    if (!data_ch) return;


    const channel = client.guilds.cache.get(data_ch.guild).channels.cache.get(data_ch.channel)
    if (message.channel.id !== data_ch.channel) return;
    if (!channel) return;

    if (!message.content) return message.delete()

    const row = new MessageActionRow()
        .addComponents([
            new MessageButton()
            .setStyle(`SECONDARY`)
            .setCustomId(`suggestion_up`)
            .setLabel(`0`)
            .setEmoji(`1067594157910130778`),
            new MessageButton()
            .setStyle(`SECONDARY`)
            .setCustomId(`suggestion_down`)
            .setLabel(`0`)
            .setEmoji(`1067594155947204619`),
            new MessageButton()
            .setStyle(`SECONDARY`)
            .setCustomId(`suggestion_reply`)
            .setEmoji(`1067594269969371146`)
        ])



    const embed = new MessageEmbed()
        .setAuthor(`${message.author.tag}`, `${message.author.displayAvatarURL()}`)
        .setColor(client.color)
        .addFields([

            {
                name: `User Suggestion:`,
                value: `${message.content || "Unkown Message"}`,
                inline: false
            },
            {
                name: `Suggestion Replies:`,
                value: `*Waiting for a reply...*`,
                inline: false
            },

        ])


    const perms = channel.permissionsFor(client.user);
    if (!perms.has('MANAGE_WEBHOOKS')) return channel.send({
        embeds: [embed],
        components: [row]
    }).then(async (m) => {

        message.delete()

        new suggestion_system({
            id: m.id,
            user: message.author.id,
            message: message.content || `Invalid Message`,
            up: [],
            down: []
        }).save()
    });

    const webhooks = await channel.fetchWebhooks();
    let webhook = webhooks.find(w => w?.owner?.id === client.user.id)

    if (!webhook) {
        webhook = await channel.createWebhook(client.user.username + `- Suggestion` || 'Cactus - Suggestion', {
            avatar: client.user.displayAvatarURL({
                dynamic: true
            }) || guild.iconURL({
                format: 'png'
            })
        }).catch(r => {})
    }

    if (!webhook) return channel.send({
        embeds: [embed],
        components: [row]
    }).then(async (m) => {

        message.delete()

        new suggestion_system({
            id: m.id,
            user: message.author.id,
            message: message.content || `Invalid Message`,
            up: [],
            down: []
        }).save()
    });

    webhook.send({
        embeds: [embed],
        components: [row]
    }).then(async (m) => {

        message.delete()

        new suggestion_system({
            id: m.id,
            user: message.author.id,
            message: message.content || `Invalid Message`,
            up: [],
            down: []
        }).save()
    });

})

client.on(`interactionCreate`, async (interaction) => {
    /* ↝ Interaction button handling ↜ */
    if (interaction.isButton()) {
        if (!interaction.customId.startsWith('suggestion_')) return;
        const data = await suggestion_system.findOne({
            id: interaction.message.id
        })
        if (!data) return interaction.deferUpdate()

        //if(interaction.user.id == data.user) return interaction.deferUpdate()

        if (interaction.customId == `suggestion_up`) {
            if (data.up.includes(interaction.user.id)) return interaction.reply({
                content: `${client.config.emojis.error} You have already upvoted for the suggestion of <@${data.user}>`,
                ephemeral: true
            })
            data.down = data.down.filter(i => i != interaction.user.id);
            data.up.push(interaction.user.id);
            data.save()

            const row = new MessageActionRow()
                .addComponents([
                    new MessageButton()
                    .setStyle(`SECONDARY`)
                    .setCustomId(`suggestion_up`)
                    .setLabel(`${data.up.length}`)
                    .setEmoji(`1067594157910130778`),
                    new MessageButton()
                    .setStyle(`SECONDARY`)
                    .setCustomId(`suggestion_down`)
                    .setLabel(`${data.down.length}`)
                    .setEmoji(`1067594155947204619`),
                    new MessageButton()
                    .setStyle(`SECONDARY`)
                    .setCustomId(`suggestion_reply`)
                    .setEmoji(`1067594269969371146`)
                ])

            interaction.update({
                embeds: [interaction.message.embeds[0]],
                components: [row]
            })
        } else if (interaction.customId == `suggestion_down`) {
            if (data.down.includes(interaction.user.id)) return interaction.reply({
                content: `${client.config.emojis.error} You have already downvoted for the suggestion of <@${data.user}>`,
                ephemeral: true
            })
            data.up = data.up.filter(i => i != interaction.user.id);
            data.down.push(interaction.user.id);
            data.save()

            const row = new MessageActionRow()
                .addComponents([
                    new MessageButton()
                    .setStyle(`SECONDARY`)
                    .setCustomId(`suggestion_up`)
                    .setLabel(`${data.up.length}`)
                    .setEmoji(`1067594157910130778`),
                    new MessageButton()
                    .setStyle(`SECONDARY`)
                    .setCustomId(`suggestion_down`)
                    .setLabel(`${data.down.length}`)
                    .setEmoji(`1067594155947204619`),
                    new MessageButton()
                    .setStyle(`SECONDARY`)
                    .setCustomId(`suggestion_reply`)
                    .setEmoji(`1067594269969371146`)
                ])

            interaction.update({
                embeds: [interaction.message.embeds[0]],
                components: [row]
            })
        } else if (interaction.customId == `suggestion_reply`) {

            if (!interaction.member.permissions.has(`ADMINISTRATOR`)) return interaction.reply({
                content: "" + client.config.emojis.error + " You need to have the ADMINISTRATOR to use this command!",
                ephemeral: true
            });



            const modal = new Modal()
                .setCustomId(`suggestion_reply`)
                .setTitle(`Reply to suggestion`)
                .addComponents([
                    new TextInputComponent()
                    .setCustomId(`note`)
                    .setLabel('Enter the reply note:')
                    .setMaxLength(300)
                    .setMinLength(10)
                    .setStyle('LONG') //SHORT' or 'LONG'
                    .setPlaceholder(`That will come soon! Good suggestion...`)
                    .setRequired(true),
                ]);

            showModal(modal, {
                client: client, // Client to show the Modal through the Discord API.
                interaction: interaction // Show the modal with interaction data.
            })
        }
    }
})



client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const data = await afk.findOne({
        Guild: message.guild.id,
        Member: message.author.id
    });
    if (data) {

        if (message.content.toLowerCase().includes('[afk]')) return;



        message.reply(`${message.author} You have now left AFK mode.\n*Which was started <t:${data.TimeAgo}:R>*`).then(async (m) => {
            setTimeout(async () => {
                m.delete().catch(async (e) => {})
            }, 10000)
        })

        data.delete()
    }
    if (message.mentions.members.first()) {
        const data = await afk.findOne({
            Guild: message.guild.id,
            Member: message.mentions.members.first().id
        });
        if (data) {

            const member = message.guild.members.cache.get(data.Member);

            message.reply(`Please don't mention **${member.user.tag}** they are AFK!\n> Reason: ${data.Content||`Invalid content provided`}\n> And went AFK <t:${data.TimeAgo}:R>`).then(async (m) => {
                setTimeout(async () => {
                    m.delete().catch(async (e) => {})
                }, 10000)
            })
        }
    }

})

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;


    const data = await responders.findOne({
        Guild: message.guild.id
    })
    if (!data) return;

    const datas = await responders.find({
        Guild: message.guild.id
    })

    datas.forEach(async respond => {

        if (message.content.toLowerCase() == respond.Keyword) {


            return message.channel.send({
                content: `${respond.Reply ||`Invalid reply set`}`
            })

        }




    })




})


client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const data = await antiBadWord.findOne({
        Guild: message.guild.id
    })
    if (!data) return;

    const datas = await antiBadWord.find({
        Guild: message.guild.id
    })

    datas.forEach(async bad => {

        if (message.content.toLowerCase().includes(bad.Keyword)) {


            if (bad.Action == "DELETE") {
                message.delete(100);

                return message.channel.send({
                    content: `${message.author} please do not contain any banned words in your message!`
                }).then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })
            } else if (bad.Action == "KICK") {
                message.member.kick(`(!) Cactus Anti Word Action: Kicked User (${message.author.username}) successfully!`);
                message.delete(100)
                message.channel.send({
                    content: `${message.author.username} has been kicked`
                }).then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })


                return message.channel.send({
                    content: `I have kicked ${message.author} for saying a banned word!`
                }).then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })


            } else if (bad.Action == "BAN") {
                message.member.ban({
                    reason: `(!) Cactus Anti Word Action: Banned User (${message.author.username}) successfully!`
                });
                message.delete(100)
                message.channel.send({
                    content: `${message.author.username} has been banned!`
                }).then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })


                return message.channel.send({
                    content: `I have banned ${message.author} for saying a banned word!`
                }).then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })

            } else if (bad.Action == "TIMEOUT") {


                message.delete(100)

                const user = client.guilds.cache.get(message.guild.id).members.cache.get(message.author.id)

                user.timeout(30 * 60 * 1000, `(!) Cactus Anti Word Action: TIMEOUT User (${message.author.username}) successfully!`)


                return message.channel.send({
                    content: `I have timedout ${message.author} for saying a banned word!`
                }).then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })



            } else if (bad.Action == "WARN") {


                message.delete(100)

                const user = client.guilds.cache.get(message.guild.id).members.cache.get(message.author.id)

                warns.findOne({
                    guild: message.guild.id,
                    user: message.author.id
                }, async (err, data) => {

                    if (!data) {
                        data = new warns({
                            guild: message.guild.id,
                            user: message.author.id,
                            array: [{
                                mod: client.user.id,
                                reason: `Saying a banned word (${bad.Keyword})`,
                                data: dayjs(new Date()).unix(),
                                id: new_set() + "-" + new_set()
                            }]
                        })
                    } else {
                        const object = {
                            mod: client.user.id,
                            reason: `Saying a banned word (${bad.Keyword})`,
                            data: dayjs(new Date()).unix(),
                            id: new_set() + "-" + new_set()
                        }
                        data.array.push(object)
                    }
                    data.save()




                    let embed = new MessageEmbed()
                        .setAuthor('Member warned', user.user.displayAvatarURL({
                            dynamic: true
                        }))
                        .setThumbnail(user.user.displayAvatarURL({
                            dynamic: true
                        }))
                        .setColor('RED')
                        .setDescription(`<@!${user.user.id}> **${user.user.tag}** (\`${user.user.id}\`)\n\n**Reason:**\nSaying a banned word (\`${bad.Keyword}\`)\n\nWarned by AutoMod**`)
                        .setFooter('Member Warned')
                        .setTimestamp()

                    sendAudit(message.guild, {
                        embeds: [embed]
                    })

                    user.send({
                        content: `${client.config.emojis.audit} You have been warned by AutoMod for the reason of:\n>>> Saying a banned word (\`${bad.Keyword}\`)`
                    })

                    const datas = await warn_action.findOne({
                        guild: message.guild.id
                    })

                    if (datas) {
                        const action = datas.action;
                        const number = datas.number;


                        if (action == 'none') {

                        } else if (action == 'kick') {
                            if (Object.keys(data.array).length >= number) {
                                message.channel.send({
                                    content: `${client.config.emojis.audit} ${user.user} Was kicked from the server for having too many warns\n\n***If they rejoin make sure to remove their warns otherwise, kick***`,
                                    components: [row]
                                })
                                user.send({
                                    content: `${client.config.emojis.audit} ${user.user} You were kicked from the server for having too many warns`,
                                    components: [row]
                                })
                                user.kick(`Reached max warns... server action`)
                            }
                        } else if (action == 'ban') {
                            if (Object.keys(data.array).length >= number) {
                                message.channel.send({
                                    content: `${client.config.emojis.audit} ${user.user} Was banned from the server for having too many warns\n\n***If they rejoin make sure to remove their warns otherwise, ban***`,
                                    components: [row]
                                })
                                user.send({
                                    content: `${client.config.emojis.audit} ${user.user} You were banned from the server for having too many warns`,
                                    components: [row]
                                })
                                user.ban({
                                    reason: `Reached max warns... server action`
                                })
                            }
                        }
                    }
                })


                return message.channel.send({
                    content: `I have warned ${message.author} for saying a banned word!`
                }).then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })



            }


        }

    })




})

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (newMessage.author.bot) return;

    const data = await antiBadWord.findOne({
        Guild: newMessage.guild.id
    })
    if (!data) return;

    const datas = await antiBadWord.find({
        Guild: newMessage.guild.id
    })

    datas.forEach(async bad => {

        if (newMessage.content.toLowerCase().includes(bad.Keyword)) {


            if (bad.Action == "DELETE") {
                newMessage.delete(100);

                return newMessage.channel.send({
                    content: `${message.author} please do not contain any banned words in your message!`
                }).then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })
            } else if (bad.Action == "KICK") {
                newMessage.member.kick(`(!) Cactus Anti Word Action: Kicked User (${newMessage.author.username}) successfully!`);
                newMessage.delete(100)
                newMessage.channel.send({
                    content: `${newMessage.author.username} has been kicked`
                }).then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })


                return newMessage.channel.send({
                    content: `I have kicked ${newMessage.author} for saying a banned word!`
                }).then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })


            } else if (bad.Action == "BAN") {
                newMessage.member.ban({
                    reason: `(!) Cactus Anti Word Action: Banned User (${message.author.username}) successfully!`
                });
                newMessage.delete(100)
                newMessage.channel.send({
                    content: `${newMessage.author.username} has been banned!`
                }).then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })


                return newMessage.channel.send({
                    content: `I have banned ${newMessage.author} for saying a banned word!`
                }).then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })

            } else if (bad.Action == "TIMEOUT") {


                newMessage.delete(100)

                const user = client.guilds.cache.get(newMessage.guild.id).members.cache.get(newMessage.author.id)

                user.timeout(30 * 60 * 1000, `(!) Cactus Anti Word Action: TIMEOUT User (${newMessage.author.username}) successfully!`)


                return newMessage.channel.send({
                    content: `I have timedout ${newMessage.author} for saying a banned word!`
                }).then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })



            } else if (bad.Action == "WARN") {


                newMessage.delete(100)

                const user = client.guilds.cache.get(newMessage.guild.id).members.cache.get(newMessage.author.id)

                warns.findOne({
                    guild: newMessage.guild.id,
                    user: newMessage.author.id
                }, async (err, data) => {

                    if (!data) {
                        data = new warns({
                            guild: newMessage.guild.id,
                            user: newMessage.author.id,
                            array: [{
                                mod: client.user.id,
                                reason: `Saying a banned word (${bad.Keyword})`,
                                data: dayjs(new Date()).unix(),
                                id: new_set() + "-" + new_set()
                            }]
                        })
                    } else {
                        const object = {
                            mod: client.user.id,
                            reason: `Saying a banned word (${bad.Keyword})`,
                            data: dayjs(new Date()).unix(),
                            id: new_set() + "-" + new_set()
                        }
                        data.array.push(object)
                    }
                    data.save()




                    let embed = new MessageEmbed()
                        .setAuthor('Member warned', user.user.displayAvatarURL({
                            dynamic: true
                        }))
                        .setThumbnail(user.user.displayAvatarURL({
                            dynamic: true
                        }))
                        .setColor('RED')
                        .setDescription(`<@!${user.user.id}> **${user.user.tag}** (\`${user.user.id}\`)\n\n**Reason:**\nSaying a banned word (\`${bad.Keyword}\`)\n\nWarned by **AutoMod**`)
                        .setFooter('Member Warned')
                        .setTimestamp()

                    sendAudit(newMessage.guild, {
                        embeds: [embed]
                    })

                    user.send({
                        content: `${client.config.emojis.audit} You have been warned by AutoMod for the reason of:\n>>> Saying a banned word (\`${bad.Keyword}\`)`
                    })

                    const datas = await warn_action.findOne({
                        guild: newMessage.guild.id
                    })

                    if (datas) {
                        const action = datas.action;
                        const number = datas.number;


                        if (action == 'none') {

                        } else if (action == 'kick') {
                            if (Object.keys(data.array).length >= number) {
                                newMessage.channel.send({
                                    content: `${client.config.emojis.audit} ${user.user} Was kicked from the server for having too many warns\n\n***If they rejoin make sure to remove their warns otherwise, kick***`,
                                    components: [row]
                                })
                                user.send({
                                    content: `${client.config.emojis.audit} ${user.user} You were kicked from the server for having too many warns`,
                                    components: [row]
                                })
                                user.kick(`Reached max warns... server action`)
                            }
                        } else if (action == 'ban') {
                            if (Object.keys(data.array).length >= number) {
                                newMessage.channel.send({
                                    content: `${client.config.emojis.audit} ${user.user} Was banned from the server for having too many warns\n\n***If they rejoin make sure to remove their warns otherwise, ban***`,
                                    components: [row]
                                })
                                user.send({
                                    content: `${client.config.emojis.audit} ${user.user} You were banned from the server for having too many warns`,
                                    components: [row]
                                })
                                user.ban({
                                    reason: `Reached max warns... server action`
                                })
                            }
                        }
                    }
                })


                return newMessage.channel.send({
                    content: `I have warned ${newMessage.author} for saying a banned word!`
                }).then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                })



            }


        }

    })




})


client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const data = await sticky.findOne({
        Guild: message.guild.id,
        Channel: message.channel.id
    })
    if (!data) return;

    const datas = await sticky.find({
        Guild: message.guild.id,
        Channel: message.channel.id
    })

    datas.forEach(async respond => {
        if (respond.Message) {

            client.guilds.cache.get(message.guild.id).channels.cache.get(message.channel.id).messages.fetch(respond.Message).then(async (m) => {
                m.delete()
            })

            if (!data.BtnUrl) {
                return message.channel.send({
                    content: `${respond.Content}`
                }).then(async (m) => {
                    await sticky.updateOne({
                        Guild: message.guild.id,
                        Channel: message.channel.id
                    }, {
                        Message: m.id,
                        Url: m.url
                    })
                })
            } else if (data.BtnUrl) {

                if (!data.BtnEmoji) {
                    return message.channel.send({
                        content: `${respond.Content}`,
                        components: [new MessageActionRow()
                            .addComponents([
                                new MessageButton()
                                .setLabel(`${respond.BtnLabel}`)
                                .setStyle(`LINK`)
                                .setURL(`${respond.BtnUrl}`),
                            ])
                        ]
                    }).then(async (m) => {
                        await sticky.updateOne({
                            Guild: message.guild.id,
                            Channel: message.channel.id
                        }, {
                            Message: m.id,
                            Url: m.url,
                            BtnUrl: m.BtnUrl,
                            BtnLabel: m.BtnLabel
                        })
                    })
                } else if (data.BtnEmoji) {
                    return message.channel.send({
                        content: `${respond.Content}`,
                        components: [new MessageActionRow()
                            .addComponents([
                                new MessageButton()
                                .setLabel(`${respond.BtnLabel}`)
                                .setStyle(`LINK`)
                                .setEmoji(`${respond.BtnEmoji}`)
                                .setURL(`${respond.BtnUrl}`),

                            ])
                        ]
                    }).then(async (m) => {
                        await sticky.updateOne({
                            Guild: message.guild.id,
                            Channel: message.channel.id
                        }, {
                            Message: m.id,
                            Url: m.url,
                            BtnEmoji: m.BtnEmoji,
                            BtnUrl: m.BtnUrl,
                            BtnLabel: m.BtnLabel
                        })
                    })
                }


            }

        }

    })
})

client.on('interactionCreate', async (interaction) => {
    if (interaction.isSelectMenu()) {
        if (interaction.customId.startsWith('action_')) {
            const number = interaction.customId.replace('action_', '')

            const selected = interaction.values[0];

            if (selected !== 'none') {
                interaction.update({
                    content: `I have now setup the **warn action limit** system:\n> After **${number}** warns I will **${selected}** the user`,
                    components: []
                })
            } else {
                interaction.update({
                    content: `I have now disabled the **warn action limit** system:\n> After **${number}** warns I will **do nothing**`,
                    components: []
                })
            }

            const data = await warn_action.findOne({
                guild: interaction.guild.id
            })

            if (data) await data.delete()

            if (selected == 'kick') {
                if (data) await data.delete()
                new warn_action({
                    guild: interaction.guild.id,
                    number: number,
                    action: selected,
                }).save()
            } else if (selected == 'ban') {
                if (data) await data.delete()
                new warn_action({
                    guild: interaction.guild.id,
                    number: number,
                    action: selected,
                }).save()
            } else if (selected == 'none') {
                if (data) await data.delete()
            }
        }
        if (interaction.customId == 'setup_settings') {

            const selected = interaction.values[0];

            if (selected == "setup_responders") {
                const row = new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                        .setLabel(`Add keyword`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`add_responder`),
                        new Discord.MessageButton()
                        .setLabel(`Remove keyword`)
                        .setStyle(`DANGER`)
                        .setCustomId(`remove_responder`),
                        new Discord.MessageButton()
                        .setLabel(`Edit keyword`)
                        .setStyle(`SUCCESS`)
                        .setCustomId(`edit_responder`),
                        new Discord.MessageButton()
                        .setLabel(`See all keywords`)
                        .setStyle(`PRIMARY`)
                        .setCustomId(`total_responder`),
                    ])
                interaction.reply({
                    content: `${client.config.emojis.message} Do you want to **add a keyword** to the responder system or **remove a keyword**?`,
                    components: [row],
                    ephemeral: true
                })
            }

            if (selected == "setup_anti_word") {
                const row = new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                        .setLabel(`Add anti word`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`add_antiword`),
                        new Discord.MessageButton()
                        .setLabel(`Load pre-made words`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`load_antiword`),
                        new Discord.MessageButton()
                        .setLabel(`Edit anti word`)
                        .setStyle(`SUCCESS`)
                        .setCustomId(`edit_antiword`),
                        new Discord.MessageButton()
                        .setLabel(`Disable anti word`)
                        .setStyle(`DANGER`)
                        .setCustomId(`remove_antiword`),
                        new Discord.MessageButton()
                        .setLabel(`See all anti words`)
                        .setStyle(`PRIMARY`)
                        .setCustomId(`total_antiword`),
                    ])



                const allReminders2 = await antiBadWord.findOne({
                    Guild: interaction.guild.id
                })
                if (!allReminders2) {
                    row.components[2].setDisabled(true)
                    row.components[3].setDisabled(true)
                    row.components[4].setDisabled(true)
                }

                interaction.reply({
                    content: `${client.config.emojis.message} Do you want to **add a anti word** to the system or **remove a anti word**?\n> *All changes are permenant!*`,
                    components: [row],
                    ephemeral: true
                })
            }

            if (selected == "setup_sticky") {
                const row = new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                        .setLabel(`Add sticky msg`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`add_sticky`),
                        new Discord.MessageButton()
                        .setLabel(`Edit sticky msg`)
                        .setStyle(`SUCCESS`)
                        .setCustomId(`edit_sticky`),
                        new Discord.MessageButton()
                        .setLabel(`Disable sticky msg`)
                        .setStyle(`DANGER`)
                        .setCustomId(`remove_sticky`),
                        new Discord.MessageButton()
                        .setLabel(`See all stickys`)
                        .setStyle(`PRIMARY`)
                        .setCustomId(`total_sticky`),
                    ])



                interaction.reply({
                    content: `${client.config.emojis.message} Do you want to **add a sticky message** to the system or **remove a sticky message**?\n> *When changing settings, remember to do it in the sticky message channel yuo want to take action on.*`,
                    components: [row],
                    ephemeral: true
                })
            }
            if (selected == "setup_levelchannel") {
                await interaction.deferReply({
                    ephemeral: true
                });

                const row = new MessageActionRow()
                    .addComponents([
                        new MessageSelectMenu()
                        .setCustomId(`level_channel`)
                        .setPlaceholder('...')
                        .addOptions({
                            label: 'Default',
                            description: 'This will set the level-up channel to default',
                            value: 'default',
                        }, {
                            label: 'Custom',
                            description: 'This will set the level-up channel to custom',
                            value: 'custom',
                        }, {
                            label: 'Disable',
                            description: 'This will disable the entire level-up message',
                            value: 'disable',
                        }, ),
                    ])


                interaction.editReply({
                    content: `Please press a option in which I will set the level-up message to`,
                    components: [row]
                })

            }
            if (selected == "setup_warnaction") {
                await interaction.deferReply({
                    ephemeral: true
                });
                interaction.editReply({
                    content: `Okay, please mention the warn limit.`,
                    components: []
                })
                let channel;

                const filter = m => m.author.id === interaction.user.id
                /* This is the collector being created, we put in the filter, and we also configure the time */
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                /* This is our collector function, it is active while the collector is alive */
                collector.on('collect', async (m) => {

                    m.delete().catch(async (e) => {})


                    channel = m.content;

                    if (!channel || isNaN(channel)) return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid number provided, please try again! `
                    })

                    if (channel < 1) return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid number provided, please try again! `
                    })


                    /* Simple reply if we collect a message */

                });

                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {
                        if (!channel || isNaN(channel)) return interaction.editReply({
                            content: `${client.config.emojis.error} Invalid number provided, please try again! `
                        })

                        if (channel < 1) return interaction.editReply({
                            content: `${client.config.emojis.error} Invalid number provided, please try again! `
                        })

                        /* Message sent at the end of the collection period if something was collected*/

                        const row = new MessageActionRow()
                            .addComponents([
                                new MessageSelectMenu()
                                .setCustomId(`action_${channel}`)
                                .setPlaceholder('...')
                                .addOptions({
                                    label: 'None',
                                    description: 'This action will do nothing',
                                    value: 'none',
                                }, {
                                    label: 'Kick User',
                                    description: 'This action will KICK the user from guild',
                                    value: 'kick',
                                }, {
                                    label: 'Ban User',
                                    description: 'This action will BAN the user from guild',
                                    value: 'ban',
                                }, ),
                            ])


                        interaction.editReply({
                            content: `Please press a option from the dropdown in which the bot will take action on if the user has **${channel}** warns or higher.\n> *If this system has already been used it will overwrite all other data, you can only have 1 warn action set*`,
                            components: [row]
                        })
                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });


            }
            if (selected == "setup_audit") {
                const row = new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                        .setLabel(`Setup audit`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`yes_audit`),
                        new Discord.MessageButton()
                        .setLabel(`Disable audit`)
                        .setStyle(`DANGER`)
                        .setCustomId(`disable_audit`),
                    ])
                interaction.reply({
                    content: `${client.config.emojis.audit} Do you want to setup the **audit logger** system or disable it?\n*If the system is already setup, setting it up again, will overwrite the old data*`,
                    components: [row],
                    ephemeral: true
                })
            }
            if (selected == "setup_welcome") {
                const row = new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                        .setLabel(`Setup welcome`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`yes_welcome`),
                        new Discord.MessageButton()
                        .setLabel(`Disable welcome`)
                        .setStyle(`DANGER`)
                        .setCustomId(`disable_welcome`),
                    ])
                interaction.reply({
                    content: `${client.config.emojis.audit} Do you want to setup the **welcomer** system or disable it?\n*If the system is already setup, setting it up again, will overwrite the old data*`,
                    components: [row],
                    ephemeral: true
                })
            }
            if (selected == "setup_invitelog") {
                const row = new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                        .setLabel(`Setup invitelog`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`yes_invitelog`),
                        new Discord.MessageButton()
                        .setLabel(`Disable invitelog`)
                        .setStyle(`DANGER`)
                        .setCustomId(`disable_invitelog`),
                    ])
                interaction.reply({
                    content: `${client.config.emojis.audit} Do you want to setup the **invite log** system or disable it?\n*If the system is already setup, setting it up again, will overwrite the old data*`,
                    components: [row],
                    ephemeral: true
                })
            }
            if (selected == "setup_suggestion") {
                const row = new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                        .setLabel(`Setup suggestion`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`yes_suggestion`),
                        new Discord.MessageButton()
                        .setLabel(`Disable suggestion`)
                        .setStyle(`DANGER`)
                        .setCustomId(`disable_suggestion`),
                    ])
                interaction.reply({
                    content: `${client.config.emojis.audit} Do you want to setup the **suggestion** system or disable it?\n*If the system is already setup, setting it up again, will overwrite the old data*`,
                    components: [row],
                    ephemeral: true
                })
            }

        }
        if (interaction.customId == 'server_settings') {
            const selected = interaction.values[0];
            if (selected == "end_giveaway") {
                const modal = new Modal()
                    .setCustomId(`end_gw`)
                    .setTitle(`End a giveaway`)
                    .addComponents([
                        new TextInputComponent()
                        .setCustomId(`giveaway_id`)
                        .setLabel('Giveaway ID:')
                        .setStyle('SHORT') //SHORT' or 'LONG'
                        .setPlaceholder(`Giveaway ID? That's the giveaway message ID!`)
                        .setRequired(true),
                    ]);

                showModal(modal, {
                    client: client, // Client to show the Modal through the Discord API.
                    interaction: interaction // Show the modal with interaction data.
                })
            }
            if (selected == "view_invitecode") {
                await interaction.deferReply({
                    ephemeral: true
                });
                interaction.editReply({
                    content: `Okay, please send the invite code in the chat. Example: \`vbHaIkZe\`\n> *To view someone's invites use </settings:1065377711406710835> and press the UserInvites button*`,
                    components: []
                })

                const filter = m => m.author.id === interaction.user.id
                /* This is the collector being created, we put in the filter, and we also configure the time */
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                /* This is our collector function, it is active while the collector is alive */
                collector.on('collect', async (m) => {

                    m.delete().catch(async (e) => {})


                    const channel = m.content;

                    if (!channel) return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid invite code provided, please try again! `
                    })

                    var invite = await inviteTracker.getInfo(client, channel);

                    if (!invite) return interaction.editReply({
                        content: `${client.config.emojis.error} The invite code **${channel}** was not found! Try again!`
                    })

                    /* Simple reply if we collect a message */
                    interaction.editReply({
                        content: `***Information about the invite code ${channel}***\n\n>>> Guild: ${invite.guild.name},\nInviter: ${invite?.inviter ? `${invite.inviter.tag}` : "**Server owner/vanity**" },\nLink: ${invite.url}`
                    })
                });

                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {

                        /* Message sent at the end of the collection period if something was collected*/

                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });
            }
            if (selected == "view_invite") {
                await interaction.deferReply({
                    ephemeral: true
                });
                interaction.editReply({
                    content: `Okay, please mention the user in the chat.`,
                    components: []
                })

                const filter = m => m.author.id === interaction.user.id
                /* This is the collector being created, we put in the filter, and we also configure the time */
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                /* This is our collector function, it is active while the collector is alive */
                collector.on('collect', async (m) => {

                    m.delete().catch(async (e) => {})


                    const channel = m.mentions.members.first();

                    if (!channel) return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid user provided, please try again! `
                    })

                    var invite = await inviteTracker.getMemberInvites(channel);

                    if (!invite) return interaction.editReply({
                        content: `${client.config.emojis.error} The user ${channel} does not have any invites yet!`
                    })

                    /* Simple reply if we collect a message */
                    interaction.editReply({
                        content: `${channel.user.tag} currently has **${invite.count}** invites in **${interaction.guild.name}**`
                    })
                });

                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {

                        /* Message sent at the end of the collection period if something was collected*/

                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });



            }
            if (selected == "remove_warns") {
                await interaction.deferReply({
                    ephemeral: true
                });
                interaction.editReply({
                    content: `Okay, please mention the user in the chat.`,
                    components: []
                })

                const filter = m => m.author.id === interaction.user.id
                /* This is the collector being created, we put in the filter, and we also configure the time */
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                /* This is our collector function, it is active while the collector is alive */
                collector.on('collect', async (m) => {

                    m.delete().catch(async (e) => {})


                    const channel = m.mentions.members.first();

                    if (!channel) return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid user provided, please try again! `
                    })


                    let array = []
                    const allReminders = await warns.find({
                        guild: m.guild.id,
                        user: channel.user.id
                    })

                    const allReminders2 = await warns.findOne({
                        guild: m.guild.id,
                        user: channel.user.id
                    })

                    if (!allReminders2) return interaction.editReply({
                        content: `${client.config.emojis.error} Seems like ${channel.user} has no warnings!`,
                        components: []
                    })

                    if (Object.keys(allReminders2.array).length <= 0) return interaction.editReply({
                        content: `${client.config.emojis.error} Seems like ${channel.user} has no warnings!`,
                        components: []
                    })

                    const row = new MessageActionRow()
                        .addComponents([
                            new MessageButton()
                            .setCustomId(`remove_warnss_${channel.user.id}`)
                            .setStyle(`DANGER`)
                            .setLabel(`Proceed`),
                        ])

                    interaction.editReply({
                        content: `If you wish to proceed removing the warns of ${channel.user}, then press 'Proceed' below.`,
                        components: [row]
                    })

                });

                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {

                        /* Message sent at the end of the collection period if something was collected*/

                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });
            }
            if (selected == "view_warns") {
                await interaction.deferReply({
                    ephemeral: true
                });
                interaction.editReply({
                    content: `Okay, please mention the user in the chat.`,
                    components: []
                })

                const filter = m => m.author.id === interaction.user.id
                /* This is the collector being created, we put in the filter, and we also configure the time */
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                /* This is our collector function, it is active while the collector is alive */
                collector.on('collect', async (m) => {

                    m.delete().catch(async (e) => {})


                    const channel = m.mentions.members.first();

                    if (!channel) return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid user provided, please try again! `
                    })


                    let array = []
                    const allReminders = await warns.find({
                        guild: m.guild.id,
                        user: channel.user.id
                    })

                    const allReminders2 = await warns.findOne({
                        guild: m.guild.id,
                        user: channel.user.id
                    })

                    if (!allReminders2) return interaction.editReply({
                        content: `${client.config.emojis.error} Seems like ${channel.user} has no warnings!`,
                        components: []
                    })

                    if (Object.keys(allReminders2.array).length <= 0) return interaction.editReply({
                        content: `${client.config.emojis.error} Seems like ${channel.user} has no warnings!`,
                        components: []
                    })

                    allReminders2.array.map((x, y) => {
                        array.push(`Warning with ID **${x.id}**, and it's reason is:\n> ${x.reason.length > 100 ? x.reason.substring(0, 100) + ".." : x.reason}\n> Created by ${client.users.cache.get(x.mod)}, <t:${x.data}:D>`)

                        interaction.editReply({
                            content: `***Warnings of the user ${channel.user}***\n\n${array.length > 800 ? array.substring(0, 800).join("\n\n") + "\n...and more" : array.join("\n\n")}`,
                            components: []
                        })
                    })
                });

                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {

                        /* Message sent at the end of the collection period if something was collected*/

                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });
            }
            if (selected == "total_giveaways") {
                await interaction.deferReply({
                    ephemeral: true
                });

                let array = []
                const allReminders = await giveaway.find({
                    status: "ACTIVE",
                    guild: interaction.guild.id
                })

                const allReminders2 = await giveaway.findOne({
                    status: "ACTIVE",
                    guild: interaction.guild.id
                })

                if (!allReminders2) return interaction.editReply({
                    content: `${client.config.emojis.error} Seems like this server has no active giveaways! Please create one for it to show up here!`,
                    components: []
                })

                allReminders.forEach(async reminder => {
                    array.push(`Giveaway which ends <t:${Math.floor((ms(reminder.time)) / 1000)}:R>, and can be found at:\n> ${reminder.url}\n> Prize: **${reminder.prize}**\n> Participants: **${reminder.enters||0}**`)

                    interaction.editReply({
                        content: `${array.length > 800 ? array.substring(0, 800).join("\n\n") + "\n...and more" : array.join("\n\n")}`,
                        components: []
                    })
                })

            }
            if (selected == "view_rank") {
                await interaction.deferReply({
                    ephemeral: true
                });
                interaction.editReply({
                    content: `Okay, please mention the user in the chat.`,
                    components: []
                })

                const filter = m => m.author.id === interaction.user.id
                /* This is the collector being created, we put in the filter, and we also configure the time */
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                /* This is our collector function, it is active while the collector is alive */
                collector.on('collect', async (m) => {

                    m.delete().catch(async (e) => {})


                    const channel = m.mentions.members.first();

                    if (!channel) return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid user provided, please try again! `
                    })


                    let array = []
                    const allReminders = await rank.find({
                        guildId: m.guild.id,
                        userId: channel.user.id
                    })

                    const allReminders2 = await rank.findOne({
                        guildId: m.guild.id,
                        userId: channel.user.id
                    })

                    if (!allReminders2) return interaction.editReply({
                        content: `${client.config.emojis.error} Seems like ${channel.user} has no rank yet!`,
                        components: []
                    })

                    const data = await rank_theme.findOne({
                        guildId: m.guild.id,
                        userId: channel.user.id
                    })



                    if (!data) {

                        level.find({
                                guildId: m.guild.id,
                                userId: channel.user.id
                            })
                            .exec(async (err, xpp) => {




                                // Calculate the XP needed until the next level up
                                const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                                const xpTotal = xpNeeded + allReminders2.xp;


                                const canvasRank = await new RankCardBuilder({
                                    currentLvl: allReminders2.level,
                                    currentRank: '',
                                    currentXP: allReminders2.xp,
                                    requiredXP: xpTotal,
                                    lvlPrefix: 'LEVEL',
                                    rankPrefix: '',
                                    backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069722510146420876/Widget_2.png',
                                    avatarImgURL: `${channel.user.displayAvatarURL({format: "jpg"})}`,
                                    avatarBackgroundColor: '#2ECC71',
                                    nicknameText: {
                                        content: channel.user.tag,
                                        font: 'Nunito',
                                        color: '#1ABC9C'
                                    },
                                    userStatus: channel.presence?.status || 'offline',
                                    progressBarColor: '#f48b2d',
                                    currentXPColor: '#1ABC9C',
                                    colorTextDefault: '#1ABC9C',
                                    requiredXPColor: '#7F8381',
                                }).build();




                                interaction.editReply({
                                    content: `Ranking for ${channel.user} of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                                    components: [],
                                    files: [{
                                        attachment: canvasRank.toBuffer(),
                                        name: 'rank.png'
                                    }]
                                })


                            })
                    } else if (data.theme == 'g') {
                        level.find({
                                guildId: m.guild.id,
                                userId: channel.user.id
                            })
                            .exec(async (err, xpp) => {




                                // Calculate the XP needed until the next level up
                                const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                                const xpTotal = xpNeeded + allReminders2.xp;


                                const canvasRank = await new RankCardBuilder({
                                    currentLvl: allReminders2.level,
                                    currentRank: '',
                                    currentXP: allReminders2.xp,
                                    requiredXP: xpTotal,
                                    lvlPrefix: 'LEVEL',
                                    rankPrefix: '',
                                    backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069722510146420876/Widget_2.png',
                                    avatarImgURL: `${channel.user.displayAvatarURL({format: "jpg"})}`,
                                    avatarBackgroundColor: '#2ECC71',
                                    nicknameText: {
                                        content: channel.user.tag,
                                        font: 'Nunito',
                                        color: '#1ABC9C'
                                    },
                                    userStatus: channel.presence?.status || 'offline',
                                    progressBarColor: '#f48b2d',
                                    currentXPColor: '#1ABC9C',
                                    colorTextDefault: '#1ABC9C',
                                    requiredXPColor: '#7F8381',
                                }).build();




                                interaction.editReply({
                                    content: `Ranking for ${channel.user} of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                                    components: [],
                                    files: [{
                                        attachment: canvasRank.toBuffer(),
                                        name: 'rank.png'
                                    }]
                                })


                            })
                    } else if (data.theme == 'b') {
                        level.find({
                                guildId: m.guild.id,
                                userId: channel.user.id
                            })
                            .exec(async (err, xpp) => {




                                // Calculate the XP needed until the next level up
                                const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                                const xpTotal = xpNeeded + allReminders2.xp;


                                const canvasRank = await new RankCardBuilder({
                                    currentLvl: allReminders2.level,
                                    currentRank: '',
                                    currentXP: allReminders2.xp,
                                    requiredXP: xpTotal,
                                    lvlPrefix: 'LEVEL',
                                    rankPrefix: '',
                                    backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069774336690507776/Widget_3.png',
                                    avatarImgURL: `${channel.user.displayAvatarURL({format: "jpg"})}`,
                                    avatarBackgroundColor: '#009AFF',
                                    nicknameText: {
                                        content: channel.user.tag,
                                        font: 'Nunito',
                                        color: '#2477AF'
                                    },
                                    userStatus: channel.presence?.status || 'offline',
                                    progressBarColor: '#f48b2d',
                                    currentXPColor: '#2477AF',
                                    colorTextDefault: '#2477AF',
                                    requiredXPColor: '#7F8381',
                                }).build();




                                interaction.editReply({
                                    content: `Ranking for ${channel.user} of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                                    components: [],
                                    files: [{
                                        attachment: canvasRank.toBuffer(),
                                        name: 'rank.png'
                                    }]
                                })


                            })
                    } else if (data.theme == 'r') {
                        level.find({
                                guildId: m.guild.id,
                                userId: channel.user.id
                            })
                            .exec(async (err, xpp) => {




                                // Calculate the XP needed until the next level up
                                const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                                const xpTotal = xpNeeded + allReminders2.xp;


                                const canvasRank = await new RankCardBuilder({
                                    currentLvl: allReminders2.level,
                                    currentRank: '',
                                    currentXP: allReminders2.xp,
                                    requiredXP: xpTotal,
                                    lvlPrefix: 'LEVEL',
                                    rankPrefix: '',
                                    backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069780903720656906/Widget_4.png',
                                    avatarImgURL: `${channel.user.displayAvatarURL({format: "jpg"})}`,
                                    avatarBackgroundColor: '#FF0004',
                                    nicknameText: {
                                        content: channel.user.tag,
                                        font: 'Nunito',
                                        color: '#AF2426'
                                    },
                                    userStatus: channel.presence?.status || 'offline',
                                    progressBarColor: '#f48b2d',
                                    currentXPColor: '#AF2426',
                                    colorTextDefault: '#AF2426',
                                    requiredXPColor: '#7F8381',
                                }).build();




                                interaction.editReply({
                                    content: `Ranking for ${channel.user} of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                                    components: [],
                                    files: [{
                                        attachment: canvasRank.toBuffer(),
                                        name: 'rank.png'
                                    }]
                                })


                            })
                    } else if (data.theme == 'p') {
                        level.find({
                                guildId: m.guild.id,
                                userId: channel.user.id
                            })
                            .exec(async (err, xpp) => {




                                // Calculate the XP needed until the next level up
                                const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                                const xpTotal = xpNeeded + allReminders2.xp;


                                const canvasRank = await new RankCardBuilder({
                                    currentLvl: allReminders2.level,
                                    currentRank: '',
                                    currentXP: allReminders2.xp,
                                    requiredXP: xpTotal,
                                    lvlPrefix: 'LEVEL',
                                    rankPrefix: '',
                                    backgroundImgURL: 'https://media.discordapp.net/attachments/886652161465917520/1069798197431631962/image0.jpg',
                                    avatarImgURL: `${channel.user.displayAvatarURL({format: "jpg"})}`,
                                    avatarBackgroundColor: '#D06FF9',
                                    nicknameText: {
                                        content: channel.user.tag,
                                        font: 'Nunito',
                                        color: '#9B59B6'
                                    },
                                    userStatus: channel.presence?.status || 'offline',
                                    progressBarColor: '#f48b2d',
                                    currentXPColor: '#9B59B6',
                                    colorTextDefault: '#9B59B6',
                                    requiredXPColor: '#7F8381',
                                }).build();




                                interaction.editReply({
                                    content: `Ranking for ${channel.user} of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                                    components: [],
                                    files: [{
                                        attachment: canvasRank.toBuffer(),
                                        name: 'rank.png'
                                    }]
                                })


                            })
                    }


                });

                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {

                        /* Message sent at the end of the collection period if something was collected*/

                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });



            }
        }

        if (interaction.customId == 'database_settings') {
            const selected = interaction.values[0];

            if (selected == "reminder_db") {
                await interaction.deferReply({
                    ephemeral: true
                });

                let array = []
                const allReminders = await remind.find({
                    status: "ACTIVE"
                })

                const allReminders2 = await remind.findOne({
                    status: "ACTIVE"
                })

                if (!allReminders2) return interaction.editReply({
                    content: `${client.config.emojis.error} Seems like this bot has no reminders used!`,
                    components: []
                })

                allReminders.forEach(async reminder => {
                    array.push({
                        name: `Reminder ends <t:${Math.floor((ms(reminder.time)) / 1000)}:R>`,
                        value: `>>> Owner: <@${reminder.creator}>`
                    })


                    const embed = new MessageEmbed()
                        .setTitle(`Reminders database`)
                        .setColor(`#1ABC9C`)
                        .addFields(array.length > 24 ? array.substring(0, 24) + {
                            name: `...and more`,
                            value: `can't show the rest of the array`
                        } : array)

                    interaction.editReply({
                        embeds: [embed],
                        components: []
                    })
                })
            }

            if (selected == "responder_db") {
                await interaction.deferReply({
                    ephemeral: true
                });

                let array = []
                const allReminders = await responders.find()

                const allReminders2 = await responders.findOne()

                if (!allReminders2) return interaction.editReply({
                    content: `${client.config.emojis.error} Seems like this bot has no responders set!`,
                    components: []
                })

                allReminders.forEach(async reminder => {

                    const guild = client.guilds.cache.get(reminder.Guild)

                    array.push({
                        name: `Responder for \`${guild.name||`Server name not found`}\``,
                        value: `>>> Keyword: ${reminder.Keyword||`Invalid keyword set`}`
                    })


                    const embed = new MessageEmbed()
                        .setTitle(`Responders database`)
                        .setColor(`#1ABC9C`)
                        .addFields(array.length > 24 ? array.substring(0, 24) + {
                            name: `...and more`,
                            value: `can't show the rest of the array`
                        } : array)

                    interaction.editReply({
                        embeds: [embed],
                        components: []
                    })
                })
            }

            if (selected == "sticky_db") {
                await interaction.deferReply({
                    ephemeral: true
                });

                let array = []
                const allReminders = await sticky.find()

                const allReminders2 = await sticky.findOne()

                if (!allReminders2) return interaction.editReply({
                    content: `${client.config.emojis.error} Seems like this bot has no responders set!`,
                    components: []
                })

                allReminders.forEach(async reminder => {

                    const guild = client.guilds.cache.get(reminder.Guild)

                    array.push({
                        name: `Sticky for \`${guild.name||`Server name not found`}\``,
                        value: `>>> Url: ${reminder.Url||`Invalid url set`}\nContent: ${reminder.Content||`Invalid content set`}`
                    })


                    const embed = new MessageEmbed()
                        .setTitle(`Sticky database`)
                        .setColor(`#1ABC9C`)
                        .addFields(array.length > 24 ? array.substring(0, 24) + {
                            name: `...and more`,
                            value: `can't show the rest of the array`
                        } : array)

                    interaction.editReply({
                        embeds: [embed],
                        components: []
                    })
                })
            }

            if (selected == "welcome_db") {
                await interaction.deferReply({
                    ephemeral: true
                });

                let array = []
                const allReminders = await welcome.find()

                const allReminders2 = await welcome.findOne()

                if (!allReminders2) return interaction.editReply({
                    content: `${client.config.emojis.error} Seems like this bot has no welcomes set!`,
                    components: []
                })

                allReminders.forEach(async reminder => {

                    const guild = client.guilds.cache.get(reminder.guild)

                    array.push({
                        name: `Welcome for \`${guild.name||`Server name not found`}\``,
                        value: `>>> Channel: <#${reminder.channel||`Invalid channel set`}>`
                    })


                    const embed = new MessageEmbed()
                        .setTitle(`Welcome database`)
                        .setColor(`#1ABC9C`)
                        .addFields(array.length > 24 ? array.substring(0, 24) + {
                            name: `...and more`,
                            value: `can't show the rest of the array`
                        } : array)

                    interaction.editReply({
                        embeds: [embed],
                        components: []
                    })
                })
            }

            if (selected == "audit_db") {
                await interaction.deferReply({
                    ephemeral: true
                });

                let array = []
                const allReminders = await audit.find()

                const allReminders2 = await audit.findOne()

                if (!allReminders2) return interaction.editReply({
                    content: `${client.config.emojis.error} Seems like this bot has no audits set!`,
                    components: []
                })

                allReminders.forEach(async reminder => {

                    const guild = client.guilds.cache.get(reminder.guild)

                    array.push({
                        name: `Audit for \`${guild.name||`Server name not found`}\``,
                        value: `>>> Channel: <#${reminder.channel||`Invalid channel set`}>`
                    })


                    const embed = new MessageEmbed()
                        .setTitle(`Audit database`)
                        .setColor(`#1ABC9C`)
                        .addFields(array.length > 24 ? array.substring(0, 24) + {
                            name: `...and more`,
                            value: `can't show the rest of the array`
                        } : array)

                    interaction.editReply({
                        embeds: [embed],
                        components: []
                    })
                })
            }

            if (selected == "invitelog_db") {
                await interaction.deferReply({
                    ephemeral: true
                });

                let array = []
                const allReminders = await invitelog.find()

                const allReminders2 = await invitelog.findOne()

                if (!allReminders2) return interaction.editReply({
                    content: `${client.config.emojis.error} Seems like this bot has no invitelogs set!`,
                    components: []
                })

                allReminders.forEach(async reminder => {

                    const guild = client.guilds.cache.get(reminder.guild)

                    array.push({
                        name: `Invitelog for \`${guild.name||`Server name not found`}\``,
                        value: `>>> Channel: <#${reminder.channel||`Invalid channel set`}>`
                    })


                    const embed = new MessageEmbed()
                        .setTitle(`Invitelog database`)
                        .setColor(`#1ABC9C`)
                        .addFields(array.length > 24 ? array.substring(0, 24) + {
                            name: `...and more`,
                            value: `can't show the rest of the array`
                        } : array)

                    interaction.editReply({
                        embeds: [embed],
                        components: []
                    })
                })
            }

            if (selected == "afk_db") {
                await interaction.deferReply({
                    ephemeral: true
                });

                let array = []
                const allReminders = await afk.find()

                const allReminders2 = await afk.findOne()

                if (!allReminders2) return interaction.editReply({
                    content: `${client.config.emojis.error} Seems like this bot has no afks used!`,
                    components: []
                })

                allReminders.forEach(async reminder => {

                    const guild = client.guilds.cache.get(reminder.Guild)

                    array.push({
                        name: `Afk created in \`${guild.name||`Server name not found`}\``,
                        value: `>>> Owner: <@${reminder.Member}>\nStarted: <t:${reminder.TimeAgo}:R>`
                    })


                    const embed = new MessageEmbed()
                        .setTitle(`Afk database`)
                        .setColor(`#1ABC9C`)
                        .addFields(array.length > 24 ? array.substring(0, 24) + {
                            name: `...and more`,
                            value: `can't show the rest of the array`
                        } : array)

                    interaction.editReply({
                        embeds: [embed],
                        components: []
                    })
                })
            }

            if (selected == "giveaway_db") {
                await interaction.deferReply({
                    ephemeral: true
                });

                let array = []
                const allReminders = await giveaway.find({
                    status: "ACTIVE"
                })

                const allReminders2 = await giveaway.findOne({
                    status: "ACTIVE"
                })

                if (!allReminders2) return interaction.editReply({
                    content: `${client.config.emojis.error} Seems like this bot has no giveaways set!`,
                    components: []
                })

                allReminders.forEach(async reminder => {

                    const guild = client.guilds.cache.get(reminder.guild)

                    array.push({
                        name: `Giveaway for \`${guild.name||`Server name not found`}\``,
                        value: `>>> Hoster: <@${reminder.creator}>\nChannel: <#${reminder.channel||`Invalid channel set`}>\nUrl: [here](${reminder.url||`Invalid url set`})\nPrize: ${reminder.prize||`Invalid prize set`}\nParticipants: ${reminder.enters}`
                    })


                    const embed = new MessageEmbed()
                        .setTitle(`Giveaway database`)
                        .setColor(`#1ABC9C`)
                        .addFields(array.length > 24 ? array.substring(0, 24) + {
                            name: `...and more`,
                            value: `can't show the rest of the array`
                        } : array)

                    interaction.editReply({
                        embeds: [embed],
                        components: []
                    })
                })
            }
        }

        if (interaction.customId == 'level_channel') {
            await interaction.deferReply({
                ephemeral: true
            });

            const selected = interaction.values[0];

            const data = await ranklog.findOne({
                guild: interaction.guild.id
            })

            if (selected == 'disable') {
                interaction.editReply({
                    content: `I have now disabled the **level-up** message`,
                    components: []
                })
            } else if (selected == 'default') {
                interaction.editReply({
                    content: `I have now set the **level-up** message to it's default channel`,
                    components: []
                })
            } else if (selected == 'custom') {
                interaction.editReply({
                    content: `Okay, please mention the channel in chat`,
                    components: []
                })
                const filter = m => m.author.id === interaction.user.id
                /* This is the collector being created, we put in the filter, and we also configure the time */
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                /* This is our collector function, it is active while the collector is alive */
                collector.on('collect', async (m) => {

                    m.delete().catch(async (e) => {})


                    const channel = m.mentions.channels.first();

                    if (!channel) return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid channel provided, please try again! `
                    })

                    const arrays = {
                        guild: m.guild.id,
                        channel: channel.id,
                    };


                    await (new ranklog(arrays)).save();

                    /* Simple reply if we collect a message */
                    interaction.editReply({
                        content: `${client.config.emojis.correct} Setting up the level-up channel...`
                    })
                    setTimeout(async () => {
                        interaction.editReply({
                            content: `${client.config.emojis.correct} Setup up the level-up channel in ${channel}`
                        })
                    }, 2000)

                });

                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {

                        /* Message sent at the end of the collection period if something was collected*/
                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });
            }

            if (data) await data.delete()

            if (selected == 'disable') {
                if (data) await data.delete()
                new ranklog({
                    guild: interaction.guild.id,
                    channel: `default_azury2023`,
                }).save();
            } else if (selected == 'default') {
                if (data) await data.delete()
            }
        }

        if (interaction.customId == "user_settings") {
            const selected = interaction.values[0];

            if (selected == "total_warns") {
                await interaction.deferReply({
                    ephemeral: true
                });

                let array = []
                const allReminders = await warns.find({
                    guild: interaction.guild.id,
                    user: interaction.user.id
                })

                const allReminders2 = await warns.findOne({
                    guild: interaction.guild.id,
                    user: interaction.user.id
                })

                if (!allReminders2) return interaction.editReply({
                    content: `${client.config.emojis.error} Seems like you have no warnings! Please **get warned** for it to show up here (dont actually)!`,
                    components: []
                })

                if (Object.keys(allReminders2.array).length <= 0) return interaction.editReply({
                    content: `${client.config.emojis.error} Seems like you have no warnings! Please **get warned** for it to show up here (dont actually)!`,
                    components: []
                })

                allReminders2.array.map((x, y) => {
                    array.push(`Warning with ID **${x.id}**, and it's reason is:\n> ${x.reason.length > 100 ? x.reason.substring(0, 100) + ".." : x.reason}\n> Created by ${client.users.cache.get(x.mod)}, <t:${x.data}:D>`)

                    interaction.editReply({
                        content: `${array.length > 800 ? array.substring(0, 800).join("\n\n") + "\n...and more" : array.join("\n\n")}`,
                        components: []
                    })
                })
            } else if (selected == "total_rank") {
                await interaction.deferReply({
                    ephemeral: true
                });

                let array = []

                const allReminders = await rank.find({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id
                })

                const allReminders2 = await rank.findOne({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id
                })

                if (!allReminders2) return interaction.editReply({
                    content: `${client.config.emojis.error} Seems like you have no rank! Please **chat** for it to show up here!`,
                    components: []
                })

                const data = await rank_theme.findOne({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id
                })

                if (!data) {

                    level.find({
                            guildId: interaction.guild.id,
                            userId: interaction.user.id
                        })
                        .exec(async (err, xpp) => {




                            // Calculate the XP needed until the next level up
                            const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                            const xpTotal = xpNeeded + allReminders2.xp;


                            const canvasRank = await new RankCardBuilder({
                                currentLvl: allReminders2.level,
                                currentRank: '',
                                currentXP: allReminders2.xp,
                                requiredXP: xpTotal,
                                lvlPrefix: 'LEVEL',
                                rankPrefix: '',
                                backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069722510146420876/Widget_2.png',
                                avatarImgURL: `${interaction.user.displayAvatarURL({format: "jpg"})}`,
                                avatarBackgroundColor: '#2ECC71',
                                nicknameText: {
                                    content: interaction.user.tag,
                                    font: 'Nunito',
                                    color: '#1ABC9C'
                                },
                                userStatus: interaction.member.presence?.status,
                                progressBarColor: '#f48b2d',
                                currentXPColor: '#1ABC9C',
                                colorTextDefault: '#1ABC9C',
                                requiredXPColor: '#7F8381',
                            }).build();



                            const row = new Discord.MessageActionRow()
                                .addComponents([
                                    new MessageButton()
                                    .setLabel(`Edit`)
                                    .setEmoji(`1070070491458568242`)
                                    .setStyle(`SUCCESS`)
                                    .setCustomId(`rank-edit`),
                                ])


                            interaction.editReply({
                                content: `Here is your rank of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                                components: [row],
                                files: [{
                                    attachment: canvasRank.toBuffer(),
                                    name: 'rank.png'
                                }]
                            })


                        })
                } else if (data.theme == 'g') {
                    level.find({
                            guildId: interaction.guild.id,
                            userId: interaction.user.id
                        })
                        .exec(async (err, xpp) => {




                            // Calculate the XP needed until the next level up
                            const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                            const xpTotal = xpNeeded + allReminders2.xp;


                            const canvasRank = await new RankCardBuilder({
                                currentLvl: allReminders2.level,
                                currentRank: '',
                                currentXP: allReminders2.xp,
                                requiredXP: xpTotal,
                                lvlPrefix: 'LEVEL',
                                rankPrefix: '',
                                backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069722510146420876/Widget_2.png',
                                avatarImgURL: `${interaction.user.displayAvatarURL({format: "jpg"})}`,
                                avatarBackgroundColor: '#2ECC71',
                                nicknameText: {
                                    content: interaction.user.tag,
                                    font: 'Nunito',
                                    color: '#1ABC9C'
                                },
                                userStatus: interaction.member.presence?.status,
                                progressBarColor: '#f48b2d',
                                currentXPColor: '#1ABC9C',
                                colorTextDefault: '#1ABC9C',
                                requiredXPColor: '#7F8381',
                            }).build();



                            const row = new Discord.MessageActionRow()
                                .addComponents([
                                    new MessageButton()
                                    .setLabel(`Edit`)
                                    .setEmoji(`1070070491458568242`)
                                    .setStyle(`SUCCESS`)
                                    .setCustomId(`rank-edit`),
                                ])


                            interaction.editReply({
                                content: `Here is your rank of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                                components: [row],
                                files: [{
                                    attachment: canvasRank.toBuffer(),
                                    name: 'rank.png'
                                }]
                            })


                        })
                } else if (data.theme == 'b') {
                    level.find({
                            guildId: interaction.guild.id,
                            userId: interaction.user.id
                        })
                        .exec(async (err, xpp) => {




                            // Calculate the XP needed until the next level up
                            const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                            const xpTotal = xpNeeded + allReminders2.xp;


                            const canvasRank = await new RankCardBuilder({
                                currentLvl: allReminders2.level,
                                currentRank: '',
                                currentXP: allReminders2.xp,
                                requiredXP: xpTotal,
                                lvlPrefix: 'LEVEL',
                                rankPrefix: '',
                                backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069774336690507776/Widget_3.png',
                                avatarImgURL: `${interaction.user.displayAvatarURL({format: "jpg"})}`,
                                avatarBackgroundColor: '#009AFF',
                                nicknameText: {
                                    content: interaction.user.tag,
                                    font: 'Nunito',
                                    color: '#2477AF'
                                },
                                userStatus: interaction.member.presence?.status,
                                progressBarColor: '#f48b2d',
                                currentXPColor: '#2477AF',
                                colorTextDefault: '#2477AF',
                                requiredXPColor: '#7F8381',
                            }).build();



                            const row = new Discord.MessageActionRow()
                                .addComponents([
                                    new MessageButton()
                                    .setLabel(`Edit`)
                                    .setEmoji(`1070070491458568242`)
                                    .setStyle(`SUCCESS`)
                                    .setCustomId(`rank-edit`),
                                ])


                            interaction.editReply({
                                content: `Here is your rank of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                                components: [row],
                                files: [{
                                    attachment: canvasRank.toBuffer(),
                                    name: 'rank.png'
                                }]
                            })


                        })
                } else if (data.theme == 'r') {
                    level.find({
                            guildId: interaction.guild.id,
                            userId: interaction.user.id
                        })
                        .exec(async (err, xpp) => {




                            // Calculate the XP needed until the next level up
                            const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                            const xpTotal = xpNeeded + allReminders2.xp;


                            const canvasRank = await new RankCardBuilder({
                                currentLvl: allReminders2.level,
                                currentRank: '',
                                currentXP: allReminders2.xp,
                                requiredXP: xpTotal,
                                lvlPrefix: 'LEVEL',
                                rankPrefix: '',
                                backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069780903720656906/Widget_4.png',
                                avatarImgURL: `${interaction.user.displayAvatarURL({format: "jpg"})}`,
                                avatarBackgroundColor: '#FF0004',
                                nicknameText: {
                                    content: interaction.user.tag,
                                    font: 'Nunito',
                                    color: '#AF2426'
                                },
                                userStatus: interaction.member.presence?.status,
                                progressBarColor: '#f48b2d',
                                currentXPColor: '#AF2426',
                                colorTextDefault: '#AF2426',
                                requiredXPColor: '#7F8381',
                            }).build();



                            const row = new Discord.MessageActionRow()
                                .addComponents([
                                    new MessageButton()
                                    .setLabel(`Edit`)
                                    .setEmoji(`1070070491458568242`)
                                    .setStyle(`SUCCESS`)
                                    .setCustomId(`rank-edit`),
                                ])


                            interaction.editReply({
                                content: `Here is your rank of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                                components: [row],
                                files: [{
                                    attachment: canvasRank.toBuffer(),
                                    name: 'rank.png'
                                }]
                            })


                        })
                } else if (data.theme == 'p') {
                    level.find({
                            guildId: interaction.guild.id,
                            userId: interaction.user.id
                        })
                        .exec(async (err, xpp) => {




                            // Calculate the XP needed until the next level up
                            const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                            const xpTotal = xpNeeded + allReminders2.xp;


                            const canvasRank = await new RankCardBuilder({
                                currentLvl: allReminders2.level,
                                currentRank: '',
                                currentXP: allReminders2.xp,
                                requiredXP: xpTotal,
                                lvlPrefix: 'LEVEL',
                                rankPrefix: '',
                                backgroundImgURL: 'https://media.discordapp.net/attachments/886652161465917520/1069798197431631962/image0.jpg',
                                avatarImgURL: `${interaction.user.displayAvatarURL({format: "jpg"})}`,
                                avatarBackgroundColor: '#D06FF9',
                                nicknameText: {
                                    content: interaction.user.tag,
                                    font: 'Nunito',
                                    color: '#9B59B6'
                                },
                                userStatus: interaction.member.presence?.status,
                                progressBarColor: '#f48b2d',
                                currentXPColor: '#9B59B6',
                                colorTextDefault: '#9B59B6',
                                requiredXPColor: '#7F8381',
                            }).build();



                            const row = new Discord.MessageActionRow()
                                .addComponents([
                                    new MessageButton()
                                    .setLabel(`Edit`)
                                    .setEmoji(`1070070491458568242`)
                                    .setStyle(`SUCCESS`)
                                    .setCustomId(`rank-edit`),
                                ])


                            interaction.editReply({
                                content: `Here is your rank of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                                components: [row],
                                files: [{
                                    attachment: canvasRank.toBuffer(),
                                    name: 'rank.png'
                                }]
                            })


                        })
                }

            } else if (selected == "total_reminders") {
                await interaction.deferReply({
                    ephemeral: true
                });

                let array = []
                const allReminders = await remind.find({
                    status: "ACTIVE",
                    creator: interaction.user.id
                })

                const allReminders2 = await remind.findOne({
                    status: "ACTIVE",
                    creator: interaction.user.id
                })

                if (!allReminders2) return interaction.editReply({
                    content: `${client.config.emojis.error} Seems like you have no reminders! Please create one for it to show up here!`,
                    components: []
                })

                allReminders.forEach(async reminder => {
                    array.push(`Reminder ends <t:${Math.floor((ms(reminder.time)) / 1000)}:R>, and is for:\n> ${reminder.text.length > 100 ? reminder.text.substring(0, 100) + ".." : reminder.text}`)

                    interaction.editReply({
                        content: `${array.length > 800 ? array.substring(0, 800).join("\n\n") + "\n...and more" : array.join("\n\n")}`,
                        components: []
                    })
                })
            } else if (selected == "total_invites") {
                await interaction.deferReply({
                    ephemeral: true
                });

                var invite = await inviteTracker.getMemberInvites(interaction.member);

                if (!invite) return interaction.editReply({
                    content: `${client.config.emojis.error} Looks like you haven't invited ayone in this server! Invite someone for it to show up here!`,
                    components: []
                })

                interaction.editReply({
                    content: `You currently have **${invite.count}** invites in **${interaction.guild.name}**`,
                    components: []
                })
            } else if (selected == "top_invites") {
                await interaction.deferReply({
                    ephemeral: true
                });

                var top = await inviteTracker.getTopInvites(interaction.guild);

                if (!top) return interaction.editReply({
                    content: `${client.config.emojis.error} Looks like this server has no invites yet! Invite someone to start!`,
                    components: []
                })

                const array = top.map((i, n) => `\`#${n + 1}\`- **${i.user.tag}** has **${i.count}** invites`).join("\n");

                interaction.editReply({
                    content: `***Top invites of the guild __${interaction.guild.name}__***\n\n>>> ${array.length > 800 ? array.substring(0, 800) + "\n...and more" : array}`,
                    components: []
                })
            } else if (selected == "entered_giveaways") {
                await interaction.deferReply({
                    ephemeral: true
                });

                let array = []
                const allReminders = await giveaway.find({
                    status: "ACTIVE",
                    guild: interaction.guild.id,
                    participants: interaction.user.id
                })

                const allReminders2 = await giveaway.findOne({
                    status: "ACTIVE",
                    guild: interaction.guild.id,
                    participants: interaction.user.id
                })

                if (!allReminders2) return interaction.editReply({
                    content: `${client.config.emojis.error} Seems like you have not entered any giveaways! Please enter one for it to show up here!\n> *To create a giveaway use </admin giveaway:1067562584389193830> and fill out the options*`,
                    components: []
                })

                allReminders.forEach(async reminder => {
                    array.push(`Giveaway which ends <t:${Math.floor((ms(reminder.time)) / 1000)}:R>, and can be found at:\n> ${reminder.url}\n> Prize: ${reminder.prize}`)

                    interaction.editReply({
                        content: `*Listed below are based on the server, not global data due to discord's message limit*\n${array.length > 800 ? array.substring(0, 800).join("\n\n") + "\n...and more" : array.join("\n\n")}`,
                        components: []
                    })
                })
            }

            /*-------end of user_settings-------*/
        }

    }
    if (!interaction.isCommand()) {
        if (interaction.customId.startsWith('viewrank_')) {
            await interaction.deferReply({
                ephemeral: true
            });
            const uid = interaction.customId.replace('viewrank_', '')


            const allReminders = await rank.find({
                guildId: interaction.guild.id,
                userId: uid
            })

            const allReminders2 = await rank.findOne({
                guildId: interaction.guild.id,
                userId: uid
            })

            if (!allReminders2) return interaction.editReply({
                content: `${client.config.emojis.error} Seems like <@${uid}> has no rank!`,
                components: []
            })

            const data = await rank_theme.findOne({
                guildId: interaction.guild.id,
                userId: uid
            })

            const users = client.users.cache.get(uid)
            if (!users) return interaction.editReply({
                content: `${client.config.emojis.error} Seems like <@${uid}> is nolonger in the server!`,
                components: []
            })

            if (!data) {

                level.find({
                        guildId: interaction.guild.id,
                        userId: uid
                    })
                    .exec(async (err, xpp) => {




                        // Calculate the XP needed until the next level up
                        const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                        const xpTotal = xpNeeded + allReminders2.xp;


                        const canvasRank = await new RankCardBuilder({
                            currentLvl: allReminders2.level,
                            currentRank: '',
                            currentXP: allReminders2.xp,
                            requiredXP: xpTotal,
                            lvlPrefix: 'LEVEL',
                            rankPrefix: '',
                            backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069722510146420876/Widget_2.png',
                            avatarImgURL: `${users.displayAvatarURL({format: "jpg"})}`,
                            avatarBackgroundColor: '#2ECC71',
                            nicknameText: {
                                content: users.tag,
                                font: 'Nunito',
                                color: '#1ABC9C'
                            },
                            userStatus: users.presence?.status,
                            progressBarColor: '#f48b2d',
                            currentXPColor: '#1ABC9C',
                            colorTextDefault: '#1ABC9C',
                            requiredXPColor: '#7F8381',
                        }).build();




                        interaction.editReply({
                            files: [{
                                attachment: canvasRank.toBuffer(),
                                name: 'rank.png'
                            }]
                        })


                    })
            } else if (data.theme == 'g') {
                level.find({
                        guildId: interaction.guild.id,
                        userId: uid
                    })
                    .exec(async (err, xpp) => {




                        // Calculate the XP needed until the next level up
                        const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                        const xpTotal = xpNeeded + allReminders2.xp;


                        const canvasRank = await new RankCardBuilder({
                            currentLvl: allReminders2.level,
                            currentRank: '',
                            currentXP: allReminders2.xp,
                            requiredXP: xpTotal,
                            lvlPrefix: 'LEVEL',
                            rankPrefix: '',
                            backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069722510146420876/Widget_2.png',
                            avatarImgURL: `${users.displayAvatarURL({format: "jpg"})}`,
                            avatarBackgroundColor: '#2ECC71',
                            nicknameText: {
                                content: users.tag,
                                font: 'Nunito',
                                color: '#1ABC9C'
                            },
                            userStatus: users.presence?.status,
                            progressBarColor: '#f48b2d',
                            currentXPColor: '#1ABC9C',
                            colorTextDefault: '#1ABC9C',
                            requiredXPColor: '#7F8381',
                        }).build();




                        interaction.editReply({
                            files: [{
                                attachment: canvasRank.toBuffer(),
                                name: 'rank.png'
                            }]
                        })


                    })
            } else if (data.theme == 'b') {
                level.find({
                        guildId: interaction.guild.id,
                        userId: uid
                    })
                    .exec(async (err, xpp) => {




                        // Calculate the XP needed until the next level up
                        const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                        const xpTotal = xpNeeded + allReminders2.xp;


                        const canvasRank = await new RankCardBuilder({
                            currentLvl: allReminders2.level,
                            currentRank: '',
                            currentXP: allReminders2.xp,
                            requiredXP: xpTotal,
                            lvlPrefix: 'LEVEL',
                            rankPrefix: '',
                            backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069774336690507776/Widget_3.png',
                            avatarImgURL: `${users.displayAvatarURL({format: "jpg"})}`,
                            avatarBackgroundColor: '#009AFF',
                            nicknameText: {
                                content: users.tag,
                                font: 'Nunito',
                                color: '#2477AF'
                            },
                            userStatus: users.presence?.status,
                            progressBarColor: '#f48b2d',
                            currentXPColor: '#2477AF',
                            colorTextDefault: '#2477AF',
                            requiredXPColor: '#7F8381',
                        }).build();




                        interaction.editReply({
                            files: [{
                                attachment: canvasRank.toBuffer(),
                                name: 'rank.png'
                            }]
                        })


                    })
            } else if (data.theme == 'r') {
                level.find({
                        guildId: interaction.guild.id,
                        userId: uid
                    })
                    .exec(async (err, xpp) => {




                        // Calculate the XP needed until the next level up
                        const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                        const xpTotal = xpNeeded + allReminders2.xp;


                        const canvasRank = await new RankCardBuilder({
                            currentLvl: allReminders2.level,
                            currentRank: '',
                            currentXP: allReminders2.xp,
                            requiredXP: xpTotal,
                            lvlPrefix: 'LEVEL',
                            rankPrefix: '',
                            backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069780903720656906/Widget_4.png',
                            avatarImgURL: `${users.displayAvatarURL({format: "jpg"})}`,
                            avatarBackgroundColor: '#FF0004',
                            nicknameText: {
                                content: users.tag,
                                font: 'Nunito',
                                color: '#AF2426'
                            },
                            userStatus: users.presence?.status,
                            progressBarColor: '#f48b2d',
                            currentXPColor: '#AF2426',
                            colorTextDefault: '#AF2426',
                            requiredXPColor: '#7F8381',
                        }).build();




                        interaction.editReply({
                            files: [{
                                attachment: canvasRank.toBuffer(),
                                name: 'rank.png'
                            }]
                        })


                    })
            } else if (data.theme == 'p') {
                level.find({
                        guildId: interaction.guild.id,
                        userId: uid
                    })
                    .exec(async (err, xpp) => {




                        // Calculate the XP needed until the next level up
                        const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                        const xpTotal = xpNeeded + allReminders2.xp;


                        const canvasRank = await new RankCardBuilder({
                            currentLvl: allReminders2.level,
                            currentRank: '',
                            currentXP: allReminders2.xp,
                            requiredXP: xpTotal,
                            lvlPrefix: 'LEVEL',
                            rankPrefix: '',
                            backgroundImgURL: 'https://media.discordapp.net/attachments/886652161465917520/1069798197431631962/image0.jpg',
                            avatarImgURL: `${users.displayAvatarURL({format: "jpg"})}`,
                            avatarBackgroundColor: '#D06FF9',
                            nicknameText: {
                                content: users.tag,
                                font: 'Nunito',
                                color: '#9B59B6'
                            },
                            userStatus: users.presence?.status,
                            progressBarColor: '#f48b2d',
                            currentXPColor: '#9B59B6',
                            colorTextDefault: '#9B59B6',
                            requiredXPColor: '#7F8381',
                        }).build();




                        interaction.editReply({
                            files: [{
                                attachment: canvasRank.toBuffer(),
                                name: 'rank.png'
                            }]
                        })


                    })
            }


        }
        if (interaction.customId == "total_servers") {
            await interaction.deferReply({
                ephemeral: true
            });

            let array = []
            client.guilds.cache.forEach(async (x) => {
                const owner = await x.fetchOwner().then(m => m.user).catch(() => {})
                array.push(`${x.name} - [${x.memberCount}] - ${owner}`);

                interaction.editReply({
                    content: `>>> ${array.join("\n")}`,
                    components: []
                })
            })
        }
        if (interaction.customId == "total_warns") {
            await interaction.deferReply({
                ephemeral: true
            });

            let array = []
            const allReminders = await warns.find({
                guild: interaction.guild.id,
                user: interaction.user.id
            })

            const allReminders2 = await warns.findOne({
                guild: interaction.guild.id,
                user: interaction.user.id
            })

            if (!allReminders2) return interaction.editReply({
                content: `${client.config.emojis.error} Seems like you have no warnings! Please **get warned** for it to show up here (dont actually)!`,
                components: []
            })

            if (Object.keys(allReminders2.array).length <= 0) return interaction.editReply({
                content: `${client.config.emojis.error} Seems like you have no warnings! Please **get warned** for it to show up here (dont actually)!`,
                components: []
            })

            allReminders2.array.map((x, y) => {
                array.push(`Warning with ID **${x.id}**, and it's reason is:\n> ${x.reason.length > 100 ? x.reason.substring(0, 100) + ".." : x.reason}\n> Created by ${client.users.cache.get(x.mod)}, <t:${x.data}:D>`)

                interaction.editReply({
                    content: `${array.length > 800 ? array.substring(0, 800).join("\n\n") + "\n...and more" : array.join("\n\n")}`,
                    components: []
                })
            })
        }


        if (interaction.customId == "rank-edit") {

            let array = []

            const allReminders = await rank.find({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            })

            const allReminders2 = await rank.findOne({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            })

            if (!allReminders2) return interaction.update({
                content: `${client.config.emojis.error} Seems like you have no rank! Please **chat** for it to show up here!`,
                components: []
            })

            const data = await rank_theme.findOne({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            })

            if (!data) {

                level.find({
                        guildId: interaction.guild.id,
                        userId: interaction.user.id
                    })
                    .exec(async (err, xpp) => {




                        // Calculate the XP needed until the next level up
                        const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                        const xpTotal = xpNeeded + allReminders2.xp;


                        const canvasRank = await new RankCardBuilder({
                            currentLvl: allReminders2.level,
                            currentRank: '',
                            currentXP: allReminders2.xp,
                            requiredXP: xpTotal,
                            lvlPrefix: 'LEVEL',
                            rankPrefix: '',
                            backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069722510146420876/Widget_2.png',
                            avatarImgURL: `${interaction.user.displayAvatarURL({format: "jpg"})}`,
                            avatarBackgroundColor: '#2ECC71',
                            nicknameText: {
                                content: interaction.user.tag,
                                font: 'Nunito',
                                color: '#1ABC9C'
                            },
                            userStatus: interaction.member.presence?.status,
                            progressBarColor: '#f48b2d',
                            currentXPColor: '#1ABC9C',
                            colorTextDefault: '#1ABC9C',
                            requiredXPColor: '#7F8381',
                        }).build();



                        const row = new Discord.MessageActionRow()
                            .addComponents([
                                new MessageButton()
                                .setLabel(`Save`)
                                .setEmoji(`1070070738263998575`)
                                .setDisabled(true)
                                .setStyle(`SUCCESS`)
                                .setCustomId(`rank-save_g`),
                                new MessageButton()
                                .setEmoji(`1069771502456676363`)
                                .setDisabled(true)
                                .setStyle(`PRIMARY`)
                                .setCustomId(`rank-green`),
                                new MessageButton()
                                .setEmoji(`1069781190678151198`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`rank-red`),
                                new MessageButton()
                                .setEmoji(`1069773406339338270`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`rank-blue`),
                                new MessageButton()
                                .setEmoji(`1070068596048400394`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`rank-purple`),
                            ])


                        interaction.update({
                            content: `Here is your rank of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                            components: [row]
                        })


                    })
            } else if (data.theme == 'g') {
                level.find({
                        guildId: interaction.guild.id,
                        userId: interaction.user.id
                    })
                    .exec(async (err, xpp) => {




                        // Calculate the XP needed until the next level up
                        const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                        const xpTotal = xpNeeded + allReminders2.xp;


                        const canvasRank = await new RankCardBuilder({
                            currentLvl: allReminders2.level,
                            currentRank: '',
                            currentXP: allReminders2.xp,
                            requiredXP: xpTotal,
                            lvlPrefix: 'LEVEL',
                            rankPrefix: '',
                            backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069722510146420876/Widget_2.png',
                            avatarImgURL: `${interaction.user.displayAvatarURL({format: "jpg"})}`,
                            avatarBackgroundColor: '#2ECC71',
                            nicknameText: {
                                content: interaction.user.tag,
                                font: 'Nunito',
                                color: '#1ABC9C'
                            },
                            userStatus: interaction.member.presence?.status,
                            progressBarColor: '#f48b2d',
                            currentXPColor: '#1ABC9C',
                            colorTextDefault: '#1ABC9C',
                            requiredXPColor: '#7F8381',
                        }).build();



                        const row = new Discord.MessageActionRow()
                            .addComponents([
                                new MessageButton()
                                .setLabel(`Save`)
                                .setEmoji(`1070070738263998575`)
                                .setDisabled(true)
                                .setStyle(`SUCCESS`)
                                .setCustomId(`rank-save_g`),
                                new MessageButton()
                                .setEmoji(`1069771502456676363`)
                                .setDisabled(true)
                                .setStyle(`PRIMARY`)
                                .setCustomId(`rank-green`),
                                new MessageButton()
                                .setEmoji(`1069781190678151198`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`rank-red`),
                                new MessageButton()
                                .setEmoji(`1069773406339338270`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`rank-blue`),
                                new MessageButton()
                                .setEmoji(`1070068596048400394`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`rank-purple`),
                            ])


                        interaction.update({
                            content: `Here is your rank of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                            components: [row]
                        })


                    })
            } else if (data.theme == 'b') {
                level.find({
                        guildId: interaction.guild.id,
                        userId: interaction.user.id
                    })
                    .exec(async (err, xpp) => {




                        // Calculate the XP needed until the next level up
                        const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                        const xpTotal = xpNeeded + allReminders2.xp;


                        const canvasRank = await new RankCardBuilder({
                            currentLvl: allReminders2.level,
                            currentRank: '',
                            currentXP: allReminders2.xp,
                            requiredXP: xpTotal,
                            lvlPrefix: 'LEVEL',
                            rankPrefix: '',
                            backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069774336690507776/Widget_3.png',
                            avatarImgURL: `${interaction.user.displayAvatarURL({format: "jpg"})}`,
                            avatarBackgroundColor: '#009AFF',
                            nicknameText: {
                                content: interaction.user.tag,
                                font: 'Nunito',
                                color: '#2477AF'
                            },
                            userStatus: interaction.member.presence?.status,
                            progressBarColor: '#f48b2d',
                            currentXPColor: '#2477AF',
                            colorTextDefault: '#2477AF',
                            requiredXPColor: '#7F8381',
                        }).build();



                        const row = new Discord.MessageActionRow()
                            .addComponents([
                                new MessageButton()
                                .setLabel(`Save`)
                                .setEmoji(`1070070738263998575`)
                                .setDisabled(true)
                                .setStyle(`SUCCESS`)
                                .setCustomId(`rank-save_b`),
                                new MessageButton()
                                .setEmoji(`1069771502456676363`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`rank-green`),
                                new MessageButton()
                                .setEmoji(`1069781190678151198`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`rank-red`),
                                new MessageButton()
                                .setEmoji(`1069773406339338270`)
                                .setDisabled(true)
                                .setStyle(`PRIMARY`)
                                .setCustomId(`rank-blue`),
                                new MessageButton()
                                .setEmoji(`1070068596048400394`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`rank-purple`),
                            ])


                        interaction.update({
                            content: `Here is your rank of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                            components: [row]
                        })


                    })
            } else if (data.theme == 'r') {
                level.find({
                        guildId: interaction.guild.id,
                        userId: interaction.user.id
                    })
                    .exec(async (err, xpp) => {




                        // Calculate the XP needed until the next level up
                        const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                        const xpTotal = xpNeeded + allReminders2.xp;


                        const canvasRank = await new RankCardBuilder({
                            currentLvl: allReminders2.level,
                            currentRank: '',
                            currentXP: allReminders2.xp,
                            requiredXP: xpTotal,
                            lvlPrefix: 'LEVEL',
                            rankPrefix: '',
                            backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069780903720656906/Widget_4.png',
                            avatarImgURL: `${interaction.user.displayAvatarURL({format: "jpg"})}`,
                            avatarBackgroundColor: '#FF0004',
                            nicknameText: {
                                content: interaction.user.tag,
                                font: 'Nunito',
                                color: '#AF2426'
                            },
                            userStatus: interaction.member.presence?.status,
                            progressBarColor: '#f48b2d',
                            currentXPColor: '#AF2426',
                            colorTextDefault: '#AF2426',
                            requiredXPColor: '#7F8381',
                        }).build();



                        const row = new Discord.MessageActionRow()
                            .addComponents([
                                new MessageButton()
                                .setLabel(`Save`)
                                .setEmoji(`1070070738263998575`)
                                .setDisabled(true)
                                .setStyle(`SUCCESS`)
                                .setCustomId(`rank-save_r`),
                                new MessageButton()
                                .setEmoji(`1069771502456676363`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`rank-green`),
                                new MessageButton()
                                .setEmoji(`1069781190678151198`)
                                .setDisabled(true)
                                .setStyle(`PRIMARY`)
                                .setCustomId(`rank-red`),
                                new MessageButton()
                                .setEmoji(`1069773406339338270`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`rank-blue`),
                                new MessageButton()
                                .setEmoji(`1070068596048400394`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`rank-purple`),
                            ])


                        interaction.update({
                            content: `Here is your rank of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                            components: [row]
                        })


                    })
            } else if (data.theme == 'p') {
                level.find({
                        guildId: interaction.guild.id,
                        userId: interaction.user.id
                    })
                    .exec(async (err, xpp) => {




                        // Calculate the XP needed until the next level up
                        const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                        const xpTotal = xpNeeded + allReminders2.xp;


                        const canvasRank = await new RankCardBuilder({
                            currentLvl: allReminders2.level,
                            currentRank: '',
                            currentXP: allReminders2.xp,
                            requiredXP: xpTotal,
                            lvlPrefix: 'LEVEL',
                            rankPrefix: '',
                            backgroundImgURL: 'https://media.discordapp.net/attachments/886652161465917520/1069798197431631962/image0.jpg',
                            avatarImgURL: `${interaction.user.displayAvatarURL({format: "jpg"})}`,
                            avatarBackgroundColor: '#D06FF9',
                            nicknameText: {
                                content: interaction.user.tag,
                                font: 'Nunito',
                                color: '#9B59B6'
                            },
                            userStatus: interaction.member.presence?.status,
                            progressBarColor: '#f48b2d',
                            currentXPColor: '#9B59B6',
                            colorTextDefault: '#9B59B6',
                            requiredXPColor: '#7F8381',
                        }).build();



                        const row = new Discord.MessageActionRow()
                            .addComponents([
                                new MessageButton()
                                .setLabel(`Save`)
                                .setEmoji(`1070070738263998575`)
                                .setDisabled(true)
                                .setStyle(`SUCCESS`)
                                .setCustomId(`rank-save_p`),
                                new MessageButton()
                                .setEmoji(`1069771502456676363`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`rank-green`),
                                new MessageButton()
                                .setEmoji(`1069781190678151198`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`rank-red`),
                                new MessageButton()
                                .setEmoji(`1069773406339338270`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`rank-blue`),
                                new MessageButton()
                                .setEmoji(`1070068596048400394`)
                                .setDisabled(true)
                                .setStyle(`PRIMARY`)
                                .setCustomId(`rank-purple`),
                            ])


                        interaction.update({
                            content: `Here is your rank of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                            components: [row]
                        })


                    })
            }

        }
        if (interaction.customId == "rank-green") {
            let array = []

            const allReminders = await rank.find({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            })

            const allReminders2 = await rank.findOne({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            })

            if (!allReminders2) return interaction.update({
                content: `${client.config.emojis.error} Seems like you have no rank! Please **chat** for it to show up here!`,
                components: []
            })


            level.find({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id
                })
                .exec(async (err, xpp) => {




                    // Calculate the XP needed until the next level up
                    const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                    const xpTotal = xpNeeded + allReminders2.xp;


                    const canvasRank = await new RankCardBuilder({
                        currentLvl: allReminders2.level,
                        currentRank: '',
                        currentXP: allReminders2.xp,
                        requiredXP: xpTotal,
                        lvlPrefix: 'LEVEL',
                        rankPrefix: '',
                        backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069722510146420876/Widget_2.png',
                        avatarImgURL: `${interaction.user.displayAvatarURL({format: "jpg"})}`,
                        avatarBackgroundColor: '#2ECC71',
                        nicknameText: {
                            content: interaction.user.tag,
                            font: 'Nunito',
                            color: '#1ABC9C'
                        },
                        userStatus: interaction.member.presence?.status,
                        progressBarColor: '#f48b2d',
                        currentXPColor: '#1ABC9C',
                        colorTextDefault: '#1ABC9C',
                        requiredXPColor: '#7F8381',
                    }).build();



                    const row = new Discord.MessageActionRow()
                        .addComponents([
                            new MessageButton()
                            .setLabel(`Save`)
                            .setEmoji(`1070070738263998575`)
                            .setStyle(`SUCCESS`)
                            .setCustomId(`rank-save_g`),
                            new MessageButton()
                            .setEmoji(`1069771502456676363`)
                            .setDisabled(true)
                            .setStyle(`PRIMARY`)
                            .setCustomId(`rank-green`),
                            new MessageButton()
                            .setEmoji(`1069781190678151198`)
                            .setStyle(`SECONDARY`)
                            .setCustomId(`rank-red`),
                            new MessageButton()
                            .setEmoji(`1069773406339338270`)
                            .setStyle(`SECONDARY`)
                            .setCustomId(`rank-blue`),
                            new MessageButton()
                            .setEmoji(`1070068596048400394`)
                            .setStyle(`SECONDARY`)
                            .setCustomId(`rank-purple`),
                        ])


                    interaction.update({
                        content: `Here is your rank of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                        components: [row],
                        files: [{
                            attachment: canvasRank.toBuffer(),
                            name: 'rank.png'
                        }]
                    })


                })
        }
        if (interaction.customId == "rank-blue") {
            let array = []

            const allReminders = await rank.find({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            })

            const allReminders2 = await rank.findOne({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            })

            if (!allReminders2) return interaction.update({
                content: `${client.config.emojis.error} Seems like you have no rank! Please **chat** for it to show up here!`,
                components: []
            })


            level.find({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id
                })
                .exec(async (err, xpp) => {




                    // Calculate the XP needed until the next level up
                    const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                    const xpTotal = xpNeeded + allReminders2.xp;


                    const canvasRank = await new RankCardBuilder({
                        currentLvl: allReminders2.level,
                        currentRank: '',
                        currentXP: allReminders2.xp,
                        requiredXP: xpTotal,
                        lvlPrefix: 'LEVEL',
                        rankPrefix: '',
                        backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069774336690507776/Widget_3.png',
                        avatarImgURL: `${interaction.user.displayAvatarURL({format: "jpg"})}`,
                        avatarBackgroundColor: '#009AFF',
                        nicknameText: {
                            content: interaction.user.tag,
                            font: 'Nunito',
                            color: '#2477AF'
                        },
                        userStatus: interaction.member.presence?.status,
                        progressBarColor: '#f48b2d',
                        currentXPColor: '#2477AF',
                        colorTextDefault: '#2477AF',
                        requiredXPColor: '#7F8381',
                    }).build();



                    const row = new Discord.MessageActionRow()
                        .addComponents([
                            new MessageButton()
                            .setLabel(`Save`)
                            .setEmoji(`1070070738263998575`)
                            .setStyle(`SUCCESS`)
                            .setCustomId(`rank-save_b`),
                            new MessageButton()
                            .setEmoji(`1069771502456676363`)
                            .setStyle(`SECONDARY`)
                            .setCustomId(`rank-green`),
                            new MessageButton()
                            .setEmoji(`1069781190678151198`)
                            .setStyle(`SECONDARY`)
                            .setCustomId(`rank-red`),
                            new MessageButton()
                            .setEmoji(`1069773406339338270`)
                            .setDisabled(true)
                            .setStyle(`PRIMARY`)
                            .setCustomId(`rank-blue`),
                            new MessageButton()
                            .setEmoji(`1070068596048400394`)
                            .setStyle(`SECONDARY`)
                            .setCustomId(`rank-purple`),
                        ])


                    interaction.update({
                        content: `Here is your rank of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                        components: [row],
                        files: [{
                            attachment: canvasRank.toBuffer(),
                            name: 'rank.png'
                        }]
                    })


                })
        }
        if (interaction.customId == "rank-red") {
            let array = []

            const allReminders = await rank.find({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            })

            const allReminders2 = await rank.findOne({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            })

            if (!allReminders2) return interaction.update({
                content: `${client.config.emojis.error} Seems like you have no rank! Please **chat** for it to show up here!`,
                components: []
            })


            level.find({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id
                })
                .exec(async (err, xpp) => {




                    // Calculate the XP needed until the next level up
                    const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                    const xpTotal = xpNeeded + allReminders2.xp;


                    const canvasRank = await new RankCardBuilder({
                        currentLvl: allReminders2.level,
                        currentRank: '',
                        currentXP: allReminders2.xp,
                        requiredXP: xpTotal,
                        lvlPrefix: 'LEVEL',
                        rankPrefix: '',
                        backgroundImgURL: 'https://cdn.discordapp.com/attachments/1065022316645449728/1069780903720656906/Widget_4.png',
                        avatarImgURL: `${interaction.user.displayAvatarURL({format: "jpg"})}`,
                        avatarBackgroundColor: '#FF0004',
                        nicknameText: {
                            content: interaction.user.tag,
                            font: 'Nunito',
                            color: '#AF2426'
                        },
                        userStatus: interaction.member.presence?.status,
                        progressBarColor: '#f48b2d',
                        currentXPColor: '#AF2426',
                        colorTextDefault: '#AF2426',
                        requiredXPColor: '#7F8381',
                    }).build();



                    const row = new Discord.MessageActionRow()
                        .addComponents([
                            new MessageButton()
                            .setLabel(`Save`)
                            .setEmoji(`1070070738263998575`)
                            .setStyle(`SUCCESS`)
                            .setCustomId(`rank-save_r`),
                            new MessageButton()
                            .setEmoji(`1069771502456676363`)
                            .setStyle(`SECONDARY`)
                            .setCustomId(`rank-green`),
                            new MessageButton()
                            .setEmoji(`1069781190678151198`)
                            .setDisabled(true)
                            .setStyle(`PRIMARY`)
                            .setCustomId(`rank-red`),
                            new MessageButton()
                            .setEmoji(`1069773406339338270`)
                            .setStyle(`SECONDARY`)
                            .setCustomId(`rank-blue`),
                            new MessageButton()
                            .setEmoji(`1070068596048400394`)
                            .setStyle(`SECONDARY`)
                            .setCustomId(`rank-purple`),
                        ])


                    interaction.update({
                        content: `Here is your rank of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                        components: [row],
                        files: [{
                            attachment: canvasRank.toBuffer(),
                            name: 'rank.png'
                        }]
                    })


                })
        }
        if (interaction.customId == "rank-purple") {
            let array = []

            const allReminders = await rank.find({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            })

            const allReminders2 = await rank.findOne({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            })

            if (!allReminders2) return interaction.update({
                content: `${client.config.emojis.error} Seems like you have no rank! Please **chat** for it to show up here!`,
                components: []
            })


            level.find({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id
                })
                .exec(async (err, xpp) => {




                    // Calculate the XP needed until the next level up
                    const xpNeeded = 5 * (allReminders2.level ^ 2) + (50 * allReminders2.level) + 100 - allReminders2.xp;
                    const xpTotal = xpNeeded + allReminders2.xp;


                    const canvasRank = await new RankCardBuilder({
                        currentLvl: allReminders2.level,
                        currentRank: '',
                        currentXP: allReminders2.xp,
                        requiredXP: xpTotal,
                        lvlPrefix: 'LEVEL',
                        rankPrefix: '',
                        backgroundImgURL: 'https://media.discordapp.net/attachments/886652161465917520/1069798197431631962/image0.jpg',
                        avatarImgURL: `${interaction.user.displayAvatarURL({format: "jpg"})}`,
                        avatarBackgroundColor: '#D06FF9',
                        nicknameText: {
                            content: interaction.user.tag,
                            font: 'Nunito',
                            color: '#9B59B6'
                        },
                        userStatus: interaction.member.presence?.status,
                        progressBarColor: '#f48b2d',
                        currentXPColor: '#9B59B6',
                        colorTextDefault: '#9B59B6',
                        requiredXPColor: '#7F8381',
                    }).build();



                    const row = new Discord.MessageActionRow()
                        .addComponents([
                            new MessageButton()
                            .setLabel(`Save`)
                            .setEmoji(`1070070738263998575`)
                            .setStyle(`SUCCESS`)
                            .setCustomId(`rank-save_p`),
                            new MessageButton()
                            .setEmoji(`1069771502456676363`)
                            .setStyle(`SECONDARY`)
                            .setCustomId(`rank-green`),
                            new MessageButton()
                            .setEmoji(`1069781190678151198`)
                            .setStyle(`SECONDARY`)
                            .setCustomId(`rank-red`),
                            new MessageButton()
                            .setEmoji(`1069773406339338270`)
                            .setStyle(`SECONDARY`)
                            .setCustomId(`rank-blue`),
                            new MessageButton()
                            .setEmoji(`1070068596048400394`)
                            .setDisabled(true)
                            .setStyle(`PRIMARY`)
                            .setCustomId(`rank-purple`),
                        ])


                    interaction.update({
                        content: `Here is your rank of **${allReminders2.xp} Xp** and **level ${allReminders2.level}**`,
                        components: [row],
                        files: [{
                            attachment: canvasRank.toBuffer(),
                            name: 'rank.png'
                        }]
                    })


                })
        }
        if (interaction.customId.startsWith('rank-save_')) {
            await interaction.deferReply({
                ephemeral: true
            });
            const co = interaction.customId.replace('rank-save_', '')

            if (co == 'g') {
                interaction.editReply({
                    content: `Saving your Default theme to GREEN...`
                })

                const data = await rank_theme.findOne({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id
                })

                if (data) await data.delete()

                new rank_theme({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id,
                    theme: co
                }).save()

                interaction.editReply({
                    content: `Saved the ranking card theme to GREEN!`
                })
            } else if (co == 'b') {
                interaction.editReply({
                    content: `Saving your Default theme to BLUE...`
                })

                const data = await rank_theme.findOne({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id
                })

                if (data) await data.delete()

                new rank_theme({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id,
                    theme: co
                }).save()

                interaction.editReply({
                    content: `Saved the ranking card theme to BLUE!`
                })
            }
            if (co == 'r') {
                interaction.editReply({
                    content: `Saving your Default theme to RED...`
                })

                const data = await rank_theme.findOne({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id
                })

                if (data) await data.delete()

                new rank_theme({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id,
                    theme: co
                }).save()

                interaction.editReply({
                    content: `Saved the ranking card theme to RED!`
                })
            }
            if (co == 'p') {
                interaction.editReply({
                    content: `Saving your Default theme to PURPLE...`
                })

                const data = await rank_theme.findOne({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id
                })

                if (data) await data.delete()

                new rank_theme({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id,
                    theme: co
                }).save()

                interaction.editReply({
                    content: `Saved the ranking card theme to PURPLE!`
                })
            }
        }


        if (interaction.customId == "reset_prompts") {
            await interaction.deferReply({
                ephemeral: true
            });
            interaction.editReply({
                content: `Okay, please mention the user in the chat.`,
                components: []
            })

            const filter = m => m.author.id === interaction.user.id
            /* This is the collector being created, we put in the filter, and we also configure the time */
            const collector = interaction.channel.createMessageCollector({
                filter,
                time: 15000,
                max: 1
            });

            /* This is our collector function, it is active while the collector is alive */
            collector.on('collect', async (m) => {

                m.delete().catch(async (e) => {})


                const channel = m.mentions.members.first();

                if (!channel) return interaction.editReply({
                    content: `${client.config.emojis.error} Invalid user provided, please try again! `
                })


                let array = []
                const allReminders = await gpt.find({
                    userId: channel.user.id,
                    type: 'GPT'
                })

                const allReminders2 = await gpt.findOne({
                    userId: channel.user.id,
                    type: 'GPT'
                })

                if (!allReminders2) return interaction.editReply({
                    content: `${client.config.emojis.error} Seems like ${channel.user} has used no prompts!`,
                    components: []
                })


                allReminders2.delete().then(async () => {

                    interaction.editReply({
                        content: `I have reset the GPT-Prompts of ${channel.user} to **13** again!`,
                        components: []
                    })
                })

            });

            /* This is triggered on death of the collector */
            collector.on('end', collected => {
                if (collected.size > 0) {

                    /* Message sent at the end of the collection period if something was collected*/

                } else {
                    /* Message sent if nothing was collected */
                    interaction.editReply({
                        content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                    });
                }
            });



        }
        if (interaction.customId == "reset_prompts_d") {
            await interaction.deferReply({
                ephemeral: true
            });
            interaction.editReply({
                content: `Okay, please mention the user in the chat.`,
                components: []
            })

            const filter = m => m.author.id === interaction.user.id
            /* This is the collector being created, we put in the filter, and we also configure the time */
            const collector = interaction.channel.createMessageCollector({
                filter,
                time: 15000,
                max: 1
            });

            /* This is our collector function, it is active while the collector is alive */
            collector.on('collect', async (m) => {

                m.delete().catch(async (e) => {})


                const channel = m.mentions.members.first();

                if (!channel) return interaction.editReply({
                    content: `${client.config.emojis.error} Invalid user provided, please try again! `
                })


                let array = []
                const allReminders = await gpt.find({
                    userId: channel.user.id,
                    type: 'DALLE'
                })

                const allReminders2 = await gpt.findOne({
                    userId: channel.user.id,
                    type: 'DALLE'
                })

                if (!allReminders2) return interaction.editReply({
                    content: `${client.config.emojis.error} Seems like ${channel.user} has used no prompts!`,
                    components: []
                })


                allReminders2.delete().then(async () => {

                    interaction.editReply({
                        content: `I have reset the DALLE-Prompts of ${channel.user} to **13** again!`,
                        components: []
                    })
                })

            });

            /* This is triggered on death of the collector */
            collector.on('end', collected => {
                if (collected.size > 0) {

                    /* Message sent at the end of the collection period if something was collected*/

                } else {
                    /* Message sent if nothing was collected */
                    interaction.editReply({
                        content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                    });
                }
            });



        }
        if (interaction.customId == 'load_antiword') {
            const row = new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setLabel(`Load pre-made`)
                    .setStyle(`SECONDARY`)
                    .setCustomId(`load_antiword_premade`),
                    new Discord.MessageButton()
                    .setLabel(`Remove pre-made`)
                    .setStyle(`DANGER`)
                    .setCustomId(`remove_antiword_premade`),
                ])


            interaction.reply({
                content: `${client.config.emojis.message} Do you want to **load pre-made antiwords** to the system or **remove the pre-made ones**?`,
                components: [row],
                ephemeral: true
            })
        }
        if (interaction.customId == 'load_antiword_premade') {
            await interaction.deferReply({
                ephemeral: true
            });

            let length = 0;
            let length1 = 0;

            const words = require(`./bannedwords.json`).words

            interaction.editReply(`I am loading a list of basic slur words...`)

            words.forEach(async (keyword) => {

                length += 1;

                const data = await antiBadWord.findOne({
                    Guild: interaction.guild.id,
                    Keyword: keyword.toLowerCase()
                })
                if (data) return console.log(`duplicate found`);

                length1 += 1;

                await (new antiBadWord({
                    Guild: interaction.guild.id,
                    Action: `WARN`,
                    Keyword: keyword.toLowerCase()
                })).save();

                if (words.length == length) return interaction.editReply(`I have loaded all the basic lists of slur words (**${length1}/${words.length}**), from my json file!`)
            })
        }
        if (interaction.customId == 'remove_antiword_premade') {
            await interaction.deferReply({
                ephemeral: true
            });

            let length = 0;
            let length1 = 0;

            const words = require(`./bannedwords.json`).words

            interaction.editReply(`I am removing a list of basic slur words...`)

            words.forEach(async (keyword) => {

                length += 1;

                const data = await antiBadWord.findOne({
                    Guild: interaction.guild.id,
                    Keyword: keyword.toLowerCase()
                })
                if (!data) return;

                length1 += 1;

                data.delete()

                if (words.length == length) return interaction.editReply(`I have removed all the basic lists of slur words (**${length1}/${words.length}**), from my json file!`)
            })
        }

        if (interaction.customId.startsWith(`remove_warnss`)) {
            const gid = interaction.customId.replace('remove_warnss', '');


            const modal = new Modal()
                .setCustomId(`remove_warns_${gid}`)
                .setTitle(`Remove a warning `)
                .addComponents([
                    new TextInputComponent()
                    .setCustomId(`warning_id`)
                    .setLabel('Warning ID:')
                    .setStyle('SHORT') //SHORT' or 'LONG'
                    .setPlaceholder(`Warning ID? In settings use View warns, server settings to get the ID!`)
                    .setRequired(true),
                ]);

            showModal(modal, {
                client: client, // Client to show the Modal through the Discord API.
                interaction: interaction // Show the modal with interaction data.
            })


        }




        if (interaction.customId.startsWith('msg_')) {
            const timestamp = interaction.customId.replace('msg_', ' ')
            const modal = new Modal()
                .setCustomId(`msg_${timestamp}`)
                .setTitle(`Send timestamp as message`)
                .addComponents([
                    new TextInputComponent()
                    .setCustomId(`timestamp_msg`)
                    .setLabel('Message to be used')
                    .setStyle('LONG') //SHORT' or 'LONG'
                    .setPlaceholder(`To include the timestamp, use {timestamp} instead of ${timestamp}`)
                    .setRequired(true),
                ]);

            showModal(modal, {
                client: client, // Client to show the Modal through the Discord API.
                interaction: interaction // Show the modal with interaction data.
            })
        }



        if (interaction.customId == "disable_suggestion") {
            await interaction.deferReply({
                ephemeral: true
            });
            const data = await suggestion_channel.findOne({
                guild: interaction.guild.id
            })
            if (!data) return interaction.editReply({
                content: `${client.config.emojis.error} Sorry but there is no data to disable. Try setting up the system first!\n> *To setup the suggestion system use </settings:1065377711406710835> and press the Setup Suggestion button*`,
                components: []
            })


            data.delete()
            return interaction.editReply({
                content: `${client.config.emojis.correct} I have disabled the **suggestion** system.`,
                components: []
            })
        }

        if (interaction.customId == "yes_suggestion") {
            await interaction.deferReply({
                ephemeral: true
            });
            interaction.editReply({
                content: `Okay, please mention the channel in the chat.`,
                components: []
            })
            const data = await suggestion_channel.findOne({
                guild: interaction.guild.id
            })

            if (!data) {
                const filter = m => m.author.id === interaction.user.id
                /* This is the collector being created, we put in the filter, and we also configure the time */
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                /* This is our collector function, it is active while the collector is alive */
                collector.on('collect', async (m) => {

                    m.delete().catch(async (e) => {})


                    const channel = m.mentions.channels.first();

                    if (!channel) return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid channel provided, please try again! `
                    })

                    const arrays = {
                        guild: m.guild.id,
                        channel: channel.id,
                    };


                    await (new suggestion_channel(arrays)).save();

                    /* Simple reply if we collect a message */
                    interaction.editReply({
                        content: `${client.config.emojis.correct} Setting up the suggestion channel...`
                    })



                    channel.send({
                        content: `This channel has now been set as the suggestion channel. Type here to suggest something!`
                    })
                });

                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {

                        /* Message sent at the end of the collection period if something was collected*/

                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });

            } else {
                const filter = m => m.author.id === interaction.user.id
                /* This is the collector being created, we put in the filter, and we also configure the time */
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                /* This is our collector function, it is active while the collector is alive */
                collector.on('collect', async (m) => {

                    m.delete().catch(async (e) => {})


                    const channel = m.mentions.channels.first();

                    if (!channel) return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid channel provided, please try again! `
                    })

                    if (!channel || channel.type !== "GUILD_TEXT") return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid channel provided, please try again! `
                    })


                    await suggestion_channel.updateOne({
                        guild: m.guild.id
                    }, {
                        guild: m.guild.id,
                        channel: m.channel.id,
                    })

                    /* Simple reply if we collect a message */
                    interaction.editReply({
                        content: `${client.config.emojis.correct} Setting up the suggestion channel...\n*Overwriting previous data...*`
                    })

                    channel.send({
                        content: `This channel has now been set as the suggestion channel. Type here to suggest something!`
                    })
                });

                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {

                        /* Message sent at the end of the collection period if something was collected*/

                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });

            }

        }


        if (interaction.customId == "disable_invitelog") {
            await interaction.deferReply({
                ephemeral: true
            });
            const data = await invitelog.findOne({
                guild: interaction.guild.id
            })
            if (!data) return interaction.editReply({
                content: `${client.config.emojis.error} Sorry but there is no data to disable. Try setting up the system first!\n> *To setup the invitelog system use </settings:1065377711406710835> and press the Setup Invitelog button*`,
                components: []
            })


            data.delete()
            return interaction.editReply({
                content: `${client.config.emojis.correct} I have disabled the **invite log** system.`,
                components: []
            })
        }

        if (interaction.customId == "yes_invitelog") {
            await interaction.deferReply({
                ephemeral: true
            });
            interaction.editReply({
                content: `Okay, please mention the channel in the chat.`,
                components: []
            })
            const data = await invitelog.findOne({
                guild: interaction.guild.id
            })

            if (!data) {
                const filter = m => m.author.id === interaction.user.id
                /* This is the collector being created, we put in the filter, and we also configure the time */
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                /* This is our collector function, it is active while the collector is alive */
                collector.on('collect', async (m) => {

                    m.delete().catch(async (e) => {})


                    const channel = m.mentions.channels.first();

                    if (!channel) return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid channel provided, please try again! `
                    })

                    const arrays = {
                        guild: m.guild.id,
                        channel: channel.id,
                        status: "ACTIVE",
                    };


                    await (new invitelog(arrays)).save();

                    /* Simple reply if we collect a message */
                    interaction.editReply({
                        content: `${client.config.emojis.correct} Setting up the invite log...`
                    })



                    channel.send({
                        content: `Welcome **@example**, invited by <@!${interaction.user.id}>, code {code}, which has {count} invites`
                    })
                });

                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {

                        /* Message sent at the end of the collection period if something was collected*/
                        interaction.editReply({
                            content: `${client.config.emojis.correct} I have now setup the Welcomer`
                        });
                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });

            } else {
                const filter = m => m.author.id === interaction.user.id
                /* This is the collector being created, we put in the filter, and we also configure the time */
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                /* This is our collector function, it is active while the collector is alive */
                collector.on('collect', async (m) => {

                    m.delete().catch(async (e) => {})


                    const channel = m.mentions.channels.first();

                    if (!channel) return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid channel provided, please try again! `
                    })

                    if (!channel || channel.type !== "GUILD_TEXT") return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid channel provided, please try again! `
                    })


                    await invitelog.updateOne({
                        guild: m.guild.id
                    }, {
                        guild: m.guild.id,
                        channel: m.channel.id,
                        status: "ACTIVE",
                    })

                    /* Simple reply if we collect a message */
                    interaction.editReply({
                        content: `${client.config.emojis.correct} Setting up the invite log...\n*Overwriting previous data...*`
                    })

                    channel.send({
                        content: `Welcome **@example**, invited by <@!${interaction.user.id}>, code {code}, which has {count} invites`
                    })
                });

                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {

                        /* Message sent at the end of the collection period if something was collected*/

                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });

            }

        }



        if (interaction.customId == "disable_welcome") {
            await interaction.deferReply({
                ephemeral: true
            });
            const data = await welcome.findOne({
                guild: interaction.guild.id
            })
            if (!data) return interaction.editReply({
                content: `${client.config.emojis.error} Sorry but there is no data to disable. Try setting up the system first!\n> *To setup the welcome system use </settings:1065377711406710835> and press the Setup Welcome button*`,
                components: []
            })


            data.delete()
            return interaction.editReply({
                content: `${client.config.emojis.correct} I have disabled the **welcomer** system.`,
                components: []
            })
        }

        if (interaction.customId == "idban") {
            const modal = new Modal()
                .setCustomId(`idban`)
                .setTitle(`ID Ban Someone`)
                .addComponents([
                    new TextInputComponent()
                    .setCustomId(`id`)
                    .setLabel("Enter the user ID")
                    .setMaxLength(20)
                    .setMinLength(7)
                    .setStyle("LONG") //SHORT' or 'LONG'
                    .setPlaceholder(`693553429380857978`)
                    .setRequired(true),
                ])

            showModal(modal, {
                client: client, // Client to show the Modal through the Discord API.
                interaction: interaction, // Show the modal with interaction data.
            })
        }

        if (interaction.customId == "yes_welcome") {
            await interaction.deferReply({
                ephemeral: true
            });
            interaction.editReply({
                content: `Okay, please mention the channel in the chat.`,
                components: []
            })
            const data = await welcome.findOne({
                guild: interaction.guild.id
            })

            if (!data) {
                const filter = m => m.author.id === interaction.user.id
                /* This is the collector being created, we put in the filter, and we also configure the time */
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                /* This is our collector function, it is active while the collector is alive */
                collector.on('collect', async (m) => {

                    m.delete().catch(async (e) => {})


                    const channel = m.mentions.channels.first();

                    if (!channel) return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid channel provided, please try again! `
                    })

                    const arrays = {
                        guild: m.guild.id,
                        channel: channel.id,
                        status: "ACTIVE",
                    };


                    await (new welcome(arrays)).save();

                    /* Simple reply if we collect a message */
                    interaction.editReply({
                        content: `${client.config.emojis.correct} Setting up the welcomer...`
                    })

                    const image = await drawCard({
                        theme: 'circuit',
                        text: {
                            title: `Welcome | ${m.guild.memberCount} members`,
                            text: `Example#0000`,
                            subtitle: `Joined ${m.guild.name.length > 27 ? m.guild.name.substring(0, 27) + "..." : m.guild.name}`,
                            color: `#bcbcbc`,
                        },
                        avatar: {
                            image: interaction.user.displayAvatarURL({
                                format: 'png'
                            }),
                            outlineWidth: 5,
                            outlineColor: new LinearGradient([0, '#33f'], [1, '#f33']),
                        },
                        background: 'https://cdn.discordapp.com/attachments/1066051663942664232/1066499347849695262/oGxper.png',
                        blur: 1,
                        border: true,
                        rounded: true,
                    });

                    channel.send({
                        content: `Everyone welcome **@example**, this is an example welcome!`,
                        files: [image]
                    })
                });

                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {

                        /* Message sent at the end of the collection period if something was collected*/

                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });

            } else {
                const filter = m => m.author.id === interaction.user.id
                /* This is the collector being created, we put in the filter, and we also configure the time */
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                /* This is our collector function, it is active while the collector is alive */
                collector.on('collect', async (m) => {

                    m.delete().catch(async (e) => {})


                    const channel = m.mentions.channels.first();

                    if (!channel) return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid channel provided, please try again! `
                    })

                    if (!channel || channel.type !== "GUILD_TEXT") return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid channel provided, please try again! `
                    })


                    await welcome.updateOne({
                        guild: m.guild.id
                    }, {
                        guild: m.guild.id,
                        channel: m.channel.id,
                        status: "ACTIVE",
                    })

                    /* Simple reply if we collect a message */
                    interaction.editReply({
                        content: `${client.config.emojis.correct} Setting up the welcomer...\n*Overwriting previous data...*`
                    })

                    const image = await drawCard({
                        theme: 'circuit',
                        text: {
                            title: `Welcome | ${m.guild.memberCount} members`,
                            text: `Example#0000`,
                            subtitle: `Joined ${m.guild.name.length > 27 ? m.guild.name.substring(0, 27) + "..." : m.guild.name}`,
                            color: `#bcbcbc`,
                        },
                        avatar: {
                            image: interaction.user.displayAvatarURL({
                                format: 'png'
                            }),
                            outlineWidth: 5,
                            outlineColor: new LinearGradient([0, '#33f'], [1, '#f33']),
                        },
                        background: 'https://cdn.discordapp.com/attachments/1066051663942664232/1066499347849695262/oGxper.png',
                        blur: 1,
                        border: true,
                        rounded: true,
                    });

                    channel.send({
                        content: `Everyone welcome **@example**, this is an example welcome!`,
                        files: [image]
                    })
                });

                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {

                        /* Message sent at the end of the collection period if something was collected*/

                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });

            }

        }



        if (interaction.customId == "disable_audit") {
            await interaction.deferReply({
                ephemeral: true
            });
            const data = await audit.findOne({
                guild: interaction.guild.id
            })
            if (!data) return interaction.editReply({
                content: `${client.config.emojis.error} Sorry but there is no data to disable. Try setting up the system first!\n> *To setup the audit system use </settings:1065377711406710835> and press the Setup Audit button*`,
                components: []
            })

            client.channels.cache.get(data.channel).send({
                content: `${client.config.emojis.audit} The audit logger system has been disabled by **${interaction.user.tag}**`
            })

            data.delete()
            return interaction.editReply({
                content: `${client.config.emojis.correct} I have disabled the **audit logger** system.`,
                components: []
            })
        }

        if (interaction.customId == "yes_audit") {
            await interaction.deferReply({
                ephemeral: true
            });
            interaction.editReply({
                content: `Okay, please mention the channel in the chat.`,
                components: []
            })
            const data = await audit.findOne({
                guild: interaction.guild.id
            })

            if (!data) {
                const filter = m => m.author.id === interaction.user.id
                /* This is the collector being created, we put in the filter, and we also configure the time */
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                /* This is our collector function, it is active while the collector is alive */
                collector.on('collect', async (m) => {

                    m.delete().catch(async (e) => {})


                    const channel = m.mentions.channels.first();

                    if (!channel) return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid channel provided, please try again! `
                    })

                    const arrays = {
                        guild: m.guild.id,
                        channel: channel.id,
                        status: "ACTIVE",
                    };


                    await (new audit(arrays)).save();

                    /* Simple reply if we collect a message */
                    interaction.editReply({
                        content: `${client.config.emojis.correct} Setting up the audit logger...`
                    })
                });

                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {

                        /* Message sent at the end of the collection period if something was collected*/

                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });

            } else {
                const filter = m => m.author.id === interaction.user.id
                /* This is the collector being created, we put in the filter, and we also configure the time */
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                /* This is our collector function, it is active while the collector is alive */
                collector.on('collect', async (m) => {

                    m.delete().catch(async (e) => {})


                    const channel = m.mentions.channels.first();

                    if (!channel) return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid channel provided, please try again! `
                    })

                    if (!channel || channel.type !== "GUILD_TEXT") return interaction.editReply({
                        content: `${client.config.emojis.error} Invalid channel provided, please try again! `
                    })


                    await audit.updateOne({
                        guild: m.guild.id
                    }, {
                        guild: m.guild.id,
                        channel: m.channel.id,
                        status: "ACTIVE",
                    })

                    /* Simple reply if we collect a message */
                    interaction.editReply({
                        content: `${client.config.emojis.correct} Setting up the audit logger...\n*Overwriting previous data...*`
                    })
                });

                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {

                        /* Message sent at the end of the collection period if something was collected*/

                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });

            }

        }




        if (interaction.customId == "total_sticky") {
            await interaction.deferReply({
                ephemeral: true
            });

            let array = []
            const allReminders = await sticky.find({
                Guild: interaction.guild.id
            })

            const allReminders2 = await sticky.findOne({
                Guild: interaction.guild.id
            })

            if (!allReminders2) return interaction.editReply({
                content: `${client.config.emojis.error} Seems like this server has no sticky messages. Add one for it to show up here!\n> *To setup the sticky system use </settings:1065377711406710835> and press the Setup Sticky Msg button*`,
                components: []
            })

            allReminders.forEach(async reminder => {
                array.push(`Sticky message which can be found at:\n> ${reminder.Url}`)

                interaction.editReply({
                    content: `${array.length > 800 ? array.substring(0, 800).join("\n\n") + "\n...and more" : array.join("\n\n")}`,
                    components: []
                })
            })
        }

        if (interaction.customId == "add_sticky") {
            const modal = new Modal()
                .setCustomId(`add_sticky`)
                .setTitle(`Add a sticky msg`)
                .addComponents([
                    new TextInputComponent()
                    .setCustomId(`message`)
                    .setLabel('Sticky Message')
                    .setStyle('LONG') //SHORT' or 'LONG'
                    .setPlaceholder(`Insert the message to be shown in the sticky.`)
                    .setRequired(true),
                    new TextInputComponent()
                    .setCustomId(`btnHttp`)
                    .setLabel('Html button')
                    .setStyle('LONG') //SHORT' or 'LONG'
                    .setPlaceholder(`Example: https://discord.gg/azury (Include https:// in the url)`)
                    .setRequired(false),
                    new TextInputComponent()
                    .setCustomId(`btnLabel`)
                    .setLabel('The name of the button')
                    .setStyle('LONG') //SHORT' or 'LONG'
                    .setPlaceholder(`Example: Epic URL`)
                    .setRequired(false),
                    new TextInputComponent()
                    .setCustomId(`btnEmoji`)
                    .setLabel('The Button Emoji')
                    .setStyle('LONG') //SHORT' or 'LONG'
                    .setPlaceholder(`<:ghost:1063227719929823322>`)
                    .setRequired(false),
                ]);

            showModal(modal, {
                client: client, // Client to show the Modal through the Discord API.
                interaction: interaction // Show the modal with interaction data.
            })

        }

        if (interaction.customId == "edit_sticky") {
            const data = await sticky.findOne({
                Guild: interaction.guild.id,
                Channel: interaction.channel.id
            })
            if (!data) return interaction.reply({
                content: `${client.config.emojis.error} There is no sticky to edit... Please make one before editing\n> *To setup the sticky system use </settings:1065377711406710835> and press the Setup Sticky Msg button*`,
                ephemeral: true
            })
            const modal = new Modal()
                .setCustomId(`edit_sticky`)
                .setTitle(`Edit your current sticky`)
                .addComponents([
                    new TextInputComponent()
                    .setCustomId(`message`)
                    .setLabel('Sticky Message')
                    .setStyle('LONG') //SHORT' or 'LONG'
                    .setPlaceholder(`${data.Content.length > 90 ? data.Content.substring(0, 90) + "..." : data.Content}`)
                    .setRequired(true),
                    new TextInputComponent()
                    .setCustomId(`btnHttp`)
                    .setLabel('Html button')
                    .setStyle('LONG') //SHORT' or 'LONG'
                    .setPlaceholder(`${data.BtnUrl || "Example: https://discord.gg/azury (Include https:// in the url)"}`)
                    .setRequired(false),
                    new TextInputComponent()
                    .setCustomId(`btnLabel`)
                    .setLabel('The name of the button')
                    .setStyle('LONG') //SHORT' or 'LONG'
                    .setPlaceholder(`${data.BtnLabel || "Example: Epic URL"}`)
                    .setRequired(false),
                    new TextInputComponent()
                    .setCustomId(`btnEmoji`)
                    .setLabel('The Button Emoji')
                    .setStyle('LONG') //SHORT' or 'LONG'
                    .setPlaceholder(`${data.BtnEmoji || "<:ghost:1063227719929823322>"}`)
                    .setRequired(false),
                ]);

            showModal(modal, {
                client: client, // Client to show the Modal through the Discord API.
                interaction: interaction // Show the modal with interaction data.
            })

        }

        if (interaction.customId == "remove_sticky") {
            const modal = new Modal()
                .setCustomId(`remove_sticky`)
                .setTitle(`Disable a sticky msg`)
                .addComponents([
                    new TextInputComponent()
                    .setCustomId(`msg`)
                    .setLabel('Sticky ID')
                    .setStyle('SHORT') //SHORT' or 'LONG'
                    .setPlaceholder(`Sticky ID? Well that's the sticky message ID!`)
                    .setRequired(true),
                ]);

            showModal(modal, {
                client: client, // Client to show the Modal through the Discord API.
                interaction: interaction // Show the modal with interaction data.
            })

        }

        if (interaction.customId == "blacklist_user") {
            await interaction.deferReply({
                ephemeral: true
            });

            interaction.editReply({
                content: `Okay, please mention the user in the chat.`,
                components: []
            })


            const filter = m => m.author.id === interaction.user.id
            /* This is the collector being created, we put in the filter, and we also configure the time */
            const collector = interaction.channel.createMessageCollector({
                filter,
                time: 15000,
                max: 1
            });

            /* This is our collector function, it is active while the collector is alive */
            collector.on('collect', async (m) => {

                m.delete().catch(async (e) => {})


                const channel = m.mentions.members.first();

                if (!channel) return interaction.editReply({
                    content: `${client.config.emojis.error} Invalid user provided, please try again! `
                })

                const data = await gpt.findOne({
                    userId: channel.id
                })

                if (!data) return interaction.editReply({
                    content: `Sorry, the user hasn't used one of the openai commands yet so they have no data!`,
                    components: []
                })



                await gpt.updateOne({
                    userId: channel.id
                }, {
                    userId: channel.id,
                    blacklisted: 'true',
                })

                /* Simple reply if we collect a message */
                interaction.editReply({
                    content: `${client.config.emojis.correct} The user <@${channel.id}> is now blacklisted`
                })



                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {

                        /* Message sent at the end of the collection period if something was collected*/

                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });

            })

        }

        if (interaction.customId == "unblacklist_user") {
            await interaction.deferReply({
                ephemeral: true
            });

            interaction.editReply({
                content: `Okay, please mention the user in the chat.`,
                components: []
            })


            const filter = m => m.author.id === interaction.user.id
            /* This is the collector being created, we put in the filter, and we also configure the time */
            const collector = interaction.channel.createMessageCollector({
                filter,
                time: 15000,
                max: 1
            });

            /* This is our collector function, it is active while the collector is alive */
            collector.on('collect', async (m) => {

                m.delete().catch(async (e) => {})


                const channel = m.mentions.members.first();

                if (!channel) return interaction.editReply({
                    content: `${client.config.emojis.error} Invalid user provided, please try again! `
                })

                const data = await gpt.findOne({
                    userId: channel.id
                })

                if (!data) return interaction.editReply({
                    content: `Sorry, the user hasn't used one of the openai commands yet so they have no data!`,
                    components: []
                })



                await gpt.updateOne({
                    userId: channel.id
                }, {
                    userId: channel.id,
                    blacklisted: 'false',
                })

                /* Simple reply if we collect a message */
                interaction.editReply({
                    content: `${client.config.emojis.correct} The user <@${channel.id}> is now un-blacklisted`
                })



                /* This is triggered on death of the collector */
                collector.on('end', collected => {
                    if (collected.size > 0) {

                        /* Message sent at the end of the collection period if something was collected*/

                    } else {
                        /* Message sent if nothing was collected */
                        interaction.editReply({
                            content: `${client.config.emojis.error} Sorry, you took too long, please try again!`
                        });
                    }
                });

            })

        }



        if (interaction.customId == "total_responder") {
            await interaction.deferReply({
                ephemeral: true
            });

            let array = []
            const allReminders = await responders.find({
                Guild: interaction.guild.id
            })

            const allReminders2 = await responders.findOne({
                Guild: interaction.guild.id
            })

            if (!allReminders2) return interaction.editReply({
                content: `${client.config.emojis.error} Seems like this server has no keyword responders. Add one for it to show up here!\n> *To setup the responder system use </settings:1065377711406710835> and press the Setup Responder button*`,
                components: []
            })

            allReminders.forEach(async reminder => {
                array.push(`Keyword: \`${reminder.Keyword}\`, which replies with:\n> ${reminder.Reply}`)

                interaction.editReply({
                    content: `${array.length > 800 ? array.substring(0, 800).join("\n\n") + "\n...and more" : array.join("\n\n")}`,
                    components: []
                })
            })
        }

        if (interaction.customId == "add_responder") {
            const modal = new Modal()
                .setCustomId(`add_responder`)
                .setTitle(`Add a keyword`)
                .addComponents([
                    new TextInputComponent()
                    .setCustomId(`keyword`)
                    .setLabel('Keyword')
                    .setStyle('SHORT') //SHORT' or 'LONG'
                    .setPlaceholder(`Insert the keyword here. Ex, azury`)
                    .setRequired(true),
                    new TextInputComponent()
                    .setCustomId(`reply`)
                    .setLabel('Reply')
                    .setStyle('LONG') //SHORT' or 'LONG'
                    .setPlaceholder(`Insert the keyword reply message here. Ex, azury is really cool!`)
                    .setRequired(true),
                ]);

            showModal(modal, {
                client: client, // Client to show the Modal through the Discord API.
                interaction: interaction // Show the modal with interaction data.
            })

        }

        if (interaction.customId == "remove_responder") {
            const modal = new Modal()
                .setCustomId(`remove_responder`)
                .setTitle(`Remove a keyword`)
                .addComponents([
                    new TextInputComponent()
                    .setCustomId(`keyword`)
                    .setLabel('Keyword')
                    .setStyle('SHORT') //SHORT' or 'LONG'
                    .setPlaceholder(`Insert the keyword here to remove. Ex, azury`)
                    .setRequired(true),
                ]);

            showModal(modal, {
                client: client, // Client to show the Modal through the Discord API.
                interaction: interaction // Show the modal with interaction data.
            })

        }

        if (interaction.customId == "edit_responder") {
            const allReminders = await responders.find({
                Guild: interaction.guild.id
            })
            const allReminders2 = await responders.findOne({
                Guild: interaction.guild.id
            })

            let array = []
            let array2 = []
            let array3 = []

            if (!allReminders2) return interaction.reply({
                content: "There is no responder to edit in your server!",
                ephemeral: true
            })

            allReminders.forEach(async reminder => {
                array.push(`${reminder.Keyword > 50 ? reminder.Keyword.substring(0, 50) + "..." : reminder.Keyword}`)
                array2.push(`${reminder.Reply > 50 ? reminder.Reply.substring(0, 50) + "..." : reminder.Reply}`)

            })

            const modal = new Modal()
                .setCustomId(`edit_responder`)
                .setTitle(`Edit your responder!`)
                .addComponents([
                    new TextInputComponent()
                    .setCustomId(`keyword`)
                    .setLabel('Keyword')
                    .setStyle('SHORT') //SHORT' or 'LONG'
                    .setPlaceholder(`Pick a existing keyword`) //[${allReminders2.Keyword > 800 ? allReminders.Keyword.substring(0, 800) + "\n...and more" : allReminders2.Keyword || "Nothing" }]
                    .setRequired(true),
                    new TextInputComponent()
                    .setCustomId(`reply`)
                    .setLabel('Reply')
                    .setStyle('LONG') //SHORT' or 'LONG'
                    .setPlaceholder(`The new reply!`) // [${allReminders2.Reply > 800 ? allReminders.Reply.substring(0, 800) + "\n...and more" : allReminders2.Reply || "Nothing"}]
                    .setRequired(true),
                ]);

            showModal(modal, {
                client: client, // Client to show the Modal through the Discord API.
                interaction: interaction // Show the modal with interaction data.
            })

        }


        if (interaction.customId == "add_antiword") {
            const modal = new Modal()
                .setCustomId(`add_antiword`)
                .setTitle(`Add a antiword`)
                .addComponents([
                    new TextInputComponent()
                    .setCustomId(`keyword`)
                    .setLabel('Keyword')
                    .setStyle('SHORT') //SHORT' or 'LONG'
                    .setPlaceholder(`Insert the keyword here. Ex, fuck`)
                    .setRequired(true),
                    new TextInputComponent()
                    .setCustomId(`action`)
                    .setLabel('Action')
                    .setStyle('LONG') //SHORT' or 'LONG'
                    .setPlaceholder(`[TIMEOUT, WARN, BAN, DELETE, KICK]`)
                    .setRequired(true),
                ]);

            showModal(modal, {
                client: client, // Client to show the Modal through the Discord API.
                interaction: interaction // Show the modal with interaction data.
            })

        }

        if (interaction.customId == "remove_antiword") {
            const allReminders2 = await antiBadWord.findOne({
                Guild: interaction.guild.id
            })
            if (!allReminders2) return interaction.reply({
                content: `${client.config.emojis.error} Seems like this server has no anti bad words! Add one for it to show up here!\n> *To setup the responder system use </settings:1065377711406710835> and press the Anti Bad Words button*`,
                ephemeral: true
            })

            const modal = new Modal()
                .setCustomId(`remove_antiword`)
                .setTitle(`Remove a antiword`)
                .addComponents([
                    new TextInputComponent()
                    .setCustomId(`keyword`)
                    .setLabel('Keyword')
                    .setStyle('SHORT') //SHORT' or 'LONG'
                    .setPlaceholder(`Insert the keyword here to remove. Ex, fuck`)
                    .setRequired(true),
                ]);

            showModal(modal, {
                client: client, // Client to show the Modal through the Discord API.
                interaction: interaction // Show the modal with interaction data.
            })
        }

        if (interaction.customId == "edit_antiword") {
            const allReminders2 = await antiBadWord.findOne({
                Guild: interaction.guild.id
            })
            if (!allReminders2) return interaction.reply({
                content: `${client.config.emojis.error} Seems like this server has no anti bad words! Add one for it to show up here!\n> *To setup the responder system use </settings:1065377711406710835> and press the Anti Bad Words button*`,
                ephemeral: true
            })
            const modal = new Modal()
                .setCustomId(`edit_antiword`)
                .setTitle(`Edit your antiword!`)
                .addComponents([
                    new TextInputComponent()
                    .setCustomId(`keyword`)
                    .setLabel('Keyword')
                    .setStyle('SHORT') //SHORT' or 'LONG'
                    .setPlaceholder(`Pick a existing keyword`) //[${allReminders2.Keyword > 800 ? allReminders.Keyword.substring(0, 800) + "\n...and more" : allReminders2.Keyword || "Nothing" }]
                    .setRequired(true),
                    new TextInputComponent()
                    .setCustomId(`action`)
                    .setLabel('Action')
                    .setStyle('LONG') //SHORT' or 'LONG'
                    .setPlaceholder(`[TIMEOUT, WARN, BAN, KICK, DELETE]`) // [${allReminders2.Reply > 800 ? allReminders.Reply.substring(0, 800) + "\n...and more" : allReminders2.Reply || "Nothing"}]
                    .setRequired(true),
                ]);

            showModal(modal, {
                client: client, // Client to show the Modal through the Discord API.
                interaction: interaction // Show the modal with interaction data.
            })
        }

        if (interaction.customId == "total_antiword") {
            await interaction.deferReply({
                ephemeral: true
            });

            let array = []
            const allReminders = await antiBadWord.find({
                Guild: interaction.guild.id
            })

            const allReminders2 = await antiBadWord.findOne({
                Guild: interaction.guild.id
            })

            if (!allReminders2) return interaction.editReply({
                content: `${client.config.emojis.error} Seems like this server has no anti bad words! Add one for it to show up here!\n> *To setup the antiword system use </settings:1065377711406710835> and press the Anti Words button*`,
                components: []
            })

            allReminders.forEach(async reminder => {
                array.push(`Keyword: \`${reminder.Keyword}\`, which it's action is:\n> ${reminder.Action}`)

                interaction.editReply({
                    content: `${array.length > 600 ? array.substring(0, 600).join("\n\n") + "\n...and more" : array.join("\n\n")}`,
                    components: []
                })
            })
        }


        if (interaction.customId.startsWith('edit1_')) {
            const timestamp = interaction.customId.replace('edit1_', '').replace('!$!', '`').replace('!%!', '`')

            const descs = interaction.customId.replace('edit1_', '')

            const row = new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setLabel(`Message version`)
                    .setStyle(`SECONDARY`)
                    .setEmoji(client.config.emojis.message)
                    .setCustomId(`edit2_${descs}`)
                ])

            interaction.update({
                content: timestamp,
                components: [row]
            })
        }
        if (interaction.customId.startsWith('edit2_')) {
            const timestamp = interaction.customId.replace('edit2_', '').replace('!$!', '').replace('!%!', '')

            const descs = interaction.customId.replace('edit2_', '')

            const row = new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setLabel(`Code version`)
                    .setStyle(`SECONDARY`)
                    .setEmoji(client.config.emojis.ping)
                    .setCustomId(`edit1_${descs}`)
                ])

            interaction.update({
                content: timestamp,
                components: [row]
            })
        }

        if (interaction.customId.startsWith('giveaway_p_')) {
            const gid = interaction.customId.replace('giveaway_p_', '')

            await interaction.deferReply({
                ephemeral: true
            });

            const data = await giveaway.find({
                id: gid,
                guild: interaction.guild.id,
                status: "ACTIVE"
            })

            const data_ = await giveaway.findOne({
                id: gid,
                guild: interaction.guild.id
            })

            if (!data_) return interaction.editReply({
                content: `${client.config.emojis.error} Invalid giveaway has been used!`,
                ephemeral: true
            })
            if (data_.status == "FINISHED") return interaction.editReply({
                content: `${client.config.emojis.error} Giveaway has already finished!`,
                ephemeral: true
            })
            if (data_.status == "CANCELLED") return interaction.editReply({
                content: `${client.config.emojis.error} Giveaway was cancelled!`,
                ephemeral: true
            })




            data.forEach(async giveawayx => {

                const guild = await client.guilds.fetch(giveawayx.guild).catch(() => {});
                if (!guild) return await giveaway.updateOne({
                    id: gid
                }, {
                    status: "CANCELLED"
                });
                const channel = guild.channels.cache.get(giveawayx.channel);

                let winners = [];
                let length = 0;

                let participants = giveawayx.participants.filter(user => user);

                if (participants.length == 0) return interaction.editReply({
                    content: `${client.config.emojis.error} Nobody has participated in this giveaway!`,
                    embeds: [],
                    ephemeral: true
                })

                const embedz = new MessageEmbed()
                    .setTitle(`Fetching participants...`)
                    .setColor(`WHITE`)

                interaction.editReply({
                    embeds: [embedz]
                })

                for (let i = 0; i < Number(data_.participants.length); i++) {
                    const winner = participants[Math.floor(Math.random() * participants.length)];
                    if (!winner) return;
                    participants = participants.filter(item => item !== winner);
                    winners.push(`<@${winner}>`);
                    length += 1;



                    const embed = new MessageEmbed()
                        .setTitle(`${data_.participants.length} participants in this giveaway`)
                        .setDescription(`>>> ${winners.length > 5800 ? winners.substring(0, 5800).join(", ") + "...and more" : winners.join(", ")}`)
                        .setFooter(`${length} / ${data_.participants.length} participants loaded`)
                        .setColor(`${client.color}`)

                    interaction.editReply({
                        embeds: [embed]
                    })
                }

            })
        }
        if (interaction.customId.startsWith('giveaway_e_')) {
            const gid = interaction.customId.replace('giveaway_e_', '')

            const data = await giveaway.findOne({
                id: gid,
                participants: interaction.user.id
            })

            const data_ = await giveaway.findOne({
                id: gid,
                guild: interaction.guild.id
            })

            if (!data_) return interaction.reply({
                content: `${client.config.emojis.error} Invalid giveaway has been used!`,
                ephemeral: true
            })
            if (data_.status == "FINISHED") return interaction.reply({
                content: `${client.config.emojis.error} Giveaway has already finished!`,
                ephemeral: true
            })
            if (data_.status == "CANCELLED") return interaction.reply({
                content: `${client.config.emojis.error} Giveaway was cancelled!`,
                ephemeral: true
            })


            const guild = await client.guilds.fetch(data_.guild).catch(() => {});
            if (!guild) return await giveaway.updateOne({
                id: gid
            }, {
                status: "CANCELLED"
            });
            const channel = guild.channels.cache.get(data_.channel);

            if (!data) {

                await giveaway.updateOne({
                    id: gid,
                    status: "ACTIVE"
                }, {

                    enters: (data_.enters || 0) + 1,

                    $push: {
                        participants: interaction.user.id
                    }
                }).then(async () => {
                    interaction.reply({
                        content: `${client.config.emojis.correct} You have entered this giveaway for: ${data_.prize}\n${client.config.emojis.timestamp} Which the giveaway ends <t:${Math.floor((ms(data_.time)) / 1000)}:R>`,
                        ephemeral: true
                    });
                    await channel.messages.fetch(data_.message).then(async (message) => {
                        const row = new Discord.MessageActionRow()
                            .addComponents([
                                new Discord.MessageButton()
                                .setLabel(`Enter giveaway (${(data_.enters || 0) + 1})`)
                                .setStyle(`SECONDARY`)
                                .setEmoji(client.config.emojis.giveaway)
                                .setCustomId(`giveaway_e_${gid}`),
                                new Discord.MessageButton()
                                .setLabel(`Participants`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`giveaway_p_${gid}`),
                            ])
                        message.edit({
                            components: [row]
                        })
                    })
                });
            } else {
                await giveaway.updateOne({
                    id: gid,
                    status: "ACTIVE"
                }, {

                    enters: (data_.enters || 1) - 1,

                    participants: (data_.participants || []).filter(_p => _p != interaction.user.id)
                }).then(async () => {
                    interaction.reply({
                        content: `${client.config.emojis.correct} You have left this giveaway for: ${data_.prize}`,
                        ephemeral: true
                    });
                    await channel.messages.fetch(data_.message).then(async (message) => {
                        const row = new Discord.MessageActionRow()
                            .addComponents([
                                new Discord.MessageButton()
                                .setLabel(`Enter giveaway (${(data_.enters || 1) - 1})`)
                                .setStyle(`SECONDARY`)
                                .setEmoji(client.config.emojis.giveaway)
                                .setCustomId(`giveaway_e_${gid}`),
                                new Discord.MessageButton()
                                .setLabel(`Participants`)
                                .setStyle(`SECONDARY`)
                                .setCustomId(`giveaway_p_${gid}`),
                            ])
                        message.edit({
                            components: [row]
                        })
                    })
                });
            }
        }
        if (interaction.customId.startsWith('giveaway_r_')) {
            const gid = interaction.customId.replace('giveaway_r_', '')

            if (!interaction.member.permissions.has(`ADMINISTRATOR`)) return interaction.reply({
                content: `${client.config.emojis.error} You need to have the **ADMINISTRATOR** permission to use this command!`,
                ephemeral: true
            });

            const modal = new Modal()
                .setCustomId(`giveaway_r_${gid}`)
                .setTitle(`Reroll a giveaway`)
                .addComponents([
                    new TextInputComponent()
                    .setCustomId(`winners_count`)
                    .setLabel('Winners count:')
                    .setStyle('SHORT') //SHORT' or 'LONG'
                    .setPlaceholder(`How many people should I reroll? Ex. 1, 2, 4`)
                    .setRequired(true),
                ]);

            showModal(modal, {
                client: client, // Client to show the Modal through the Discord API.
                interaction: interaction // Show the modal with interaction data.
            })

        }
        if (interaction.customId.startsWith('dallerate_')) {
            const rate = interaction.customId.replace('dallerate_', '');


            const row = new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setStyle(`DANGER`)
                    .setEmoji(`1074450467305836575`)
                    .setDisabled(true)
                    .setCustomId(`dallerate_1`),
                    new Discord.MessageButton()
                    .setStyle(`PRIMARY`)
                    .setEmoji(`1074450467305836575`)
                    .setDisabled(true)
                    .setCustomId(`dallerate_2`),
                    new Discord.MessageButton()
                    .setStyle(`SUCCESS`)
                    .setEmoji(`1074450467305836575`)
                    .setDisabled(true)
                    .setCustomId(`dallerate_3`),
                    new Discord.MessageButton()
                    .setStyle(`SUCCESS`)
                    .setEmoji(`1074450467305836575`)
                    .setDisabled(true)
                    .setCustomId(`dallerate_4`),
                ])

            const row2 = new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setStyle(`SECONDARY`)
                    .setLabel(`Left your review as, ${rate == 1 ? "Bad" : rate == 2 ? "Not bad" : rate == 3 ? "Good" : "Very good"}`)
                    .setDisabled(true)
                    .setCustomId(`dallaale`),
                    new Discord.MessageButton()
                    .setStyle(`SECONDARY`)
                    .setLabel(`${rate == 1 ? "ㅤㅤㅤㅤ" : rate == 2 ? "ㅤ" : rate == 3 ? "ㅤㅤㅤ" : "ㅤ"}`)
                    .setDisabled(true)
                    .setCustomId(`aaa`)
                ])

            if (rate < 2) {
                row2.components[0].setStyle(`DANGER`)
            } else if (rate == 2) {
                row2.components[0].setStyle(`PRIMARY`)
            } else {
                row2.components[0].setStyle(`SUCCESS`)
            }

            row.components[rate - 1].setStyle(`SECONDARY`).setEmoji(`1074451581690466365`)

            return interaction.update({
                components: [row, row2]
            })

        }
        if (interaction.customId.startsWith('daller_')) {
            const promptd = interaction.customId.replace('daller_', '');

            const text = ["Loading image...", "Generating image...", "Uploading image...", "Processing image...", "Drawing image...", "Drawing...", "Uploading...", "Processing...", "Generating...", "Loading..."]
            const text2 = ["Finalizing image...", "Almost done...", "Finishing up...", "Finishing...", "Finishing image...", "Finishing up image...", "Almost done image...", "Almost done with image...", "Uploading image..."]

            await interaction.deferReply({
                ephemeral: true
            });

            interaction.editReply({
                content: `${text[Math.floor(Math.random() * text.length)]}`
            })

            await dalle(`xx`, `xx`, `${promptd}`).then(async (answer) => {

                interaction.editReply({
                    content: `${text2[Math.floor(Math.random() * text2.length)]}`
                })

                if (answer == 'OFFLINE_ERR') {
                    return interaction.editReply({
                        content: `Seems your request to OPENAI didn't go through, please try again later!`,
                        ephemeral: true
                    })
                }

                const row = new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                        .setStyle(`DANGER`)
                        .setEmoji(`1074450467305836575`)
                        .setCustomId(`dallerate_1`),
                        new Discord.MessageButton()
                        .setStyle(`PRIMARY`)
                        .setEmoji(`1074450467305836575`)
                        .setCustomId(`dallerate_2`),
                        new Discord.MessageButton()
                        .setStyle(`SUCCESS`)
                        .setEmoji(`1074450467305836575`)
                        .setCustomId(`dallerate_3`),
                        new Discord.MessageButton()
                        .setStyle(`SUCCESS`)
                        .setEmoji(`1074450467305836575`)
                        .setCustomId(`dallerate_4`),
                    ])

                interaction.editReply({
                    content: `\\> **${promptd.length > 100 ? promptd.substring(0, 100) + "..." : promptd} (Reloaded)**||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||${answer}`,
                    components: [row]
                }).catch(async (e) => {
                    interaction.editReply({
                        content: `Seems your request to OPENAI didn't go through, please try again later!`,
                        ephemeral: true
                    })
                })

            })
        }

        if (interaction.customId == "server_settings") {

            const row = new MessageActionRow()
                .addComponents([
                    new MessageSelectMenu()
                    .setCustomId(`server_settings`)
                    .setPlaceholder('View server settings')
                    .addOptions({
                        label: 'Active giveaways',
                        value: 'total_giveaways',
                    }, {
                        label: 'End giveaway',
                        value: 'end_giveaway',
                    }, {
                        label: 'View user-invites',
                        value: 'view_invite',
                    }, {
                        label: 'View invite-code-info',
                        value: 'view_invitecode',
                    }, {
                        label: 'View user-warns',
                        value: 'view_warns',
                    }, {
                        label: 'Remove user-warn',
                        value: 'remove_warns',
                    }, {
                        label: 'View user-rank',
                        value: 'view_rank',
                    }, ),
                ])

            const row3 = new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setLabel(`User settings`)
                    .setStyle(`SECONDARY`)
                    .setEmoji(`1071622043646300240`)
                    .setCustomId(`user_settings`),
                    new Discord.MessageButton()
                    .setLabel(`Setup settings`)
                    .setEmoji(`1071621928382640238`)
                    .setStyle(`SECONDARY`)
                    .setCustomId(`setup_settings`),
                ])

            interaction.update({
                content: `${client.config.emojis.settings} Here are the **server settings** page, you can manage some of the settings for the server!`,
                components: [row, row3]
            })
        }
        if (interaction.customId == "setup_settings") {

            if (client.config.settings.developers.includes(interaction.user.id)) {
                const row = new MessageActionRow()
                    .addComponents([
                        new MessageSelectMenu()
                        .setCustomId(`setup_settings`)
                        .setPlaceholder('View setup settings')
                        .addOptions({
                            label: 'Setup audit-log',
                            value: 'setup_audit',
                        }, {
                            label: 'Setup responder',
                            value: 'setup_responders',
                        }, {
                            label: 'Setup anti-Word',
                            value: 'setup_anti_word',
                        }, {
                            label: 'Setup sticky-msg',
                            value: 'setup_sticky',
                        }, {
                            label: 'Setup welcome-log',
                            value: 'setup_welcome',
                        }, {
                            label: 'Setup invite-log',
                            value: 'setup_invitelog',
                        }, {
                            label: 'Setup suggestions',
                            value: 'setup_suggestion',
                        }, {
                            label: 'Setup warn-action-limit',
                            value: 'setup_warnaction',
                        }, {
                            label: 'Setup level-up-channel',
                            value: 'setup_levelchannel',
                        }, ),
                    ])
                const row3 = new Discord.MessageActionRow()
                    .addComponents([

                        new Discord.MessageButton()
                        .setLabel(`Server settings`)
                        .setStyle(`SECONDARY`)
                        .setEmoji(`1071622043646300240`)
                        .setCustomId(`server_settings`),
                        new Discord.MessageButton()
                        .setLabel(`Database settings`)
                        .setEmoji(`1071621928382640238`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`database_settings`),
                    ])

                interaction.update({
                    content: `${client.config.emojis.settings} Here are the **setup settings** page, you can manage some of the setups for the server!`,
                    components: [row, row3]
                })
            } else {



                const row = new MessageActionRow()
                    .addComponents([
                        new MessageSelectMenu()
                        .setCustomId(`setup_settings`)
                        .setPlaceholder('View setup settings')
                        .addOptions({
                            label: 'Setup audit-log',
                            value: 'setup_audit',
                        }, {
                            label: 'Setup responder',
                            value: 'setup_responders',
                        }, {
                            label: 'Setup anti-Word',
                            value: 'setup_anti_word',
                        }, {
                            label: 'Setup sticky-msg',
                            value: 'setup_sticky',
                        }, {
                            label: 'Setup welcome-log',
                            value: 'setup_welcome',
                        }, {
                            label: 'Setup invite-log',
                            value: 'setup_invitelog',
                        }, {
                            label: 'Setup suggestions',
                            value: 'setup_suggestion',
                        }, {
                            label: 'Setup warn-action-limit',
                            value: 'setup_warnaction',
                        }, {
                            label: 'Setup level-up-channel',
                            value: 'setup_levelchannel',
                        }, ),
                    ])
                const row3 = new Discord.MessageActionRow()
                    .addComponents([

                        new Discord.MessageButton()
                        .setLabel(`Server settings`)
                        .setStyle(`SECONDARY`)
                        .setEmoji(`1071622043646300240`)
                        .setCustomId(`server_settings`),
                        new Discord.MessageButton()
                        .setLabel(`User settings`)
                        .setEmoji(`1071621928382640238`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`user_settings`),
                    ])

                interaction.update({
                    content: `${client.config.emojis.settings} Here are the **setup settings** page, you can manage some of the setups for the server!`,
                    components: [row, row3]
                })
            }
        }
        if (interaction.customId == "database_settings") {

            const row = new MessageActionRow()
                .addComponents([
                    new MessageSelectMenu()
                    .setCustomId(`database_settings`)
                    .setPlaceholder('View database settings')
                    .addOptions({
                        label: 'Reminder data',
                        value: 'reminder_db',
                    }, {
                        label: 'Responder data',
                        value: 'responder_db',
                    }, {
                        label: 'Sticky-msg data',
                        value: 'sticky_db',
                    }, {
                        label: 'Welcome-log data',
                        value: 'welcome_db',
                    }, {
                        label: 'Invite-log data',
                        value: 'invitelog_db',
                    }, {
                        label: 'Audit-log data',
                        value: 'audit_db',
                    }, {
                        label: 'Giveaway data',
                        value: 'giveaway_db',
                    }, {
                        label: 'Afk data',
                        value: 'afk_db',
                    }, ),
                ])

            const rows = new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setLabel(`Reset GPT-Prompts`)
                    .setStyle(`DANGER`)
                    .setCustomId(`reset_prompts`),
                    new Discord.MessageButton()
                    .setLabel(`Reset DALLE-Prompts`)
                    .setStyle(`DANGER`)
                    .setCustomId(`reset_prompts_d`),
                    new Discord.MessageButton()
                    .setLabel(`Blacklist from OPENAI`)
                    .setStyle(`DANGER`)
                    .setCustomId(`blacklist_user`),
                    new Discord.MessageButton()
                    .setLabel(`<- remove`)
                    .setStyle(`DANGER`)
                    .setCustomId(`unblacklist_user`),
                ])
            const row3 = new Discord.MessageActionRow()
                .addComponents([

                    new Discord.MessageButton()
                    .setLabel(`Setup settings`)
                    .setStyle(`SECONDARY`)
                    .setEmoji(`1071622043646300240`)
                    .setCustomId(`setup_settings`),
                    new Discord.MessageButton()
                    .setLabel(`User settings`)
                    .setEmoji(`1071621928382640238`)
                    .setStyle(`SECONDARY`)
                    .setCustomId(`user_settings`),
                ])

            interaction.update({
                content: `${client.config.emojis.settings} Here are the **database settings** page, you view the database settings for the entire bot!`,
                components: [row, rows, row3]
            })
        }
        if (interaction.customId == "user_settings") {

            if (client.config.settings.developers.includes(interaction.user.id)) {
                const row = new MessageActionRow()
                    .addComponents([
                        new MessageSelectMenu()
                        .setCustomId(`user_settings`)
                        .setPlaceholder('View user settings')
                        .addOptions({
                            label: 'My Reminders',
                            value: 'total_reminders',
                        }, {
                            label: 'My Invites',
                            value: 'total_invites',
                        }, {
                            label: 'Top Invites',
                            value: 'top_invites',
                        }, {
                            label: 'My Warnings',
                            value: 'total_warns',
                        }, {
                            label: 'My Ranking',
                            value: 'total_rank',
                        }, {
                            label: 'Entered Giveaways',
                            value: 'entered_giveaways',
                        }, ),
                    ])
                const row2 = new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                        .setLabel(`Database settings`)
                        .setStyle(`SECONDARY`)
                        .setEmoji(`1071622043646300240`)
                        .setCustomId(`database_settings`),
                        new Discord.MessageButton()
                        .setLabel(`Server settings`)
                        .setStyle(`SECONDARY`)
                        .setEmoji(`1071621928382640238`)
                        .setCustomId(`server_settings`),
                    ])

                interaction.update({
                    content: `${client.config.emojis.settings} Here are your **user settings** here you can manage and view your settings!`,
                    components: [row, row2]
                })
            } else {

                const row = new MessageActionRow()
                    .addComponents([
                        new MessageSelectMenu()
                        .setCustomId(`user_settings`)
                        .setPlaceholder('View user settings')
                        .addOptions({
                            label: 'My Reminders',
                            value: 'total_reminders',
                        }, {
                            label: 'My Invites',
                            value: 'total_invites',
                        }, {
                            label: 'Top Invites',
                            value: 'top_invites',
                        }, {
                            label: 'My Warnings',
                            value: 'total_warns',
                        }, {
                            label: 'My Ranking',
                            value: 'total_rank',
                        }, {
                            label: 'Entered Giveaways',
                            value: 'entered_giveaways',
                        }, ),
                    ])


                const row2 = new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                        .setLabel(`Setup settings`)
                        .setStyle(`SECONDARY`)
                        .setEmoji(`1071622043646300240`)
                        .setCustomId(`setup_settings`),
                        new Discord.MessageButton()
                        .setLabel(`Server settings`)
                        .setStyle(`SECONDARY`)
                        .setEmoji(`1071621928382640238`)
                        .setCustomId(`server_settings`),
                    ])

                interaction.update({
                    content: `${client.config.emojis.settings} Here are your **user settings** here you can manage and view your settings!`,
                    components: [row, row2]
                })
            }

        }
        if (interaction.customId == 'help-page1') {
            const row = new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setLabel(`View page 2`)
                    .setEmoji(`1071622043646300240`)
                    .setStyle(`SECONDARY`)
                    .setCustomId(`help-page2`)
                ])

            await interaction.update({
                content: `
${client.config.emojis.question} Hello, I'm **${client.user.username}**, a Discord-utility bot!

${client.config.emojis.ping} **How to create a Discord Timestamp?**
Just simply use the </utility timestamp:1067552679355764817> command and fill out the options.

${client.config.emojis.reminder} **How to create a reminder?**
To create a reminder just use </utility remind:1067552679355764817> and fill out the options, and I will send you a dm!
If you dms are closed, then I will send your reminder in the channel you used it in!

${client.config.emojis.giveaway} **How to make a giveaway?**
To make a giveaway use </admin giveaway:1067562584389193830> and fill out the options!

${client.config.emojis.settings} **How to change server settings?**
To change or view settings use </settings:1065377711406710835> and press which option you want to use!${ad1[Math.floor(Math.random() * ad1.length)]}
`,
                components: [row],
                ephemeral: true
            })

        }
        if (interaction.customId == 'help-page2') {
            const row = new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setLabel(`View page 1`)
                    .setEmoji(`1071621928382640238`)
                    .setStyle(`SECONDARY`)
                    .setCustomId(`help-page1`)
                ])

            await interaction.update({
                content: `
${client.config.emojis.question} Hello, I'm **${client.user.username}**, a Discord-utility bot!

<:cactus_reply:1067594269969371146> **Utility commands:**
</utility calculator:1067552679355764817>, </utility afk:1067552679355764817>, </utility timestamp:1067552679355764817>
</utility remind:1067552679355764817>, </utility gpt:1067552679355764817>, </utility dalle:1067552679355764817>

${client.config.emojis.servers} **Admin commands:**
</admin warn:1067562584389193830>, </admin giveaway:1067562584389193830>, </admin kick:1067562584389193830>
</admin ban:1067562584389193830>, </admin purge:1067562584389193830>, </admin remoji:1067562584389193830>
`,
                components: [row],
                ephemeral: true
            })

        }
    };

    const {
        commandName
    } = interaction;

    if (commandName === 'utility') {
        if (interaction.options.getSubcommand() === 'aichecker') {
            const promptd = interaction.options.getString("text");

            await interaction.deferReply({
                ephemeral: true
            });



               

                await interaction.editReply({
                    content: `*Checking...*`
                });


                const answers = await checkAI(promptd);

                if (answers == 'OFFLINE_ERR') {
                    return interaction.editReply({
                        content: `Seems your request to AI-CHECK didn't go through, please try again later!`
                    })
                }

                

            interaction.editReply({
                content: `**Result:**\n\n${answers}`
            })

                
        }
        if (interaction.options.getSubcommand() === 'translate') {
            const promptd = interaction.options.getString("text");
            const lang = interaction.options.getString("language_to");

            await interaction.deferReply({
                ephemeral: true
            });



               

                await interaction.editReply({
                    content: `*Translating... to *${lang}**`
                });


                const answers = await ask(`xx`, `xx`, `Translate "${promptd}" to ${lang}`);

                if (answers == 'OFFLINE_ERR') {
                    return interaction.editReply({
                        content: `Seems your request to TRANSLATE didn't go through, please try again later!`
                    })
                }

                const answer = answers.replace(`${promptd}`, '');

                const row = new MessageActionRow()
                .addComponents([
                    new MessageButton()
                    .setStyle(`SECONDARY`)
                    .setDisabled(true)
                    .setLabel(`Translated to ${lang}`)
                    .setCustomId(`aaa_a`)
                ])

            interaction.editReply({
                content: `**Translation:** ${answer}`,
                components: [row]
            })

                
        }
        if (interaction.options.getSubcommand() === 'gpt') {
            const promptd = interaction.options.getString("prompt");

            await interaction.deferReply({
                ephemeral: true
            });

            let gpts = await gpt.findOne({
                userId: interaction.user.id,
                type: 'GPT'
            }).exec()
            let gptxs = await gpt.findOne({
                userId: interaction.user.id
            }).exec()

            if (!gpts) {
                gpts = new gpt({
                    userId: interaction.user.id,
                    prompt: 1,
                    date: String(Date.now() + ms('1d')),
                    type: 'GPT',
                }).save();



                await interaction.editReply({
                    content: `*GPT-3 is thinking... this may take a while*`
                });


                const answers = await ask(interaction.user.id, interaction.guild.id, `${promptd}`);

                if (answers == 'OFFLINE_ERR') {
                    return interaction.editReply({
                        content: `Seems your request to OPENAI didn't go through, please try again later!`,
                        components: [row]
                    })
                }

                const answer = answers.replace(`${promptd}`, '');



                const row = new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                        .setLabel(`(1/13) prompts used`)
                        .setStyle(`PRIMARY`)
                        .setCustomId(`aa-as`)
                        .setDisabled(true),
                        new MessageButton()
                        .setLabel(`Get Azury Plus`)
                        .setStyle(`LINK`)
                        .setURL(`https://discord.gg/azury`)
                    ])

                if (answer.length < 2000) {
                    await interaction.editReply({
                        content: `\\> **${promptd.length > 80 ? promptd.substring(0, 80) + "..." : promptd}**\n\`\`\`${answer.length > 5600 ? answer.substring(0, 5600) + "...(responce too long)" : answer}\`\`\``,
                        components: [row]
                    }).catch(async (e) => {

                        interaction.editReply({
                            content: `An issue occured while generating\n\n\`\`\`${e}\`\`\``,
                            components: [row]
                        })
                    });
                } else {
                    sourcebin.create([{
                        content: answer,
                        language: 'text',
                    }], {
                        title: 'GPT Output',
                        description: `Output, by ${interaction.user.tag}`,
                    }).then(async haste => {


                        await interaction.editReply({
                            content: `\\> **${promptd.length > 80 ? promptd.substring(0, 80) + "..." : promptd}**\nResponce was too long click the link below:\n${haste.short ? haste.short : haste.url}`,
                            components: [row]
                        }).catch(async (e) => {

                            interaction.editReply({
                                content: `An issue occured while generating\n\n\`\`\`${e}\`\`\``,
                                components: [row]
                            })
                        });
                    })
                }
            } else {

                if (gptxs.blacklisted) {
                    if (gptxs.blacklisted == 'true') return interaction.editReply({
                        content: `Seems you have been blacklisted by the developers of ${client.user.username}`
                    });
                }

                const srow = new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                        .setLabel(`Get Azury Plus`)
                        .setStyle(`LINK`)
                        .setURL(`https://discord.gg/azury`)
                    ])


                if (gpts.prompt >= 13) return interaction.editReply({
                    content: `You have reached your daily limit of 13 promots, <t:${Math.floor((ms(gpts.date)) / 1000)}:R> they will reset`,
                    components: [srow]
                });

                gpts.prompt += 1;

                await gpts.save();


                await interaction.editReply({
                    content: `*GPT-3 is thinking... this may take a while*`
                });


                const answers = await ask(interaction.user.id, interaction.guild.id, `${promptd}`);

                if (answers == 'OFFLINE_ERR') {
                    return interaction.editReply({
                        content: `Seems your request to OPENAI didn't go through, please try again later!`,
                        components: [row]
                    })
                }

                const answer = answers.replace(`${promptd}`, '');


                const row = new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                        .setLabel(`(${gpts.prompt}/13) prompts used`)
                        .setStyle(`PRIMARY`)
                        .setCustomId(`aa-as`)
                        .setDisabled(true),
                        new MessageButton()
                        .setLabel(`Get Azury Plus`)
                        .setStyle(`LINK`)
                        .setURL(`https://discord.gg/azury`)
                    ])

                if (answer.length < 2000) {
                    await interaction.editReply({
                        content: `\\> **${promptd.length > 80 ? promptd.substring(0, 80) + "..." : promptd}**\n\`\`\`${answer.length > 5600 ? answer.substring(0, 5600) + "...(responce too long)" : answer}\`\`\``,
                        components: [row]
                    }).catch(async (e) => {

                        interaction.editReply({
                            content: `An issue occured while generating\n\n\`\`\`${e}\`\`\``,
                            components: [row]
                        })
                    });
                } else {
                    sourcebin.create([{
                        content: answer,
                        language: 'text',
                    }], {
                        title: 'GPT Output',
                        description: `Output, by ${interaction.user.tag}`,
                    }).then(async haste => {


                        await interaction.editReply({
                            content: `\\> **${promptd.length > 80 ? promptd.substring(0, 80) + "..." : promptd}**\nResponce was too long click the link below:\n${haste.short ? haste.short : haste.url}`,
                            components: [row]
                        }).catch(async (e) => {

                            interaction.editReply({
                                content: `An issue occured while generating\n\n\`\`\`${e}\`\`\``,
                                components: [row]
                            })
                        });
                    })
                }
            }
        }
        if (interaction.options.getSubcommand() === 'dalle') {
            const promptd = interaction.options.getString("prompt");

            await interaction.deferReply({
                ephemeral: true
            });

            let gpts = await gpt.findOne({
                userId: interaction.user.id,
                type: 'DALLE'
            }).exec()
            let gptxs = await gpt.findOne({
                userId: interaction.user.id
            }).exec()

            if (!gpts) {
                gpts = new gpt({
                    userId: interaction.user.id,
                    prompt: 1,
                    date: String(Date.now() + ms('1d')),
                    type: 'DALLE',
                }).save();




                await interaction.editReply({
                    content: `*Dalle is drawing... this may take a while*`
                });


                const answers = await dalle(interaction.user.id, interaction.guild.id, `${promptd}`);

                if (answers == 'OFFLINE_ERR') {
                    return interaction.editReply({
                        content: `Seems your request to OPENAI didn't go through, please try again later!`,
                        components: [row]
                    })
                }

                const answer = answers


                if (promptd.length > 100) {
                    const row = new MessageActionRow()
                        .addComponents([
                            new MessageButton()
                            .setLabel(`(1/6) prompts used`)
                            .setStyle(`PRIMARY`)
                            .setCustomId(`aa-as`)
                            .setDisabled(true),
                            new MessageButton()
                            .setLabel(`Remake this image`)
                            .setStyle(`SUCCESS`)
                            .setDisabled(true)
                            .setCustomId(`dalle-remake`)
                        ])
                    await interaction.editReply({
                        content: `\\> **${promptd.length > 100 ? promptd.substring(0, 100) + "..." : promptd}**||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||${answer}`,
                        components: [row]
                    }).catch(async (e) => {

                        interaction.editReply({
                            content: `An issue occured while generating\n\n\`\`\`${e}\`\`\``,
                            components: [row]
                        })
                    });
                } else {
                    const row = new MessageActionRow()
                        .addComponents([
                            new MessageButton()
                            .setLabel(`(1/6) prompts used`)
                            .setStyle(`PRIMARY`)
                            .setCustomId(`aa-as`)
                            .setDisabled(true),
                            new MessageButton()
                            .setLabel(`Remake this image`)
                            .setStyle(`SUCCESS`)
                            .setCustomId(`daller_${promptd}`)
                        ])
                    await interaction.editReply({
                        content: `\\> **${promptd.length > 100 ? promptd.substring(0, 100) + "..." : promptd}**||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||${answer}`,
                        components: [row]
                    }).catch(async (e) => {

                        interaction.editReply({
                            content: `An issue occured while generating\n\n\`\`\`${e}\`\`\``,
                            components: [row]
                        })
                    });
                }
            } else {


                if (gptxs.blacklisted) {
                    if (gptxs.blacklisted == 'true') return interaction.editReply({
                        content: `Seems you have been blacklisted by the developers of ${client.user.username}`
                    });
                }

                const srow = new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                        .setLabel(`Get Azury Plus`)
                        .setStyle(`LINK`)
                        .setURL(`https://discord.gg/azury`)
                    ])



                if (gpts.prompt >= 6) return interaction.editReply({
                    content: `You have reached your daily limit of 13 promots, <t:${Math.floor((ms(gpts.date)) / 1000)}:R> they will reset`,
                    components: [srow]
                });

                gpts.prompt += 1;

                await gpts.save();

                await interaction.editReply({
                    content: `*Dalle is drawing... this may take a while*`
                });


                const answers = await dalle(interaction.user.id, interaction.guild.id, `${promptd}`);

                if (answers == 'OFFLINE_ERR') {
                    return interaction.editReply({
                        content: `Seems your request to OPENAI didn't go through, please try again later!`,
                        components: [row]
                    })
                }

                const answer = answers


                if (promptd.length > 100) {
                    const row = new MessageActionRow()
                        .addComponents([
                            new MessageButton()
                            .setLabel(`(${gpts.prompt}/6) prompts used`)
                            .setStyle(`PRIMARY`)
                            .setCustomId(`aa-as`)
                            .setDisabled(true),
                            new MessageButton()
                            .setLabel(`Remake this image`)
                            .setStyle(`SUCCESS`)
                            .setDisabled(true)
                            .setCustomId(`dalle-remake`)
                        ])
                    await interaction.editReply({
                        content: `\\> **${promptd.length > 100 ? promptd.substring(0, 100) + "..." : promptd}**||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||${answer}`,
                        components: [row]
                    }).catch(async (e) => {

                        interaction.editReply({
                            content: `An issue occured while generating\n\n\`\`\`${e}\`\`\``,
                            components: [row]
                        })
                    });
                } else {
                    const row = new MessageActionRow()
                        .addComponents([
                            new MessageButton()
                            .setLabel(`(${gpts.prompt}/6) prompts used`)
                            .setStyle(`PRIMARY`)
                            .setCustomId(`aa-as`)
                            .setDisabled(true),
                            new MessageButton()
                            .setLabel(`Remake this image`)
                            .setStyle(`SUCCESS`)
                            .setCustomId(`daller_${promptd}`)
                        ])
                    await interaction.editReply({
                        content: `\\> **${promptd.length > 100 ? promptd.substring(0, 100) + "..." : promptd}**||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||${answer}`,
                        components: [row]
                    }).catch(async (e) => {

                        interaction.editReply({
                            content: `An issue occured while generating\n\n\`\`\`${e}\`\`\``,
                            components: [row]
                        })
                    });
                }
            }
        }

        if (interaction.options.getSubcommand() === 'calculator') {

            await interaction.deferReply({
                ephemeral: true
            });



            let data = '';
            let content = '';

            const row1 = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('calculator_clear').setLabel('C').setStyle('DANGER'),
                new MessageButton().setCustomId('calculator_(').setLabel('(').setStyle('PRIMARY'),
                new MessageButton().setCustomId('calculator_)').setLabel(')').setStyle('PRIMARY'),
                new MessageButton().setCustomId('calculator_^').setLabel('^').setStyle('PRIMARY')
            );
            const row2 = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('calculator_7').setLabel('7').setStyle('SECONDARY'),
                new MessageButton().setCustomId('calculator_8').setLabel('8').setStyle('SECONDARY'),
                new MessageButton().setCustomId('calculator_9').setLabel('9').setStyle('SECONDARY'),
                new MessageButton().setCustomId('calculator_/').setLabel('/').setStyle('PRIMARY')
            );
            const row3 = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('calculator_4').setLabel('4').setStyle('SECONDARY'),
                new MessageButton().setCustomId('calculator_5').setLabel('5').setStyle('SECONDARY'),
                new MessageButton().setCustomId('calculator_6').setLabel('6').setStyle('SECONDARY'),
                new MessageButton().setCustomId('calculator_*').setLabel('*').setStyle('PRIMARY')
            );
            const row4 = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('calculator_1').setLabel('1').setStyle('SECONDARY'),
                new MessageButton().setCustomId('calculator_2').setLabel('2').setStyle('SECONDARY'),
                new MessageButton().setCustomId('calculator_3').setLabel('3').setStyle('SECONDARY'),
                new MessageButton().setCustomId('calculator_-').setLabel('-').setStyle('PRIMARY')
            );
            const row5 = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('calculator_0').setLabel('0').setStyle('SECONDARY'),
                new MessageButton().setCustomId('calculator_.').setLabel('.').setStyle('SECONDARY'),
                new MessageButton().setCustomId('calculator_=').setLabel('=').setStyle('SUCCESS'),
                new MessageButton().setCustomId('calculator_+').setLabel('+').setStyle('PRIMARY')
            );

            interaction.editReply({
                content: '```fix\nPlease enter something```',
                components: [row1, row2, row3, row4, row5]
            });


            const filter = (compInt) => compInt.member.id === interaction.member.id;
            const collector = interaction.channel.createMessageComponentCollector(filter, {
                time: 10e3
            });

            collector.on('collect', (compInt) => {
                if (!compInt.customId.startsWith('calculator_')) return;
                const value = compInt.customId.replace('calculator_', '');


                switch (value) {
                    case 'clear':
                        data = '';
                        content = '```fix\nPlease enter something```';
                        break;
                    case '=':
                        try {
                            const res = evaluate(data);
                            content = `\`\`\`fix\n${data}\n= ${res}\`\`\``;
                            data = res + '';
                        } catch (e) {
                            console.error(e);
                            content = '```fix\nSomething went wrong while processing this```';
                            data = '';
                        }
                        break;
                    default:
                        data += value;
                        content = '```fix\n' + data + '```';
                        break;
                }

                collector.resetTimer();
                compInt.update({
                    content: content,
                    components: [row1, row2, row3, row4, row5]
                });
            });
            collector.on('end', (collected) => {
                interaction.editReply({
                    content: content + `\n*This session has timed out. You can start a new one with \`/utility calculator\`.*`,
                });
            });

        } else if (interaction.options.getSubcommand() === "remind") {

            let arg1 = interaction.options.getString('time');
            let arg2 = interaction.options.getString('text');

            if (!arg1 || isNaN(ms(arg1))) return interaction.reply({
                content: "" + client.config.emojis.error + " Incorrect time string, must be **`xx`h `xx`m or `xx`s**. H-hours M-minutes S-seconds",
                ephemeral: true
            });
            //if(ms(arg1) < ms("1m")) return interaction.reply({content:""+ client.config.emojis.error +" Incorrect time string, must be longer than 1 minute", ephemeral: true });

            if (arg2.includes('@')) return interaction.reply({
                content: "" + client.config.emojis.error + " Please don't include the variable `@` in your message!",
                ephemeral: true
            });

            const arrays = {
                creator: interaction.user.id,
                channel: interaction.channel.id,
                time: String(Date.now() + ms(arg1)),
                text: arg2,
                status: "ACTIVE",
            };

            console.log(String(Date.now() + ms(arg1)))


            await (new remind(arrays)).save();

            interaction.reply({
                content: `${client.config.emojis.correct} Your reminder was made!\n\n<t:${Math.floor((Date.now() + ms(arg1)) / 1000)}:R> you will be remined of:\n${arg2}`,
                ephemeral: true
            });

        } else if (interaction.options.getSubcommand() === "timestamp") {

            let arg1 = interaction.options.getString('time');
            let arg2 = interaction.options.getString('format');
            //let arg3 = interaction.options.getString('timezone');
            let args = [];
            let message;
            let eph = true;
            let replyMessage;

            const regex = /^([a-zA-ZåäöÅÄÖ0-9-+_: ]{1,255})$/; // Regex types

            console.log(arg1); // push console

            if (regex.test(arg1)) {
                if (arg2 !== null) {

                    console.log(arg2); // push console

                    arg2 = "-f " + arg2;
                    args.push(arg2);
                }
                /*if (arg3 !== null) {

                console.log(arg3); // push console

                arg3 = "-t " + arg3;
                args.push(arg3);
                  }*/

                arg1 = "\"" + arg1 + "\"";
                args.push(arg1);
                replyMessage = getTime(args, eph, arg1);

                replyButton = getTimeButton(args, eph, arg1);

                await interaction.reply({
                    content: `${client.config.emojis.correct} Creating the timestamp in a moment...`,
                    ephemeral: true
                });

                setTimeout(async () => {
                    if (replyButton) {
                        await interaction.editReply({
                            content: replyMessage.toString(),
                            components: [replyButton],
                            ephemeral: true
                        });
                    } else {
                        await interaction.editReply({
                            content: replyMessage.toString(),
                            components: [],
                            ephemeral: true
                        });
                    }
                }, 1000)
            } else {
                await interaction.reply({
                    content: "" + client.config.emojis.error + " Incorrect time string, check https://tinyurl.com/cactus-manual for more info",
                    ephemeral: true
                });
            }

        } else if (interaction.options.getSubcommand() === "afk") {

            let arg1 = interaction.options.getString('reason');
            const data = await afk.findOne({
                Guild: interaction.guild.id,
                Member: interaction.user.id
            });
            if (data) return interaction.reply({
                content: `${client.config.emojis.error} Seems to me that you are already set as AFK. Please leave AFK mode first!`,
                ephemeral: true
            });

            if (arg1.includes('@')) return interaction.reply({
                content: `${client.config.emojis.error} Please don't include the variable \`@\` in your message!`,
                ephemeral: true
            });

            const arrays = {
                Guild: interaction.guild.id,
                Member: interaction.user.id,
                Content: arg1,
                TimeAgo: dayjs(new Date()).unix()
            };

            await (new afk(arrays)).save();

            interaction.reply({
                content: `You have went AFK, for the reason of:\n> ${arg1}\n\n***You can include [afk] in your message to stay afk while talking***`,
                ephemeral: true
            });

        }
    }

    if (commandName === 'help') {

        const row = new Discord.MessageActionRow()
            .addComponents([
                new Discord.MessageButton()
                .setLabel(`View page 2`)
                .setEmoji(`1071622043646300240`)
                .setStyle(`SECONDARY`)
                .setCustomId(`help-page2`)
            ])

        await interaction.reply({
            content: `
${client.config.emojis.question} Hello, I'm **${client.user.username}**, a Discord-utility bot!

${client.config.emojis.ping} **How to create a Discord Timestamp?**
Just simply use the </utility timestamp:1067552679355764817> command and fill out the options.

${client.config.emojis.reminder} **How to create a reminder?**
To create a reminder just use </utility remind:1067552679355764817> and fill out the options, and I will send you a dm!
If you dms are closed, then I will send your reminder in the channel you used it in!

${client.config.emojis.giveaway} **How to make a giveaway?**
To make a giveaway use </admin giveaway:1067562584389193830> and fill out the options!

${client.config.emojis.settings} **How to change server settings?**
To change or view settings use </settings:1065377711406710835> and press which option you want to use!${ad1[Math.floor(Math.random() * ad1.length)]}
`,
            components: [row],
            ephemeral: true
        })
    }

    if (commandName === 'stats') {
        let date = new Date();
        let timestamp = date.getTime() - Math.floor(client.uptime);

        if (!client.config.settings.developers.includes(interaction.user.id)) {
            await interaction.reply({
                content: `${client.config.emojis.question} Hello, I'm **${client.user.username}**, here are my bot statistics:\n\n${client.config.emojis.ping} Ping: ***${Math.round(client.ws.ping)}ms***\n${client.config.emojis.members} Members: ***${client.guilds.cache.map(g => g.memberCount).reduce((a,b)=>a+b,0)}***\n${client.config.emojis.servers} Servers: ***${client.guilds.cache.size}***\n${client.config.emojis.uptime} Uptime: ***<t:${Math.floor(timestamp / 1000)}:R>***`,
                ephemeral: true
            })
        } else {
            const row = new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setLabel(`Show total server info`)
                    .setStyle(`SECONDARY`)
                    .setEmoji(client.config.emojis.servers)
                    .setCustomId(`total_servers`)
                ])
            await interaction.reply({
                content: `${client.config.emojis.question} Hello, I'm **${client.user.username}**, here are my bot statistics:\n\n${client.config.emojis.ping} Ping: ***${Math.round(client.ws.ping)}ms***\n${client.config.emojis.members} Members: ***${client.guilds.cache.map(g => g.memberCount).reduce((a,b)=>a+b,0)}***\n${client.config.emojis.servers} Servers: ***${client.guilds.cache.size}***\n${client.config.emojis.uptime} Uptime: ***<t:${Math.floor(timestamp / 1000)}:R>***`,
                components: [row],
                ephemeral: true
            })
        }
    }

    if (commandName === 'invite') {

        await interaction.reply({
            content: `${client.config.emojis.heart} Thank you for choosing **${client.user.username}**, you can invite me to your server at:\n${client.config.emojis.invite} https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands${ad1[Math.floor(Math.random() * ad1.length)]}`,
            ephemeral: true
        })
    }

    if (commandName === 'discord') {

        await interaction.reply({
            content: `${client.config.emojis.heart} Thank you for choosing **${client.user.username}**, you can join my support server at:\n${client.config.emojis.discord} https://discord.gg/azury`,
            ephemeral: true
        })
    }


    if (commandName === 'guide') {
        let embeds = [];

        const embed1 = new MessageEmbed()
            .setColor(`#36393F`)
            .setTitle(`${client.config.emojis.guide} **Warnings** guiding page`)
            .setDescription(`
To issue a user a warning you can use the </admin warn:1067562584389193830> command, you simply enter the user and then the reason you are warning them.

To view a users warning you can now type </settings:1065377711406710835>, then press the "Server Settings" button, you can then select "View user-warns" in the drop down and mention the user. ${client.user.username} will now display all the users warnings, along with the warn-id, issuer, reason and date the user was warned.
  
To remove a warning you can now scroll down and select "Remove-warn" in the dropdown, then press the "Proceed" button and enter the warn-id you want to remove in the modal.
  
• Tip: You can also now go to the "Setup settings" button and select "Setup warn-action-limit", you can now enter the maximum amount of warnings and a punishment if a user reaches these. 
Ex. If a user is warned 4 amount of times they will be kicked/banned. 
`)

        const embed2 = new MessageEmbed()
            .setColor(`#36393F`)
            .setTitle(`${client.config.emojis.guide} **Timestamp** guiding page`)
            .setDescription(`
What methods can be used to create a timestamp?
When creating a timestamp, you can provide a custom time to be included. Using our regex api, we can detect what you mean, most of the time.
Here are some examples: \`now\` \`now + 2 hours\` \`next month\` \`2021-01-01T12:00+02:00\` and more!

What do the formats do when creating a timestamp?
The format option is for how you want to see your timestamp. Check the title of each format, and they give you a description.
• Incase, the one without is Relative - \`xx ago\` or \`in xx\`
`)

        const embed3 = new MessageEmbed()
            .setColor(`#36393F`)
            .setTitle(`${client.config.emojis.guide} **Setups** guiding page`)
            .setDescription(`
Want to setup some cool systems for your discord server?
To get started you can now type </settings:1065377711406710835>, then press the "Setup Settings" button.
You can then select which ever setup in the drop down press your selection.
  
  
• Tip: Some of the setups have extensive features which allow you to customize our bot
`)

        const embed4 = new MessageEmbed()
            .setColor(`#36393F`)
            .setTitle(`${client.config.emojis.guide} **Command-usage** guiding page`)
            .setDescription(`
Cactus has a list of extensive commands, so here is a list of them and what they do

Information Commands: 
</help:1063606141508137051> - Will show you all commands Cactus has. 
</guide:1063952441390940210> - A detailed guide of all commands with their usage. 
</invite:1063618329320898610> - Returns the invite link of Cactus. 
</stats:1063616606313381939> - Returns statistics; ping, member count, server count, and uptime.
</settings:1065377711406710835> -  View and manage your personal, setup, and server settings.
</discord:1063646976761135244> - Returns the server invite link of the support/main server.


Utility Commands:
</utility calculator:1067552679355764817> - Returns a calculator which you can interact with using buttons.
</utility afk:1067552679355764817> - Set your status to afk with a reason. When you’re pinged, it will respond.
</utility timestamp:1067552679355764817> - Create a timestamp using Cactus.
</utility remind:1067552679355764817> - Sets a reminder for you. You’ll get a Direct message when it ends.
</utility gpt:1067552679355764817> - Ask for anything! Cactus uses ChatGPT to answer.
</utility dalle:1067552679355764817> - Give a prompt and get an image in return.


Admin Commands:
</admin warn:1067562584389193830> - Gives someone a server warning for any given reason.
</admin giveaway:1067562584389193830> - Creates and starts a giveaway.
</admin kick:1067562584389193830> - Removes someone from the current server for the given reason.
</admin ban:1067562584389193830> - Permanently removes someone from the server for a reason.
</admin purge:1067562584389193830> - Deletes the given amount of messages in the same channel.
</admin remoji:1067562584389193830> - Steals an emoji from another server and adds it to yours.
`)


        embeds.push(embed1, embed2, embed3, embed4);

        await azury_page(interaction, embeds);


    }

    if (commandName === 'settings') {
        if (client.config.settings.developers.includes(interaction.user.id)) {
            const row = new MessageActionRow()
                .addComponents([
                    new MessageSelectMenu()
                    .setCustomId(`user_settings`)
                    .setPlaceholder('View user settings')
                    .addOptions({
                        label: 'My Reminders',
                        value: 'total_reminders',
                    }, {
                        label: 'My Invites',
                        value: 'total_invites',
                    }, {
                        label: 'Top Invites',
                        value: 'top_invites',
                    }, {
                        label: 'My Warnings',
                        value: 'total_warns',
                    }, {
                        label: 'My Ranking',
                        value: 'total_rank',
                    }, {
                        label: 'Entered Giveaways',
                        value: 'entered_giveaways',
                    }, ),
                ])
            const row2 = new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setLabel(`Database settings`)
                    .setStyle(`SECONDARY`)
                    .setEmoji(`1071622043646300240`)
                    .setCustomId(`database_settings`),
                    new Discord.MessageButton()
                    .setLabel(`Server settings`)
                    .setStyle(`SECONDARY`)
                    .setEmoji(`1071621928382640238`)
                    .setCustomId(`server_settings`),
                ])


            await interaction.reply({
                content: `${client.config.emojis.settings} Here are your **user settings** here you can manage and view your settings!`,
                components: [row, row2],
                ephemeral: true
            })
        } else if (!interaction.member.permissions.has(`ADMINISTRATOR`)) {
            const row = new MessageActionRow()
                .addComponents([
                    new MessageSelectMenu()
                    .setCustomId(`user_settings`)
                    .setPlaceholder('View user settings')
                    .addOptions({
                        label: 'My Reminders',
                        value: 'total_reminders',
                    }, {
                        label: 'My Invites',
                        value: 'total_invites',
                    }, {
                        label: 'Top Invites',
                        value: 'top_invites',
                    }, {
                        label: 'My Warnings',
                        value: 'total_warns',
                    }, {
                        label: 'My Ranking',
                        value: 'total_rank',
                    }, {
                        label: 'Entered Giveaways',
                        value: 'entered_giveaways',
                    }, ),
                ])
            const row2 = new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setLabel(`Setup settings`)
                    .setStyle(`SECONDARY`)
                    .setDisabled(true)
                    .setEmoji(`1071622043646300240`)
                    .setCustomId(`setup_settings`),
                    new Discord.MessageButton()
                    .setLabel(`Server settings`)
                    .setStyle(`SECONDARY`)
                    .setDisabled(true)
                    .setEmoji(`1071621928382640238`)
                    .setCustomId(`server_settings`),
                ])
            await interaction.reply({
                content: `${client.config.emojis.settings} Here are your **user settings** here you can manage and view your settings!`,
                components: [row, row2],
                ephemeral: true
            })
        } else {
            const row = new MessageActionRow()
                .addComponents([
                    new MessageSelectMenu()
                    .setCustomId(`user_settings`)
                    .setPlaceholder('View user settings')
                    .addOptions({
                        label: 'My Reminders',
                        value: 'total_reminders',
                    }, {
                        label: 'My Invites',
                        value: 'total_invites',
                    }, {
                        label: 'Top Invites',
                        value: 'top_invites',
                    }, {
                        label: 'My Warnings',
                        value: 'total_warns',
                    }, {
                        label: 'My Ranking',
                        value: 'total_rank',
                    }, {
                        label: 'Entered Giveaways',
                        value: 'entered_giveaways',
                    }, ),
                ])
            const row2 = new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setLabel(`Setup settings`)
                    .setStyle(`SECONDARY`)
                    .setEmoji(`1071622043646300240`)
                    .setCustomId(`setup_settings`),
                    new Discord.MessageButton()
                    .setLabel(`Server settings`)
                    .setStyle(`SECONDARY`)
                    .setEmoji(`1071621928382640238`)
                    .setCustomId(`server_settings`),
                ])


            await interaction.reply({
                content: `${client.config.emojis.settings} Here are your **user settings** here you can manage and view your settings!`,
                components: [row, row2],
                ephemeral: true
            })
        }
    }

    if (commandName === 'admin') {
        var {
            PermConfig
        } = require("azury-perms"); // Install our package

        // if(!interaction.member.permissions.has(`ADMINISTRATOR`)) return interaction.reply({content:""+ client.config.emojis.error +" You need to have the ADMINISTRATOR to use this command!", ephemeral: true });

        let adminCheck = await PermConfig.checkUserPerms(interaction, "PERM", false, 0, "ADMINISTRATOR")

        if (adminCheck === false) {
            return interaction.reply({
                content: "You need perms k!",
                ephemeral: true
            })
        }

        if (interaction.options.getSubcommand() === "application") {

            // PermConfig.checkUserPerms(interaction, "PERM", false, 0, "nah" )


            //let check = await PermConfig.addUserPerms(interaction, "ARRAY", true, client.config.settings.developers, "0", "nothing", `${giveaway}`, "mongodb+srv://euni_az3:Cf32JT3XvOwCPhgA@cluster0.wuqry0o.mongodb.net/cactus_canary&ssl=true", "x.participants")

            interaction.reply({
                content: "  ```js\n hasPerms: false,\n errMsg: errMsg || 'You are not in the list!',\n userInfo: `${interaction.user.username} (${interaction.user.id})` ```  ",
                ephemeral: true
            })

            // The Mongodb Array is the last part of the array system!

            //let check = await PermConfig.checkUserPerms(interaction, "LIST", true, client.config.settings.developers, "0", `${client.config.emojis.error} You are not a developer. You can not use this cmd`)

            // if(check === false){
            //return interaction.reply({content: `${client.config.emojis.error} You are not a developer. You can not use this cmd`, ephemeral: true})
            // } 



            //if(check === true){

            //}




        }

        if (interaction.options.getSubcommand() === "giveaway") {

            const createKey = require('./randomkey.js');

            let arg1 = interaction.options.getString('time');
            let arg2 = interaction.options.getString('prize');
            let arg4 = interaction.options.getString('description');
            let arg3 = interaction.options.getInteger('winners');

            if (!arg1 || isNaN(ms(arg1))) return interaction.reply({
                content: "" + client.config.emojis.error + " Incorrect time string, must be **`xx`h `xx`m or `xx`s**. H-hours M-minutes S-seconds",
                ephemeral: true
            });
            if (ms(arg1) < ms("1m")) return interaction.reply({
                content: "" + client.config.emojis.error + " Incorrect time string, must be longer than 1 minute",
                ephemeral: true
            });

            if (arg3 < 1) return interaction.reply({
                content: "" + client.config.emojis.error + " Incorrect winners count, must be 1 or more",
                ephemeral: true
            });

            const key = createKey();



            console.log(`gw : ` + String(Date.now() + ms(arg1)))




            const embed = new Discord.MessageEmbed()
                .setColor(client.color)
                .setDescription(arg4 || `Invalid text`)
                .addField(`Winners`, `\`\`\`${arg3}\`\`\``, true)
                .addField(`Prize`, `\`\`\`${arg2}\`\`\``, true)
                .addField(`Ends at`, `<t:${Math.floor((Date.now() + ms(arg1)) / 1000)}:F>`)
                .setFooter(`Hosted by: ${interaction.user.tag}`)




            interaction.channel.send({
                content: `${client.config.emojis.giveaway} **GIVEAWAY HAS STARTED** ${client.config.emojis.giveaway}`,
                embeds: [embed]
            }).then(async (m) => {

                const row = new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                        .setLabel(`Enter giveaway (0)`)
                        .setStyle(`SECONDARY`)
                        .setEmoji(client.config.emojis.giveaway)
                        .setCustomId(`giveaway_e_${m.id}`),
                        new Discord.MessageButton()
                        .setLabel(`Participants`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`giveaway_p_${m.id}`),
                    ])

                m.edit({
                    components: [row]
                })

                interaction.reply({
                    content: `${client.config.emojis.correct} Created the giveaway in this channel!`,
                    ephemeral: true
                });

                const arrays = {
                    id: m.id,
                    guild: interaction.guild.id,
                    creator: interaction.user.id,
                    channel: interaction.channel.id,
                    message: m.id,
                    url: m.url,
                    time: String(Date.now() + ms(arg1)),
                    prize: arg2,
                    description: arg4,
                    winners_count: arg3,
                    status: "ACTIVE",
                };

                await (new giveaway(arrays)).save();
            })
        } else if (interaction.options.getSubcommand() === "warn") {

            let arg1 = interaction.options.getMember('user');
            let user = interaction.options.getMember('user');
            let arg2 = interaction.options.getString('reason');

            if (arg1.bot) return interaction.reply({
                content: "" + client.config.emojis.error + " A Discord-bot cannot be warned. Please try a Discord-member instead!",
                ephemeral: true
            });

            const memberPosition = arg1.roles.highest.rawPosition;
            const moderationPosition = interaction.member.roles.highest.rawPosition;

            if (user.id === interaction.guild.ownerId) return interaction.reply({
                content: "" + client.config.emojis.error + " You cannot warn " + user.user + " as they are the server owner!",
                ephemeral: true
            });

            if (moderationPosition <= memberPosition) return interaction.reply({
                content: "" + client.config.emojis.error + " You cannot warn " + user.user + " as they have a higher or equal rank to yours!",
                ephemeral: true
            });

            warns.findOne({
                guild: interaction.guild.id,
                user: arg1.user.id
            }, async (err, data) => {

                if (!data) {
                    data = new warns({
                        guild: interaction.guild.id,
                        user: arg1.user.id,
                        array: [{
                            mod: interaction.user.id,
                            reason: arg2,
                            data: dayjs(new Date()).unix(),
                            id: new_set() + "-" + new_set()
                        }]
                    })
                } else {
                    const object = {
                        mod: interaction.user.id,
                        reason: arg2,
                        data: dayjs(new Date()).unix(),
                        id: new_set() + "-" + new_set()
                    }
                    data.array.push(object)
                }
                data.save()

                interaction.reply({
                    content: `${client.config.emojis.audit} I have now warned ${user.user} for the reason of:\n>>> ${arg2}`,
                    ephemeral: true
                });


                let embed = new MessageEmbed()
                    .setAuthor('Member warned', user.user.displayAvatarURL({
                        dynamic: true
                    }))
                    .setThumbnail(user.user.displayAvatarURL({
                        dynamic: true
                    }))
                    .setColor('RED')
                    .setDescription(`<@!${user.user.id}> **${user.user.tag}** (\`${user.user.id}\`)\n\n**Reason:**\n${arg2}\n\nWarned by ${interaction.user} **${interaction.user.tag}**`)
                    .setFooter('Member Warned')
                    .setTimestamp()

                sendAudit(interaction.guild, {
                    embeds: [embed]
                })

                user.send({
                    content: `${client.config.emojis.audit} You have been warned by ${interaction.user} for the reason of:\n>>> ${arg2}`
                }).catch(async (e) => {
                    interaction.channel.send({
                        content: `${client.config.emojis.audit} ${user.user} You have been warned by **${interaction.user.username}** for the reason:\n>>> ${arg2}`
                    })
                })

                const datas = await warn_action.findOne({
                    guild: interaction.guild.id
                })

                if (datas) {
                    const action = datas.action;
                    const number = datas.number;
                    const row = new MessageActionRow()
                        .addComponents([
                            new MessageButton()
                            .setDisabled(true)
                            .setStyle(`SECONDARY`)
                            .setLabel(`Warned by ${interaction.user.tag}`)
                            .setCustomId(`aaa-a`)
                        ])

                    if (action == 'none') {

                    } else if (action == 'kick') {
                        if (Object.keys(data.array).length >= number) {
                            interaction.channel.send({
                                content: `${client.config.emojis.audit} ${user.user} Was kicked from the server for having too many warns\n\n***If they rejoin make sure to remove their warns otherwise, kick***`,
                                components: [row]
                            })
                            user.send({
                                content: `${client.config.emojis.audit} ${user.user} You were kicked from the server for having too many warns`,
                                components: [row]
                            })
                            user.kick(`Reached max warns... server action`)
                        }
                    } else if (action == 'ban') {
                        if (Object.keys(data.array).length >= number) {
                            interaction.channel.send({
                                content: `${client.config.emojis.audit} ${user.user} Was banned from the server for having too many warns\n\n***If they rejoin make sure to remove their warns otherwise, ban***`,
                                components: [row]
                            })
                            user.send({
                                content: `${client.config.emojis.audit} ${user.user} You were banned from the server for having too many warns`,
                                components: [row]
                            })
                            user.ban({
                                reason: `Reached max warns... server action`
                            })
                        }
                    }
                }
            })
        } else if (interaction.options.getSubcommand() === "kick") {

            let arg1 = interaction.options.getMember('user');
            let user = interaction.options.getMember('user');
            let arg2 = interaction.options.getString('reason');



            const memberPosition = arg1.roles.highest.rawPosition;
            const moderationPosition = interaction.member.roles.highest.rawPosition;

            if (user.id === interaction.guild.ownerId) return interaction.reply({
                content: "" + client.config.emojis.error + " You cannot kick " + user.user + " as they are the server owner!",
                ephemeral: true
            });

            if (moderationPosition <= memberPosition) return interaction.reply({
                content: "" + client.config.emojis.error + " You cannot kick " + user.user + " as they have a higher or equal rank to yours!",
                ephemeral: true
            });




            user.kick(arg2).then(async () => {

                let embed = new MessageEmbed()
                    .setAuthor('Member kicked', user.user.displayAvatarURL({
                        dynamic: true
                    }))
                    .setThumbnail(user.user.displayAvatarURL({
                        dynamic: true
                    }))
                    .setColor('RED')
                    .setDescription(`<@!${user.user.id}> **${user.user.tag}** (\`${user.user.id}\`)\n\n**Reason:**\n${arg2}\n\nKicked by ${interaction.user} **${interaction.user.tag}**`)
                    .setFooter('Member Kicked')
                    .setTimestamp()

                sendAudit(interaction.guild, {
                    embeds: [embed]
                })

                interaction.reply({
                    content: `${client.config.emojis.audit} I have now kicked ${user.user} for the reason of:\n>>> ${arg2}`,
                    ephemeral: true
                });

                user.send({
                    content: `${client.config.emojis.audit} You have been kicked by ${interaction.user} for the reason of:\n>>> ${arg2}`
                }).catch(async (e) => {
                    interaction.channel.send({
                        content: `${client.config.emojis.audit} ${user.user} You have been kicked by **${interaction.user.username}** for the reason:\n>>> ${arg2}`
                    })
                })
            }).catch(async () => {
                interaction.reply({
                    content: `${client.config.emojis.error} I could not kick ${user.user} due to not having perms`,
                    ephemeral: true
                });
            })


        } else if (interaction.options.getSubcommand() === "ban") {
            let arg1 = interaction.options.getMember("user")
            let user = interaction.options.getMember("user")
            let arg2 = interaction.options.getString("reason")

            const row = new MessageActionRow().addComponents([
                new MessageButton()
                .setLabel(`ID Ban Them`)
                .setStyle(`DANGER`)
                .setCustomId(`idban`),
            ])

            if (!arg1)
                return interaction.reply({
                    content: "" +
                        client.config.emojis.error +
                        " Seems this user isn't in the server!",
                    components: [row],
                    ephemeral: true,
                })

            const memberPosition = arg1.roles.highest.rawPosition
            const moderationPosition = interaction.member.roles.highest.rawPosition

            if (user.id === interaction.guild.ownerId)
                return interaction.reply({
                    content: "" +
                        client.config.emojis.error +
                        " You cannot ban " +
                        user.user +
                        " as they are the server owner!",
                    ephemeral: true,
                })

            if (moderationPosition <= memberPosition)
                return interaction.reply({
                    content: "" +
                        client.config.emojis.error +
                        " You cannot ban " +
                        user.user +
                        " as they have a higher or equal rank to yours!",
                    ephemeral: true,
                })

            user
                .ban({
                    reason: arg2,
                })
                .then(async () => {
                    interaction.reply({
                        content: `${client.config.emojis.audit} I have now banned ${user.user} for the reason of:\n>>> ${arg2}`,
                        ephemeral: true,
                    })

                    user
                        .send({
                            content: `${client.config.emojis.audit} You have been banned by ${interaction.user} for the reason of:\n>>> ${arg2}`,
                        })
                        .catch(async (e) => {
                            interaction.channel.send({
                                content: `${client.config.emojis.audit} ${user.user} You have been banned by **${interaction.user.username}** for the reason:\n>>> ${arg2}`,
                            })
                        })
                })
                .catch(async (e) => {
                    console.log(e)
                    interaction.reply({
                        content: `${client.config.emojis.error} I could not ban ${user.user} due to not having perms`,
                        ephemeral: true,
                    })
                })
        } else if (interaction.options.getSubcommand() === "purge") {

            let arg1 = interaction.options.getInteger('number');

            if (arg1 < 1) return interaction.reply({
                content: `${client.config.emojis.error} You cant purge **0** messages, please specify more`,
                ephemeral: true
            });

            if (arg1 > 100) return interaction.reply({
                content: `${client.config.emojis.error} You cant purge **${arg1}** messages, must be less than **100**`,
                ephemeral: true
            });


            const row = new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setLabel(`Purged by ${interaction.user.tag}`)
                    .setDisabled(true)
                    .setCustomId(`aaa`)
                    .setStyle(`SECONDARY`)
                ])

            await interaction.channel.messages.fetch({
                limit: arg1
            }).then(async messages => {
                interaction.channel.bulkDelete(messages).then(async () => {

                    interaction.reply({
                        content: `I have now cleared **${arg1}** messages in this channel`,
                        ephemeral: true
                    });
                    interaction.channel.send({
                        content: `I have now cleared **${arg1}** messages in this channel`,
                        components: [row],
                        ephemeral: true
                    }).then(async (m) => {
                        setTimeout(async () => {
                            m.delete()
                        }, 5000)
                    })
                }).catch(async (e) => {

                    interaction.reply({
                        content: `${client.config.emojis.error} I could not clear **${arg1}** messages in this channel\n\`\`\`sh\n${e}\n\`\`\``,
                        ephemeral: true
                    });
                })

            })




        } else if (interaction.options.getSubcommand() === "remoji") {
            await interaction.deferReply({
                ephemeral: true
            });

            let emoji = interaction.options.getString('emoji');
            let name = interaction.options.getString('name');

            if (emoji.length < 1) return interaction.editReply({
                content: `${client.config.emojis.error} You need to specify an emoji to add!`,
                ephemeral: true
            });




            try {
                if (emoji.startsWith("https://cdn.discordapp.com")) {
                    await message.guild.emojis.create(emoji, name || "give_name");


                    return interaction.editReply({
                        content: `${client.config.emojis.correct} Added the emoji ${emoji.toString()} with the name \`${name}\``,
                        ephemeral: true
                    });
                }

                const customEmoji = Discord.Util.parseEmoji(emoji);

                if (customEmoji.id) {
                    const link = `https://cdn.discordapp.com/emojis/${customEmoji.id}.${
          customEmoji.animated ? "gif" : "png"
        }`;

                    await interaction.guild.emojis.create(
                        `${link}`,
                        `${name || `${customEmoji.name}`}`
                    ).then(emoji => {


                        return interaction.editReply({
                            content: `${client.config.emojis.correct} Added the emoji ${emoji.toString()} with the name \`${name}\``,
                            ephemeral: true
                        });
                    });
                } else {
                    const foundEmoji = parse(emoji, {
                        assetType: "png"
                    });
                    if (!foundEmoji[0]) {

                        return interaction.editReply({
                            content: `${client.config.emojis.error} Please provide a valid emoji!`,
                            ephemeral: true
                        });
                    }

                    interaction.editReply({
                        content: `${client.config.emojis.error} This is a normal discord emoji so I can't add it!`,
                        ephemeral: true
                    });
                }
            } catch (e) {
                console.log(e)
                return interaction.editReply({
                    content: `${client.config.emojis.error} An error occured while adding the emoji!`,
                    ephemeral: true
                });

            }



        }


    }
});

setInterval(async () => {
    const allGiveaways = await giveaway.find({
        status: "ACTIVE"
    })
    allGiveaways.forEach(async giveaways => {
        if (Date.now() >= ms(giveaways.time)) {
            let winners = [];
            const guild = await client.guilds.fetch(giveaways.guild).catch(() => {});
            if (!guild) return await giveaway.updateOne({
                id: giveaways.id
            }, {
                status: "CANCELLED"
            });
            const channel = guild.channels.cache.get(giveaways.channel);
            let participants = giveaways.participants.filter(user => client.users.cache.get(user));

            if (participants.length == 0) {
                await giveaway.updateOne({
                    id: giveaways.id
                }, {
                    status: "CANCELLED"
                });
                await channel.messages.fetch(giveaways.message).then(async (message) => {
                    const row = new Discord.MessageActionRow()
                        .addComponents([
                            new Discord.MessageButton()
                            .setLabel(`Enter giveaway (${giveaways.enters||0})`)
                            .setStyle(`SECONDARY`)
                            .setEmoji(client.config.emojis.giveaway)
                            .setCustomId(`giveaway_e_ended`)
                            .setDisabled(true),
                            new Discord.MessageButton()
                            .setLabel(`Reroll`)
                            .setStyle(`SECONDARY`)
                            .setEmoji(client.config.emojis.reroll)
                            .setCustomId(`giveaway_r_ended`)
                            .setDisabled(true)
                        ])
                    message.edit({
                        content: `${client.config.emojis.giveaway} **GIVEAWAY HAS BEEN CANCELLED** ${client.config.emojis.giveaway}`,
                        components: [row]
                    })
                });
                return channel.send({
                    content: `${client.config.emojis.error} Giveaway cancelled, not enough reacted.`
                });
            }
            if (participants.length < Number(giveaways.winners_count)) {
                await giveaway.updateOne({
                    id: giveaways.id
                }, {
                    status: "CANCELLED"
                });
                await channel.messages.fetch(giveaways.message).then(async (message) => {
                    const row = new Discord.MessageActionRow()
                        .addComponents([
                            new Discord.MessageButton()
                            .setLabel(`Enter giveaway (${giveaways.enters||0})`)
                            .setStyle(`SECONDARY`)
                            .setEmoji(client.config.emojis.giveaway)
                            .setCustomId(`giveaway_e_ended`)
                            .setDisabled(true),
                            new Discord.MessageButton()
                            .setLabel(`Reroll`)
                            .setStyle(`SECONDARY`)
                            .setEmoji(client.config.emojis.reroll)
                            .setCustomId(`giveaway_r_ended`)
                            .setDisabled(true)
                        ])
                    message.edit({
                        content: `${client.config.emojis.giveaway} **GIVEAWAY HAS BEEN CANCELLED** ${client.config.emojis.giveaway}`,
                        components: [row]
                    })
                });
                return channel.send({
                    content: `${client.config.emojis.error} Giveaway cancelled, not enough reacted.`
                });
            }

            for (let i = 0; i < Number(giveaways.winners_count); i++) {
                const winner = participants[Math.floor(Math.random() * participants.length)];
                if (!winner) return;
                participants = participants.filter(item => item !== winner);
                winners.push(winner);

                if (i == (Number(giveaways.winners_count) - 1)) {
                    winners.forEach(async (_winner, _index) => {
                        if (!_winner) return winners[_index] = undefined;
                        const member = await guild.members.fetch(_winner).catch(() => {});
                        const urlrow = new Discord.MessageActionRow()
                            .addComponents([
                                new Discord.MessageButton()
                                .setLabel(`View giveaway`)
                                .setStyle(`LINK`)
                                .setURL(giveaways.url)
                            ])
                        member.send({
                            content: `${client.config.emojis.giveaway} You won the prize: ${giveaways.prize}`,
                            components: [urlrow]
                        }).catch(() => {});
                        if (!member) return winners[_index] = undefined;
                        winners[_index] = member.user || {};

                    })

                    const urlrow = new Discord.MessageActionRow()
                        .addComponents([
                            new Discord.MessageButton()
                            .setLabel(`View giveaway`)
                            .setStyle(`LINK`)
                            .setURL(giveaways.url)
                        ])

                    await giveaway.updateOne({
                        id: giveaways.id
                    }, {
                        status: "FINISHED",
                        winners: winners.map(_w => ({
                            id: _w.id,
                            avatar: _w.avatar,
                            username: _w.username + "#" + _w.discriminator
                        }))
                    }).then(async () => {
                        console.log(`edited giveaway db`)
                    });


                    channel.send({
                        content: `${client.config.emojis.giveaway} ${winners.map(_w => "<@" + _w.id + ">").join(", ")} has won the giveaway for: ${giveaways.prize}`,
                        components: [urlrow]
                    })

                    await channel.messages.fetch(giveaways.message).then(async (message) => {
                        const row = new Discord.MessageActionRow()
                            .addComponents([
                                new Discord.MessageButton()
                                .setLabel(`Enter giveaway (${giveaways.enters||0})`)
                                .setStyle(`SECONDARY`)
                                .setEmoji(client.config.emojis.giveaway)
                                .setCustomId(`giveaway_e_ended`)
                                .setDisabled(true),
                                new Discord.MessageButton()
                                .setLabel(`Reroll`)
                                .setStyle(`SECONDARY`)
                                .setEmoji(client.config.emojis.reroll)
                                .setCustomId(`giveaway_r_${giveaways.id}`)
                            ])
                        message.edit({
                            content: `${client.config.emojis.giveaway} **GIVEAWAY HAS ENDED** ${client.config.emojis.giveaway}`,
                            components: [row]
                        })
                    })


                }

            }
        }

    })
    //-----------------------------------------
    const allRemindersd = await gpt.find()
    allRemindersd.forEach(async reminder => {
        if (reminder.type == 'GPT') {
            if (Date.now() >= ms(reminder.date)) {
                const creator = client.users.cache.get(reminder.userId);
                if (!creator) await gpt.deleteOne({
                    userId: reminder.userId,
                    prompt: reminder.prompt,
                    date: reminder.date,
                    type: 'GPT'
                });

                if (reminder.blacklisted) {
                    if (reminder.blacklisted == 'true') return;
                }

                creator.send({
                    content: `Your </utility gpt:1067552679355764817> prompts have been refilled as it's a new month!\n\n***Make sure to use the 13 of them wisely ;)***`
                }).catch(async (e) => {


                })
                await gpt.deleteOne({
                    userId: reminder.userId,
                    prompt: reminder.prompt,
                    date: reminder.date,
                    type: 'GPT'
                }).then(async () => {
                    console.log(`deleted promot (${reminder.userId}) db`)
                });
            }
        } else if (reminder.type == 'DALLE') {
            if (Date.now() >= ms(reminder.date)) {
                const creator = client.users.cache.get(reminder.userId);
                if (!creator) await gpt.deleteOne({
                    userId: reminder.userId,
                    prompt: reminder.prompt,
                    date: reminder.date,
                    type: 'DALLE'
                });

                if (reminder.blacklisted) {
                    if (reminder.blacklisted == 'true') return;
                }

                creator.send({
                    content: `Your </utility dalle:1067552679355764817> prompts have been refilled as it's a new month!\n\n***Make sure to use the 13 of them wisely ;)***`
                }).catch(async (e) => {


                })
                await gpt.deleteOne({
                    userId: reminder.userId,
                    prompt: reminder.prompt,
                    date: reminder.date,
                    type: 'DALLE'
                }).then(async () => {
                    console.log(`deleted promot (${reminder.userId}) db`)
                });
            }
        } else if (reminder.type == 'HELPER') {
            if (Date.now() >= ms(reminder.date)) {
                const creator = client.users.cache.get(reminder.userId);
                if (!creator) await gpt.deleteOne({
                    userId: reminder.userId,
                    prompt: reminder.prompt,
                    date: reminder.date,
                    type: 'HELPER'
                });

                if (reminder.blacklisted) {
                    if (reminder.blacklisted == 'true') return;
                }

                creator.send({
                    content: `Your **5** prompts for <#1071537322962722836> has been replenished! Use them wisely ;)`
                }).catch(async (e) => {


                })


                await gpt.deleteOne({
                    userId: reminder.userId,
                    prompt: reminder.prompt,
                    date: reminder.date,
                    type: 'HELPER'
                }).then(async () => {
                    console.log(`deleted promot (${reminder.userId}) db`)
                });
            }
        }
    })

    const allReminders = await remind.find({
        status: "ACTIVE"
    })
    allReminders.forEach(async reminder => {
        if (Date.now() >= ms(reminder.time)) {
            const creator = client.users.cache.get(reminder.creator);
            if (!creator) await remind.deleteOne({
                creator: reminder.creator,
                time: reminder.time,
                status: "ACTIVE",
                channel: reminder.channel,
                text: reminder.text
            });

            creator.send({
                content: `${client.config.emojis.reminder} Here is your reminder for:\n\n${reminder.text||"No context provided or I couldn't save it!"}`
            }).catch(async (e) => {
                const channel = client.channels.cache.get(reminder.channel)
                if (!channel) console.log(channel)
                if (channel) {

                    channel.send({
                        content: `${creator}\n${client.config.emojis.reminder} Here is your reminder for:\n\n${reminder.text||"No context provided or I couldn't save it!"}`
                    }).catch(async () => {})

                }

            })
            await remind.deleteOne({
                creator: reminder.creator,
                time: reminder.time,
                status: "ACTIVE",
                channel: reminder.channel,
                text: reminder.text
            }).then(async () => {
                console.log(`deleted reminder db`)
            });
        }
    })
}, 5000)

client.on('modalSubmit', async (modal, interaction) => {
    if (modal.customId == "idban") {
        await modal.deferReply({
            ephemeral: true,
        })
        const id = modal.getTextInputValue(`id`)

        modal.guild.members
            .ban(id, {
                reason: `Ban by: ${modal.user.id}`,
            })
            .then((ban) => {
                modal.editReply({
                    content: `Banned the user!`,
                    components: [],
                    ephemeral: true,
                })
                return modal.channel.send(
                    `${client.config.emojis.audit} I have ID Banned the userId **${id}** done by ${modal.user}`
                )
            })
            .catch(async (e) => {
                return modal.editReply({
                    content: `Could not ban the user!`,
                    components: [],
                    ephemeral: true,
                })
            })
    }
    if (modal.customId.startsWith('msg_ ')) {

        await modal.deferReply({
            ephemeral: true
        });


        const timestamp = modal.customId.replace('msg_ ', '')

        const desc = modal.getTextInputValue(`timestamp_msg`)

        if (!desc.includes('{timestamp}')) {
            return modal.editReply({
                content: `${client.config.emojis.error} You need to include \`{timestamp}\` in the modal please!`,
                ephemeral: true
            })
        }

        const descrip = desc.replace('{timestamp}', `${timestamp}`).replace('\n', '')
        const descrip2 = desc.replace('{timestamp}', `\`${timestamp}\``).replace('\n', '')

        const descs = desc.replace('{timestamp}', `!$!${timestamp}!%!`).replace('\n', '')




        if (descrip.length < 100) {
            const row = new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setLabel(`Code version`)
                    .setStyle(`SECONDARY`)
                    .setEmoji(client.config.emojis.ping)
                    .setCustomId(`edit1_${descs}`)
                ])
            modal.editReply({
                content: descrip,
                components: [row],
                ephemeral: true
            })
        } else {
            modal.editReply({
                content: descrip2,
                components: [],
                ephemeral: true
            })
        }

    }
    if (modal.customId.startsWith('giveaway_r_')) {

        const gid = modal.customId.replace('giveaway_r_', '');

        const count = modal.getTextInputValue(`winners_count`)

        if (!count || isNaN(count)) return modal.reply({
            content: `${client.config.emojis.error} Invalid winners count!`,
            ephemeral: true
        })

        if (count < 1) return modal.reply({
            content: `${client.config.emojis.error} Invalid winners count. Must be higher than or equal to 1!`,
            ephemeral: true
        })

        const data = await giveaway.findOne({
            id: gid,
            participants: modal.user.id
        })

        const data_ = await giveaway.findOne({
            id: gid,
            guild: modal.guild.id
        })

        if (!data_) return modal.reply({
            content: `${client.config.emojis.error} Invalid giveaway has been used!`,
            ephemeral: true
        })
        if (data_.status == "ACTIVE") return modal.reply({
            content: `${client.config.emojis.error} Giveaway never ended!`,
            ephemeral: true
        })
        if (data_.status == "CANCELLED") return modal.reply({
            content: `${client.config.emojis.error} Giveaway was cancelled!`,
            ephemeral: true
        })




        let winners = [];
        const guild = await client.guilds.fetch(data_.guild).catch(() => {});
        if (!guild) return await giveaway.updateOne({
            id: gid
        }, {
            status: "CANCELLED"
        });
        const channel = guild.channels.cache.get(data_.channel);
        let participants = data_.participants.filter(user => client.users.cache.get(user));


        for (let i = 0; i < Number(count); i++) {
            const winner = participants[Math.floor(Math.random() * participants.length)];
            if (!winner) return;
            participants = participants.filter(item => item !== winner);
            winners.push(winner);

            if (i == (Number(count) - 1)) {
                winners.forEach(async (_winner, _index) => {
                    if (!_winner) return winners[_index] = undefined;
                    const member = await guild.members.fetch(_winner).catch(() => {});
                    const urlrow = new Discord.MessageActionRow()
                        .addComponents([
                            new Discord.MessageButton()
                            .setLabel(`View giveaway`)
                            .setStyle(`LINK`)
                            .setURL(data_.url), new Discord.MessageButton()
                            .setLabel(`Rerolled by ${modal.user.username}`)
                            .setStyle(`SECONDARY`)
                            .setCustomId(`aaa_a`)
                            .setDisabled(true),
                        ])
                    member.send({
                        content: `${client.config.emojis.reroll} You won the prize: ${data_.prize}`,
                        components: [urlrow]
                    }).catch(() => {});
                    if (!member) return winners[_index] = undefined;
                    winners[_index] = member.user || {};

                })

                const urlrow = new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                        .setLabel(`View giveaway`)
                        .setStyle(`LINK`)
                        .setURL(data_.url), new Discord.MessageButton()
                        .setLabel(`Rerolled by ${modal.user.username}`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`aaa_a`)
                        .setDisabled(true),
                    ])
                await giveaway.updateOne({
                    id: gid,
                    status: "FINISHED"
                }, {
                    rerolled: (data_.rerolled || 0) + 1,
                    winners: winners.map(_w => ({
                        id: _w.id,
                        avatar: _w.avatar,
                        username: _w.username + "#" + _w.discriminator
                    }))
                }).then(async () => {
                    modal.reply({
                        content: `${client.config.emojis.correct} You rerolled this giveaway of: ${data_.prize}`,
                        ephemeral: true
                    })
                });

                channel.send({
                    content: `${client.config.emojis.reroll} ${winners.map(_w => "<@" + _w.id + ">").join(", ")} has won the giveaway for: ${data_.prize}`,
                    components: [urlrow]
                })

                await channel.messages.fetch(data_.message).then(async (message) => {
                    const row = new Discord.MessageActionRow()
                        .addComponents([
                            new Discord.MessageButton()
                            .setLabel(`Enter giveaway (${data_.enters||0})`)
                            .setStyle(`SECONDARY`)
                            .setEmoji(client.config.emojis.giveaway)
                            .setCustomId(`giveaway_e_ended`)
                            .setDisabled(true),
                            new Discord.MessageButton()
                            .setLabel(`Reroll`)
                            .setStyle(`SECONDARY`)
                            .setEmoji(client.config.emojis.reroll)
                            .setCustomId(`giveaway_r_${gid}`)
                        ])
                    message.edit({
                        content: `${client.config.emojis.giveaway} **GIVEAWAY HAS BEEN REROLLED** ${client.config.emojis.giveaway}`,
                        components: [row]
                    })
                })



            }

        }
    }
    if (modal.customId == 'end_gw') {
        await modal.deferReply({
            ephemeral: true
        });

        const gid = modal.getTextInputValue(`giveaway_id`)



        const giveaways = await giveaway.findOne({
            status: "ACTIVE",
            id: gid
        })

        if (!giveaways) return modal.editReply({
            content: `${client.config.emojis.error} Looks like this giveaway ID doesnt exist. Please make sure you grabbed the correct ID and try again!`,
            ephemeral: true
        })

        modal.editReply({
            content: `${client.config.emojis.correct} The giveaway has been ended. If it hasnt, then please contact support at discord.gg/azury\n> ${giveaways.url}`,
            ephemeral: true
        })

        let winners = [];
        const guild = await client.guilds.fetch(giveaways.guild).catch(() => {});
        const channel = guild.channels.cache.get(giveaways.channel);
        let participants = giveaways.participants.filter(user => client.users.cache.get(user));

        if (participants.length == 0) {
            await giveaway.updateOne({
                id: giveaways.id
            }, {
                status: "CANCELLED"
            });
            await channel.messages.fetch(giveaways.message).then(async (message) => {
                const row = new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                        .setLabel(`Enter giveaway (${giveaways.enters||0})`)
                        .setStyle(`SECONDARY`)
                        .setEmoji(client.config.emojis.giveaway)
                        .setCustomId(`giveaway_e_ended`)
                        .setDisabled(true),
                        new Discord.MessageButton()
                        .setLabel(`Reroll`)
                        .setStyle(`SECONDARY`)
                        .setEmoji(client.config.emojis.reroll)
                        .setCustomId(`giveaway_r_ended`)
                        .setDisabled(true)
                    ])
                message.edit({
                    content: `${client.config.emojis.giveaway} **GIVEAWAY HAS BEEN CANCELLED EARLY** ${client.config.emojis.giveaway}`,
                    components: [row]
                })
            });
            return channel.send({
                content: `${client.config.emojis.error} Giveaway cancelled, not enough reacted.`
            });
        }
        if (participants.length < Number(giveaways.winners_count)) {
            await giveaway.updateOne({
                id: giveaways.id
            }, {
                status: "CANCELLED"
            });
            await channel.messages.fetch(giveaways.message).then(async (message) => {
                const row = new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                        .setLabel(`Enter giveaway (${giveaways.enters||0})`)
                        .setStyle(`SECONDARY`)
                        .setEmoji(client.config.emojis.giveaway)
                        .setCustomId(`giveaway_e_ended`)
                        .setDisabled(true),
                        new Discord.MessageButton()
                        .setLabel(`Reroll`)
                        .setStyle(`SECONDARY`)
                        .setEmoji(client.config.emojis.reroll)
                        .setCustomId(`giveaway_r_ended`)
                        .setDisabled(true)
                    ])
                message.edit({
                    content: `${client.config.emojis.giveaway} **GIVEAWAY HAS BEEN CANCELLED EARLY** ${client.config.emojis.giveaway}`,
                    components: [row]
                })
            });
            return channel.send({
                content: `${client.config.emojis.error} Giveaway cancelled, not enough reacted.`
            });
        }

        for (let i = 0; i < Number(giveaways.winners_count); i++) {
            const winner = participants[Math.floor(Math.random() * participants.length)];
            if (!winner) return;
            participants = participants.filter(item => item !== winner);
            winners.push(winner);

            if (i == (Number(giveaways.winners_count) - 1)) {
                winners.forEach(async (_winner, _index) => {
                    if (!_winner) return winners[_index] = undefined;
                    const member = await guild.members.fetch(_winner).catch(() => {});
                    const urlrow = new Discord.MessageActionRow()
                        .addComponents([
                            new Discord.MessageButton()
                            .setLabel(`View giveaway`)
                            .setStyle(`LINK`)
                            .setURL(giveaways.url),
                            new Discord.MessageButton()
                            .setLabel(`Ended by ${modal.user.username}`)
                            .setStyle(`SECONDARY`)
                            .setCustomId(`aaa_a`)
                            .setDisabled(true)
                        ])
                    member.send({
                        content: `${client.config.emojis.giveaway} You won the prize: ${giveaways.prize}`,
                        components: [urlrow]
                    }).catch(() => {});
                    if (!member) return winners[_index] = undefined;
                    winners[_index] = member.user || {};

                })

                const urlrow = new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                        .setLabel(`View giveaway`)
                        .setStyle(`LINK`)
                        .setURL(giveaways.url),
                        new Discord.MessageButton()
                        .setLabel(`Ended by ${modal.user.username}`)
                        .setStyle(`SECONDARY`)
                        .setCustomId(`aaa_a`)
                        .setDisabled(true)
                    ])

                await giveaway.updateOne({
                    id: giveaways.id
                }, {
                    status: "FINISHED",
                    winners: winners.map(_w => ({
                        id: _w.id,
                        avatar: _w.avatar,
                        username: _w.username + "#" + _w.discriminator
                    }))
                }).then(async () => {
                    console.log(`edited giveaway db early`)
                });


                channel.send({
                    content: `${client.config.emojis.giveaway} ${winners.map(_w => "<@" + _w.id + ">").join(", ")} has won the giveaway for: ${giveaways.prize}`,
                    components: [urlrow]
                })

                await channel.messages.fetch(giveaways.message).then(async (message) => {
                    const row = new Discord.MessageActionRow()
                        .addComponents([
                            new Discord.MessageButton()
                            .setLabel(`Enter giveaway (${giveaways.enters||0})`)
                            .setStyle(`SECONDARY`)
                            .setEmoji(client.config.emojis.giveaway)
                            .setCustomId(`giveaway_e_ended`)
                            .setDisabled(true),
                            new Discord.MessageButton()
                            .setLabel(`Reroll`)
                            .setStyle(`SECONDARY`)
                            .setEmoji(client.config.emojis.reroll)
                            .setCustomId(`giveaway_r_${giveaways.id}`)
                        ])
                    message.edit({
                        content: `${client.config.emojis.giveaway} **GIVEAWAY HAS ENDED EARLY** ${client.config.emojis.giveaway}`,
                        components: [row]
                    })
                })



            }


        }
    }
    if (modal.customId == 'add_responder') {
        await modal.deferReply({
            ephemeral: true
        });

        const keyword = modal.getTextInputValue(`keyword`)

        if (!keyword) return modal.editReply({
            content: `${client.config.emojis.error} Please provide a valid keyword`,
            ephemeral: true
        })

        const reply = modal.getTextInputValue(`reply`)



        const data = await responders.findOne({
            Guild: modal.guild.id,
            Keyword: keyword.toLowerCase()
        })
        if (data) return modal.editReply({
            content: `${client.config.emojis.error} This keyword \`${keyword}\` already exists. Delete it first if you wish to edit it's reply!`,
            ephemeral: true
        })



        await (new responders({
            Guild: modal.guild.id,
            Reply: reply,
            Keyword: keyword.toLowerCase()
        })).save();

        modal.editReply({
            content: `${client.config.emojis.message} The keyword \`${keyword.toLowerCase()}\` has been setup and replies with:\n>>> ${reply}`,
            ephemeral: true
        })


    }



    if (modal.customId == 'remove_responder') {
        await modal.deferReply({
            ephemeral: true
        });

        const keyword = modal.getTextInputValue(`keyword`)

        if (!keyword) return modal.editReply({
            content: `${client.config.emojis.error} Please provide a valid keyword`,
            ephemeral: true
        })

        const data = await responders.findOne({
            Guild: modal.guild.id,
            Keyword: keyword.toLowerCase()
        })
        if (!data) return modal.editReply({
            content: `${client.config.emojis.error} This keyword \`${keyword}\` does not exist. Add it first before you can delete it!`,
            ephemeral: true
        })

        await data.delete()

        modal.editReply({
            content: `${client.config.emojis.message} The keyword \`${keyword.toLowerCase()}\` has been deleted.`,
            ephemeral: true
        })
    }
    if (modal.customId == "edit_responder") {
        // Edit and be able to add actions to the responder function
        await modal.deferReply({
            ephemeral: true
        });

        const keyword = modal.getTextInputValue(`keyword`)

        if (!keyword) return modal.editReply({
            content: `${client.config.emojis.error} Please provide a valid keyword`,
            ephemeral: true
        })

        const reply = modal.getTextInputValue(`reply`)



        const data = await responders.findOne({
            Guild: modal.guild.id,
            Keyword: keyword.toLowerCase()
        })


        if (!data) return modal.editReply({
            content: `${client.config.emojis.error} A Responder message does not exist in this channel. Please add a new one and try again!`,
            ephemeral: true
        })




        data.delete();

        await (new responders({
            Guild: modal.guild.id,
            Reply: reply,
        })).save();


        modal.editReply({
            content: `${client.config.emojis.message} The keyword \`${keyword.toLowerCase()}\` has been setup and replies with:\n>>> ${reply}!`,
            ephemeral: true
        })




    }


    if (modal.customId == 'add_antiword') {

        await modal.deferReply({
            ephemeral: true
        });

        const keyword = modal.getTextInputValue(`keyword`)

        if (!keyword) return modal.editReply({
            content: `${client.config.emojis.error} Please provide a valid keyword`,
            ephemeral: true
        })

        const action = modal.getTextInputValue(`action`)



        if (action.toUpperCase() == "DELETE") {
            const data = await antiBadWord.findOne({
                Guild: modal.guild.id,
                Keyword: keyword.toLowerCase()
            })
            if (data) return modal.editReply({
                content: `${client.config.emojis.error} This keyword \`${keyword}\` already exists. Delete it first if you wish to edit it's reply!`,
                ephemeral: true
            })

            await (new antiBadWord({
                Guild: modal.guild.id,
                Action: action.toUpperCase(),
                Keyword: keyword.toLowerCase()
            })).save();

            modal.editReply({
                content: `${client.config.emojis.message} The keyword \`${keyword.toLowerCase()}\` has been setup and it's action is:\n>>> ${action}`,
                ephemeral: true
            })
        } else if (action.toUpperCase() == "TIMEOUT") {
            const data = await antiBadWord.findOne({
                Guild: modal.guild.id,
                Keyword: keyword.toLowerCase()
            })
            if (data) return modal.editReply({
                content: `${client.config.emojis.error} This keyword \`${keyword}\` already exists. Delete it first if you wish to edit it's reply!`,
                ephemeral: true
            })

            await (new antiBadWord({
                Guild: modal.guild.id,
                Action: action.toUpperCase(),
                Keyword: keyword.toLowerCase()
            })).save();

            modal.editReply({
                content: `${client.config.emojis.message} The keyword \`${keyword.toLowerCase()}\` has been setup and it's action is:\n>>> ${action}`,
                ephemeral: true
            })
        } else if (action.toUpperCase() == "KICK") {
            const data = await antiBadWord.findOne({
                Guild: modal.guild.id,
                Keyword: keyword.toLowerCase()
            })
            if (data) return modal.editReply({
                content: `${client.config.emojis.error} This keyword \`${keyword}\` already exists. Delete it first if you wish to edit it's reply!`,
                ephemeral: true
            })

            await (new antiBadWord({
                Guild: modal.guild.id,
                Action: action.toUpperCase(),
                Keyword: keyword.toLowerCase()
            })).save();

            modal.editReply({
                content: `${client.config.emojis.message} The keyword \`${keyword.toLowerCase()}\` has been setup and it's action is:\n>>> ${action}`,
                ephemeral: true
            })
        } else if (action.toUpperCase() == "BAN") {
            const data = await antiBadWord.findOne({
                Guild: modal.guild.id,
                Keyword: keyword.toLowerCase()
            })
            if (data) return modal.editReply({
                content: `${client.config.emojis.error} This keyword \`${keyword}\` already exists. Delete it first if you wish to edit it's reply!`,
                ephemeral: true
            })

            await (new antiBadWord({
                Guild: modal.guild.id,
                Action: action.toUpperCase(),
                Keyword: keyword.toLowerCase()
            })).save();

            modal.editReply({
                content: `${client.config.emojis.message} The keyword \`${keyword.toLowerCase()}\` has been setup and it's action is:\n>>> ${action}`,
                ephemeral: true
            })
        } else if (action.toUpperCase() == "WARN") {
            const data = await antiBadWord.findOne({
                Guild: modal.guild.id,
                Keyword: keyword.toLowerCase()
            })
            if (data) return modal.editReply({
                content: `${client.config.emojis.error} This keyword \`${keyword}\` already exists. Delete it first if you wish to edit it's reply!`,
                ephemeral: true
            })

            await (new antiBadWord({
                Guild: modal.guild.id,
                Action: action.toUpperCase(),
                Keyword: keyword.toLowerCase()
            })).save();

            modal.editReply({
                content: `${client.config.emojis.message} The keyword \`${keyword.toLowerCase()}\` has been setup and it's action is:\n>>> ${action}`,
                ephemeral: true
            })
        } else {
            return modal.editReply({
                content: `The action must be either DELETE, WARN, TIMEOUT, KICK or BAN!`,
                ephemeral: true
            })
        }



    }

    if (modal.customId == 'remove_antiword') {
        await modal.deferReply({
            ephemeral: true
        });

        const keyword = modal.getTextInputValue(`keyword`)

        if (!keyword) return modal.editReply({
            content: `${client.config.emojis.error} Please provide a valid keyword`,
            ephemeral: true
        })

        const data = await antiBadWord.findOne({
            Guild: modal.guild.id,
            Keyword: keyword.toLowerCase()
        })


        if (!data) return modal.editReply({
            content: `${client.config.emojis.error} This keyword \`${keyword}\` does not exist. Add it first before you can delete it!`,
            ephemeral: true
        })

        await data.delete()

        modal.editReply({
            content: `${client.config.emojis.message} The keyword \`${keyword.toLowerCase()}\` has been deleted.`,
            ephemeral: true
        })
    }


    if (modal.customId == 'edit_antiword') {
        // Edit and be able to add actions to the responder function
        await modal.deferReply({
            ephemeral: true
        });

        const keyword = modal.getTextInputValue(`keyword`)

        if (!keyword) return modal.editReply({
            content: `${client.config.emojis.error} Please provide a valid keyword`,
            ephemeral: true
        })

        const action = modal.getTextInputValue(`action`)

        if (action.toUpperCase() == "DELETE") {


            const data = await antiBadWord.findOne({
                Guild: modal.guild.id,
                Keyword: keyword.toLowerCase()
            })


            if (!data) return modal.editReply({
                content: `${client.config.emojis.error} A Responder message does not exist in this channel. Please add a new one and try again!`,
                ephemeral: true
            })

            data.delete();

            await (new antiBadWord({
                Guild: modal.guild.id,
                Keyword: keyword.toLowerCase(),
                Action: action,
            })).save();


            modal.editReply({
                content: `${client.config.emojis.message} The keyword \`${keyword.toLowerCase()}\` has been setup and it's action is:\n>>> ${action}!`,
                ephemeral: true
            })

        } else if (action.toUpperCase() == "TIMEOUT") {


            const data = await antiBadWord.findOne({
                Guild: modal.guild.id,
                Keyword: keyword.toLowerCase()
            })


            if (!data) return modal.editReply({
                content: `${client.config.emojis.error} A Responder message does not exist in this channel. Please add a new one and try again!`,
                ephemeral: true
            })

            data.delete();

            await (new antiBadWord({
                Guild: modal.guild.id,
                Keyword: keyword.toLowerCase(),
                Action: action,
            })).save();


            modal.editReply({
                content: `${client.config.emojis.message} The keyword \`${keyword.toLowerCase()}\` has been setup and it's action is:\n>>> ${action}!`,
                ephemeral: true
            })

        } else if (action.toUpperCase() == "KICK") {


            const data = await antiBadWord.findOne({
                Guild: modal.guild.id,
                Keyword: keyword.toLowerCase()
            })


            if (!data) return modal.editReply({
                content: `${client.config.emojis.error} A Responder message does not exist in this channel. Please add a new one and try again!`,
                ephemeral: true
            })

            data.delete();

            await (new antiBadWord({
                Guild: modal.guild.id,
                Keyword: keyword.toLowerCase(),
                Action: action,
            })).save();


            modal.editReply({
                content: `${client.config.emojis.message} The keyword \`${keyword.toLowerCase()}\` has been setup and it's action is:\n>>> ${action}!`,
                ephemeral: true
            })

        } else if (action.toUpperCase() == "BAN") {


            const data = await antiBadWord.findOne({
                Guild: modal.guild.id,
                Keyword: keyword.toLowerCase()
            })


            if (!data) return modal.editReply({
                content: `${client.config.emojis.error} A Responder message does not exist in this channel. Please add a new one and try again!`,
                ephemeral: true
            })

            data.delete();

            await (new antiBadWord({
                Guild: modal.guild.id,
                Keyword: keyword.toLowerCase(),
                Action: action,
            })).save();


            modal.editReply({
                content: `${client.config.emojis.message} The keyword \`${keyword.toLowerCase()}\` has been setup and it's action is:\n>>> ${action}!`,
                ephemeral: true
            })

        } else if (action.toUpperCase() == "WARN") {


            const data = await antiBadWord.findOne({
                Guild: modal.guild.id,
                Keyword: keyword.toLowerCase()
            })


            if (!data) return modal.editReply({
                content: `${client.config.emojis.error} A Responder message does not exist in this channel. Please add a new one and try again!`,
                ephemeral: true
            })

            data.delete();

            await (new antiBadWord({
                Guild: modal.guild.id,
                Keyword: keyword.toLowerCase(),
                Action: action,
            })).save();


            modal.editReply({
                content: `${client.config.emojis.message} The keyword \`${keyword.toLowerCase()}\` has been setup and it's action is:\n>>> ${action}!`,
                ephemeral: true
            })

        }


    }



    if (modal.customId == 'add_sticky') {
        await modal.deferReply({
            ephemeral: true
        });

        const message = modal.getTextInputValue(`message`)

        const btnH = modal.getTextInputValue(`btnHttp`)

        const btnHA = modal.getTextInputValue(`btnLabel`)

        const btnHAP = modal.getTextInputValue(`btnEmoji`)

        if (!message) return modal.editReply({
            content: `${client.config.emojis.error} Please provide a valid sticky message text`,
            ephemeral: true
        })


        if (!btnH && btnHA) {
            return modal.editReply({
                content: `${client.config.emojis.error} Please provide a valid html message text`,
                ephemeral: true
            })
        }

        if (!btnH && btnHAP) {
            return modal.editReply({
                content: `${client.config.emojis.error} Please provide a valid html message text`,
                ephemeral: true
            })
        }




        if (btnH) {
            if (!btnH.includes("https://")) {
                return modal.editReply({
                    content: `${client.config.emojis.error} Please provide a valid sticky html string`,
                    ephemeral: true
                })
            }
            if (!btnH.includes(".")) {
                return modal.editReply({
                    content: `${client.config.emojis.error} Please provide a valid sticky html string`,
                    ephemeral: true
                })
            }
        }

        if (btnHAP) {
            if (!btnHAP.includes("<")) {
                return modal.editReply({
                    content: `${client.config.emojis.error} Please provide a valid emoji (All emojis must be similar to this <:youremoji:emojiid>)`,
                    ephemeral: true
                })
            }
        }



        const data = await sticky.findOne({
            Guild: modal.guild.id,
            Channel: modal.channel.id
        })

        if (data) return modal.editReply({
            content: `${client.config.emojis.error} A sticky message already exists in this channel. Please delete the current one and try again!`,
            ephemeral: true
        })

        if (!btnH) {

            modal.channel.send({
                content: `${message||`Invalid text provided`}`
            }).then(async (m) => {

                modal.editReply({
                    content: `${client.config.emojis.message} The sticky message has been setup and its text is:\n>>> ${message}`,
                    ephemeral: true
                })

                await (new sticky({
                    Guild: modal.guild.id,
                    Channel: modal.channel.id,
                    Message: m.id,
                    Content: message,
                    Url: m.url
                })).save();


            })
        } else if (btnH) {

            if (!btnHA) {
                return modal.editReply({
                    content: `${client.config.emojis.error} A label is required in order to send the button!`,
                    ephemeral: true
                })
            }

            if (btnHAP && btnHA) {
                const btnHpA = new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                        .setLabel(`${btnHA}`)
                        .setStyle(`LINK`)
                        .setEmoji(`${btnHAP}`)
                        .setURL(`${btnH}`),
                    ])

                modal.channel.send({
                    content: `${message||`Invalid text provided`}`,
                    components: [btnHpA]
                }).catch(async (e) => {
                    modal.channel.send({
                        content: `${message||`Invalid text provided`}`,
                        components: [new MessageButton()
                            .setLabel(`${btnHA}`)
                            .setStyle(`LINK`)
                            .setURL(`${btnH}`),
                        ]
                    })
                }).then(async (m) => {

                    modal.editReply({
                        content: `${client.config.emojis.message} The sticky message has been setup and its text is (With btn):\n>>> ${message}`,
                        ephemeral: true,
                        components: [btnHpA]
                    })

                    await (new sticky({
                        Guild: modal.guild.id,
                        Channel: modal.channel.id,
                        Message: m.id,
                        Content: message,
                        BtnUrl: btnH,
                        BtnLabel: btnHA,
                        BtnEmoji: btnHAP,
                        Url: m.url
                    })).save();


                })
            }

            if (!btnHAP && btnHA) {
                const btnHp = new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                        .setLabel(`${btnHA}`)
                        .setStyle(`LINK`)
                        .setURL(`${btnH}`),
                    ])

                modal.channel.send({
                    content: `${message||`Invalid text provided`}`,
                    components: [btnHp]
                }).then(async (m) => {

                    modal.editReply({
                        content: `${client.config.emojis.message} The sticky message has been setup and text (With btn) is:\n>>> ${message} `,
                        ephemeral: true,
                        components: [btnHp]
                    })

                    await (new sticky({
                        Guild: modal.guild.id,
                        Channel: modal.channel.id,
                        Message: m.id,
                        Content: message,
                        BtnUrl: btnH,
                        BtnLabel: btnHA,
                        Url: m.url
                    })).save();


                })
            }


        }


    }

    if (modal.customId.startsWith('remove_warns_')) {
        await modal.deferReply({
            ephemeral: true
        });
        const gid = modal.customId.replace('remove_warns__', '')

        const id = modal.getTextInputValue(`warning_id`)

        const allReminders = await warns.find({
            guild: modal.guild.id,
            user: gid
        })

        const allReminders2 = await warns.findOne({
            guild: modal.guild.id,
            user: gid
        })

        if (!allReminders2) return modal.editReply({
            content: `${client.config.emojis.error} Seems like the warning of <@${gid}> with ID **${id}** does not exist!`,
            components: []
        })

        if (gid === modal.member.id) return modal.editReply({
            content: `${client.config.emojis.error} You cannot remove your own warn!`
        });

        const index = allReminders2.array.findIndex(x => x.id == id)
        if (index == -1) return modal.editReply(`${client.config.emojis.error} Seems like the warning of <@${gid}> with ID **${id}** does not exist!`)

        allReminders2.array.splice(index, 1)

        allReminders2.save()

        modal.editReply(`${client.config.emojis.correct} The warning of <@${gid}> with ID **${id}** has been removed!`)

    }

    if (modal.customId == 'edit_sticky') {
        await modal.deferReply({
            ephemeral: true
        });

        const message = modal.getTextInputValue(`message`)

        const btnH = modal.getTextInputValue(`btnHttp`)

        const btnHA = modal.getTextInputValue(`btnLabel`)

        const btnHAP = modal.getTextInputValue(`btnEmoji`)

        if (!message) return modal.editReply({
            content: `${client.config.emojis.error} Please provide a valid sticky message text`,
            ephemeral: true
        })

        if (!btnH && btnHA) {
            return modal.editReply({
                content: `${client.config.emojis.error} Please provide a valid html message text`,
                ephemeral: true
            })
        }


        if (btnH) {
            if (!btnH.includes("https://")) {
                return modal.editReply({
                    content: `${client.config.emojis.error} Please provide a valid sticky html string`,
                    ephemeral: true
                })
            }
            if (!btnH.includes(".")) {
                return modal.editReply({
                    content: `${client.config.emojis.error} Please provide a valid sticky html string`,
                    ephemeral: true
                })
            }
        }



        if (btnHAP) {
            if (!btnHAP.includes("<")) {
                return modal.editReply({
                    content: `${client.config.emojis.error} Please provide a valid emoji (All emojis must be similar to this <:youremoji:emojiid>)`,
                    ephemeral: true
                })
            }
        }



        if (!btnH && btnHAP) {
            return modal.editReply({
                content: `${client.config.emojis.error} Please provide a valid html message text`,
                ephemeral: true
            })
        }

        if (!btnH && btnHAP && btnHA) {
            return modal.editReply({
                content: `${client.config.emojis.error} Please provide a valid html message text`,
                ephemeral: true
            })
        }


        const data = await sticky.findOne({
            Guild: modal.guild.id,
            Channel: modal.channel.id
        })

        if (!data) return modal.editReply({
            content: `${client.config.emojis.error} A sticky message already does not in this channel. Please add a new one and try again!`,
            ephemeral: true
        })

        if (!btnH) {

            modal.channel.send({
                content: `${message||`Invalid text provided`}`
            }).then(async (m) => {

                modal.editReply({
                    content: `${client.config.emojis.message} The sticky message has been setup and its text is:\n>>> ${message}`,
                    ephemeral: true
                })

                client.channels.fetch(modal.channel.id).then(Channel => {
                    Channel.messages.delete(data.Message);
                });

                data.delete();

                await (new sticky({
                    Guild: modal.guild.id,
                    Channel: modal.channel.id,
                    Message: m.id,
                    Content: message,
                    Url: m.url
                })).save();


            })
        } else if (btnH) {

            if (!btnHA) {
                return modal.editReply({
                    content: `A label is required in order to send the button!`,
                    ephemeral: true
                })
            }

            if (btnHAP && btnHA) {
                const btnHpA = new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                        .setLabel(`${btnHA}`)
                        .setStyle(`LINK`)
                        .setEmoji(`${btnHAP}`)
                        .setURL(`${btnH}`),
                    ])

                modal.channel.send({
                        content: `${message||`Invalid text provided`}`,
                        components: [btnHpA]
                    }).catch(async (e) => {
                        modal.channel.send({
                            content: `${message||`Invalid text provided`}`,
                            components: [new MessageButton()
                                .setLabel(`${btnHA}`)
                                .setStyle(`LINK`)
                                .setURL(`${btnH}`),
                            ]
                        })
                    })
                    .then(async (m) => {

                        modal.editReply({
                            content: `${client.config.emojis.message} The sticky message has been setup and its text is (With btn):\n>>> ${message}`,
                            ephemeral: true,
                            components: [btnHpA]
                        })

                        client.channels.fetch(modal.channel.id).then(Channel => {
                            Channel.messages.delete(data.Message);
                        });

                        data.delete();

                        await (new sticky({
                            Guild: modal.guild.id,
                            Channel: modal.channel.id,
                            Message: m.id,
                            Content: message,
                            BtnUrl: btnH,
                            BtnLabel: btnHA,
                            BtnEmoji: btnHAP,
                            Url: m.url
                        })).save();


                    })
            }

            if (!btnHAP && btnHA) {
                const btnHp = new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                        .setLabel(`${btnHA}`)
                        .setStyle(`LINK`)
                        .setURL(`${btnH}`),
                    ])

                modal.channel.send({
                    content: `${message||`Invalid text provided`}`,
                    components: [btnHp]
                }).then(async (m) => {

                    modal.editReply({
                        content: `${client.config.emojis.message} The sticky message has been setup and text (With btn) is:\n>>> ${message} `,
                        ephemeral: true,
                        components: [btnHp]
                    })

                    client.channels.fetch(modal.channel.id).then(Channel => {
                        Channel.messages.delete(data.Message);
                    });

                    data.delete();

                    await (new sticky({
                        Guild: modal.guild.id,
                        Channel: modal.channel.id,
                        Message: m.id,
                        Content: message,
                        BtnUrl: btnH,
                        BtnLabel: btnHA,
                        Url: m.url
                    })).save();


                })
            }


        }


    }

    if (modal.customId == 'suggestion_reply') {


        const gid = modal.message.id;

        const note = modal.getTextInputValue(`note`)

        const data = await suggestion_system.findOne({
            id: gid
        })

        const user = client.users.cache.get(data.user)
        if (!user) return modal.reply({
            content: `${client.config.emojis.error} This user <@${data.user}> does not exist or isn't in the server!`,
            ephemeral: true
        })

        const embed = new MessageEmbed()
            .setAuthor(`${user.tag}`, `${user.displayAvatarURL()}`)
            .setColor(`#1ABC9C`)
            .addFields([{
                    name: `User Suggestion:`,
                    value: `${data.message}`,
                    inline: false
                },
                {
                    name: `Suggestion Replies:`,
                    value: `${note} *(${modal.user.tag})*`,
                    inline: false
                },
            ])

        await client.channels.cache.get(modal.channel.id).messages.fetch(data.id).then(async (m) => {

            modal.update({
                embeds: [embed]
            })


            user.send({
                content: `<:cactus_reply:1067594269969371146> Your suggestion was replied to by ${modal.user}\n${m.url}`
            })
        })
    }

    if (modal.customId == 'remove_sticky') {
        await modal.deferReply({
            ephemeral: true
        });

        const message = modal.getTextInputValue(`msg`)

        const data = await sticky.findOne({
            Guild: modal.guild.id,
            Channel: modal.channel.id,
            Message: message
        })

        client.channels.fetch(modal.channel.id).then(Channel => {
            Channel.messages.delete(data.Message);
        });


        if (!message) return modal.editReply({
            content: `${client.config.emojis.error} Please provide a valid message_id`,
            ephemeral: true
        })


        if (!data) return modal.editReply({
            content: `${client.config.emojis.error} This sticky message \`${message}\` does not exist. Add it first before you can delete it!`,
            ephemeral: true
        })

        await data.delete()

        modal.editReply({
            content: `${client.config.emojis.message} The sticky message \`${message}\` has been disabled.`,
            ephemeral: true
        })
    }
})

//-------------------------------------------------AUDIT LOGGER
client.on('channelDelete', function(channel) {
    if (!channel.guild) return;
    if (channel.type.includes('THREAD')) return;

    let embed = new MessageEmbed()
        .setDescription('**Channel Deleted!**')
        .addField('Name', '**#' + channel.name + '**')
        .addField('Type', `**${channelType(channel.type)}**`)
        .setColor('RED')
        .setFooter('Channel ID: ' + channel.id)
        .setTimestamp()

    return sendAudit(channel.guild, {
        embeds: [embed]
    })
});

client.on('channelUpdate', function(oldChannel, newChannel) {
    if (!newChannel.guild) return;

    let embed = new MessageEmbed()
        .setColor('BLUE')
        .setTimestamp()
        .setDescription(`**${newChannel} has been Updated!**`)

    if (oldChannel.name !== newChannel.name) {
        embed.addField('Renamed', `**${oldChannel.name}\u2000➡️\u2000${newChannel.name}**`)
    }



    if (oldChannel.topic !== newChannel.topic) {
        let oldTopic = oldChannel.topic?.length > 500 ? format(oldChannel.topic, 490) : oldChannel.topic;
        let newTopic = newChannel.topic?.length > 500 ? format(newChannel.topic, 490) : newChannel.topic;

        embed.addField('Topic',
            `\`${oldTopic === null ? 'None' : oldTopic}\`\u2000➡️\u2000\`${newTopic === null ? 'None' : newTopic}\``
        )
    }

    if (oldChannel.parent !== newChannel.parent) {
        embed.addField('Category',
            `**${oldChannel.parent.name}\u2000➡️\u2000${newChannel.parent.name}**`
        )
    }

    if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
        let oldsm = oldChannel.rateLimitPerUser === 0 ? 'Off' : oldChannel.rateLimitPerUser + 'seconds';
        let newsm = newChannel.rateLimitPerUser === 0 ? 'Off' : newChannel.rateLimitPerUser + 'seconds';

        embed.addField('Slowmode', `**${oldsm}\u2000➡️\u2000${newsm}**`)
    }

    if (oldChannel.bitrate !== newChannel.bitrate) {
        embed.addField('Bitrate',
            `**${oldChannel.bitrate/1000}kbps\u2000➡️\u2000${newChannel.bitrate/1000}kbps**`
        )
    }

    if (oldChannel.userLimit !== newChannel.userLimit) {
        embed.addField('User Limit',
            `**${oldChannel.userLimit || 'Unlimited'} Users\u2000➡️\u2000${newChannel.userLimit || 'Unlimited'} Users**`
        )
    }

    if (embed.fields.length === 0) return;
    return sendAudit(newChannel.guild, {
        embeds: [embed]
    })
});

client.on('guildUpdate', function(oldGuild, newGuild) {

    let embed = new MessageEmbed()
        .setDescription('**Server Information Updated!**')
        .setColor('ORANGE')
        .setTimestamp()
        .setThumbnail(newGuild.iconURL())

    if (oldGuild.iconURL() !== newGuild.iconURL()) {
        embed.addField('Icon', `[**\[Before\]**](${oldGuild.iconURL()})\u2000➡️\u2000[**\[After\]**](${newGuild.iconURL()})`)
    }

    if (oldGuild.name !== newGuild.name) {
        embed.addField('Name', `**\`${oldGuild.name}\`\u2000➡️\u2000\`${newGuild.name}\`**`)
    }

    if (oldGuild.afkTimeout !== newGuild.afkTimeout) {
        embed.addField('Afk Timeout', `**${oldGuild.afkTimeout/60} minutes\u2000➡️\u2000${newGuild.afkTimeout/60} minutes**`)
    }

    if (oldGuild.afkChannel !== newGuild.afkChannel) {
        embed.addField('Afk Channel', `**<#${oldGuild.afkChannel.id}>\u2000➡️\u2000<#${newGuild.afkChannel.id}>**`)
    }

    if (!embed.fields.length) return;
    return sendAudit(newMember.guild, {
        embeds: embeds
    })
});

client.on('messageUpdate', async function(oldMessage, newMessage) {
    if (oldMessage.author.bot || !oldMessage.guild) return;
    if (newMessage.channel.id == "1056328837388054631") return;

    let oldMsg = oldMessage.content?.length > 500 ? format(oldMessage.content, 500) : oldMessage.content;
    let newMsg = newMessage.content?.length > 500 ? format(newMessage.content, 490) : newMessage.content;

    let embed = new MessageEmbed()
        .setColor('ORANGE')
        .setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL({
            dynamic: true
        }))
        .setDescription(`**Message edit in <#${oldMessage.channel.id}> - [Jump to Message](${newMessage.url})**`)
        .setFooter(`User ID: ${newMessage.author.id}`)
        .addField('Old Message', oldMsg || 'Message has no content.')
        .addField('New Message', newMsg || 'Message has no content.')
        .setTimestamp()


    if (oldMessage.mentions.everyone !== newMessage.mentions.everyone) {
        embed.addField('Mentions Everyone', `**${oldMessage.mentions.everyone ? 'Yes' : 'No'}\u2000➡️\u2000${newMessage.mentions.everyone ? 'Yes' : 'No'}**`)
    }

    let files = '';
    if (oldMessage.attachments.size > newMessage.attachments.size) {
        oldMessage.attachments.forEach(image => {
            files += `[${image.name}](${image.url}) [**Alt Link**](${image.proxyURL})\n`
        })
        embed.setImage(oldMessage.attachments.first().url)
        embed.addField('Removed Attachments', files)
    }

    if (oldMessage.attachments.size < newMessage.attachments.size) {
        newMessage.attachments.forEach(image => {
            files += `[${image.name}](${image.url}) [**Alt Link**](${image.proxyURL})\n`
        })
        embed.setImage(newMessage.attachments.first().url)
        embed.addField('Added Attachments', files)
    }


    if (oldMessage.content === newMessage.content && embed.fields.length === 2) return;
    return sendAudit(newMessage.guild, {
        embeds: [embed]
    })
});

client.on('roleUpdate', function(oldRole, newRole) {

    let embed = new MessageEmbed()
        .setColor('ORANGE')
        .setAuthor(oldRole.guild.name, oldRole.guild.iconURL())
        .setDescription(`**Role updated: <@&${oldRole.id}>**`)
        .setFooter(`Role ID: ${oldRole.id}`)
        .setTimestamp()

    if (oldRole.name !== newRole.name) {
        embed.addField('Name', `**${oldRole.name}\u2000➡️\u2000${newRole.name}**`)
    }

    if (oldRole.hexColor !== newRole.hexColor) {
        embed.setColor(newRole.hexColor)
        embed.addField('Color', `**${oldRole.hexColor}\u2000➡️\u2000${newRole.hexColor}**`)
    }

    if (oldRole.hoist !== newRole.hoist) {
        embed.addField('Hoisted', `${oldRole.hoist ? '`Yes`' : '`No`'}\u2000➡️\u2000${newRole.hoist ? '`Yes`' : '`No`'}`)
    }

    if (oldRole.mentionable !== newRole.mentionable) {
        embed.addField('Hoisted', `${oldRole.mentionable ? '`Yes`' : '`No`'}\u2000➡️\u2000${newRole.mentionable ? '`Yes`' : '`No`'}`)
    }

    let added_perms = [];
    let removed_perms = [];
    oldRole.permissions.toArray().forEach(perm => {
        if (!newRole.permissions.has(perm)) {
            removed_perms.push(perm)
        }
    })
    newRole.permissions.toArray().forEach(perm => {
        if (!oldRole.permissions.has(perm)) {
            added_perms.push(perm)
        }
    })

    if (added_perms.length) {
        embed.addField('Allowed Permissions', added_perms.map(p => p.replace(/_/g, ' ').toLowerCase()).join(', '))
    }

    if (removed_perms.length) {
        embed.addField('Denied Permissions', removed_perms.map(p => p.replace(/_/g, ' ').toLowerCase()).join(', '))
    }

    if (!embed.fields.length) return;
    return sendAudit(oldRole.guild, {
        embeds: [embed]
    })
});

client.on('guildMemberUpdate', function(oldMember, newMember) {
    if (oldMember.bot || newMember.bot || oldMember.equals(newMember)) return;

    let embeds = [];
    let oldAvatar = oldMember.user.displayAvatarURL({
        dynamic: true
    })
    let newAvatar = newMember.user.displayAvatarURL({
        dynamic: true
    })

    let embed = new MessageEmbed()
        .setColor('ORANGE')
        .setTimestamp()
        .setAuthor(oldMember.user.tag, oldAvatar)
        .setDescription(`**<@!${newMember.user.id}> updated their profile!**`)

    if (oldAvatar !== newAvatar) {
        embed.addField('Avatar',
            `[**\[Before\]**](${oldAvatar})\u2000➡️\u2000[**\[After\]**](${newAvatar})`
        )
    }

    if (oldMember.user.username !== newMember.user.username) {
        embed.addField('Name',
            `**\`${oldMember.user.username}\`\u2000➡️\u2000\`${newMember.user.username}\`**`
        )
    }

    if (oldMember.user.discriminator !== newMember.user.discriminator) {
        embed.addField('Discriminator',
            `**#${oldMember.user.discriminator}\u2000➡️\u2000#${newMember.user.discriminator}**`
        )
    }
    if (embed.fields.length) embeds.push(embed)


    if (oldMember.nickname !== newMember.nickname) {

        embed.fields = [];
        embed.setDescription(`**<@!${newMember.user.id}> Nickname changed**`)
        embed.addField('Old nickname', `\`${oldMember.nickname || 'None'}\``)
        embed.addField('New nickname', `\`${newMember.nickname || 'None'}\``)
        embeds.push(embed)
    }

    if (oldMember.roles.cache.size > newMember.roles.cache.size) {
        let embed = new MessageEmbed()
            .setColor('RED')
            .setAuthor(oldMember.user.tag, oldAvatar)
            .setDescription(`**<@!${newMember.user.id}> roles have changed!**`)
            .setThumbnail(oldAvatar)
            .setTimestamp()

        let roles = [];
        oldMember.roles.cache.forEach(role => {
            if (!newMember.roles.cache.has(role.id)) {
                roles.push('`' + role.name + '`')
            }
        })
        embed.addField('Removed Roles', `**${roles.join(', ')}**`)
        embeds.push(embed)
    }

    if (oldMember.roles.cache.size < newMember.roles.cache.size) {
        let embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor(oldMember.user.tag, oldAvatar)
            .setDescription(`**<@!${newMember.user.id}> roles have changed!**`)
            .setThumbnail(oldAvatar)
            .setTimestamp()

        let roles = [];
        newMember.roles.cache.forEach(role => {
            if (!oldMember.roles.cache.has(role.id)) {
                roles.push('`' + role.name + '`')
            }
        })
        embed.addField('Added Roles', `**${roles.join(', ')}**`)
        embeds.push(embed)
    }

    if (!embeds.length) return;
    return sendAudit(newMember.guild, {
        embeds: embeds
    })
});

client.on('channelPinsUpdate', function(channel, time) {
    if (!channel.guild) return;

    let embed = new MessageEmbed()
        .setColor('BLUE')
        .setFooter('Channel ID: ' + channel.id)
        .setTimestamp()
        .setDescription(
            `**Pins Updated\n\nPins of the \`#${channel.name}\` got updated at** <t:${dayjs(time).unix()}:R>**.**`
        )

    return sendAudit(channel.guild, {
        embeds: [embed]
    })
});


client.on('emojiCreate', function(emoji) {

    let embed = new MessageEmbed()
        .setColor('GREEN')
        .setDescription(
            `**Server Emoji Added!\n\nWe have new emoji in the server (${emoji})\u2000\`:${emoji.name}:\`**`
        )
        .setFooter(emoji.guild.name)
        .setTimestamp()

    return sendAudit(emoji.guild, {
        embeds: [embed]
    })
});


client.on('emojiDelete', function(emoji) {
    let name = `emoji${emoji.animated ? '.gif' : '.png'}`
    let attachment = new MessageAttachment(emoji.url, name)

    let embed = new MessageEmbed()
        .setColor('RED')
        .setDescription(
            `**Server Emoji Removed!\n\nEmoji \`${emoji.name}\` got removed from the server.**`
        )
        .setFooter(emoji.guild.name)
        .setThumbnail(`attachment://${name}`)
        .setTimestamp()

    return sendAudit(emoji.guild, {
        embeds: [embed]
    })
});


client.on('emojiUpdate', function(oldEmoji, newEmoji) {

    let embed = new MessageEmbed()
        .setColor('ORANGE')
        .setDescription(`**Server Emoji Name Updated!**`)
        .addField('Before', `**\`${oldEmoji.name}\`**`, true)
        .addField('After', `**\`${newEmoji.name}\`**`, true)
        .setTimestamp()

    return sendAudit(newEmoji.guild, {
        embeds: [embed]
    })
});


client.on('guildBanAdd', function(guild, member) {

    let embed = new MessageEmbed()
        .setAuthor('Member Banned', member.user.displayAvatarURL({
            dynamic: true
        }))
        .setThumbnail(member.user.displayAvatarURL({
            dynamic: true
        }))
        .setDescription(
            `**${member.user.username} (\`${member.user.id}\`) is now banned from the server.**`
        )
        .setFooter('User ID: ' + member.user.id)
        .setColor('RED')
        .setTimestamp()

    return sendAudit(guild, {
        embeds: [embed]
    })
});


client.on('guildBanRemove', function(guild, member) {

    let embed = new MessageEmbed()
        .setAuthor('Member Unbanned', member.user.displayAvatarURL({
            dynamic: true
        }))
        .setThumbnail(member.user.displayAvatarURL({
            dynamic: true
        }))
        .setDescription(
            `**${member.user.username}(\`${member.user.id}\`) is now unbanned from the server.**`
        )
        .setFooter('User ID: ' + member.user.id)
        .setColor('PURPLE')
        .setTimestamp()

    return sendAudit(guild, {
        embeds: [embed]
    })
});


client.on('guildMemberAdd', function(member) {
    let time = dayjs(member.user.createdAt).unix();

    let embed = new MessageEmbed()
        .setAuthor('Member Joined', member.user.displayAvatarURL({
            dynamic: true
        }))
        .setThumbnail(member.user.displayAvatarURL({
            dynamic: true
        }))
        .setColor('GREEN')
        .setDescription(`<@!${member.user.id}> **${member.user.tag}** (\`${member.id}\`)`)
        .addField('Created At', `<t:${time}:D>\u2000(<t:${time}:R>)`)
        .setFooter('Member Joined')
        .setTimestamp()


    return sendAudit(member.guild, {
        embeds: [embed]
    })
});


client.on('guildMemberRemove', function(member) {
    let time = dayjs(member.user.createdAt).unix();

    let embed = new MessageEmbed()
        .setAuthor('Member Left', member.user.displayAvatarURL({
            dynamic: true
        }))
        .setThumbnail(member.user.displayAvatarURL({
            dynamic: true
        }))
        .setColor('RED')
        .setDescription(`<@!${member.user.id}> **${member.user.tag}** (\`${member.id}\`)`)
        .addField('Created At', `<t:${time}:D>\u2000(<t:${time}:R>)`)
        //.addField('Roles', member.roles.cache.filter(f => f.name !== '@everyone').map(r => `<@&${r.id}>`).join(' '))
        .setFooter('Member Left')
        .setTimestamp()

    return sendAudit(member.guild, {
        embeds: [embed]
    })
});


client.on('guildMembersChunk', function(members, guild) {

    let embed = new MessageEmbed()
        .setAuthor('Alert: Member Chunk Received!')
        .setColor('YELLOW')
        .setDescription(
            `**A large number of members just joined the server from \`${guild.name}\` Guild**`
        )

    return sendAudit(members.guild, {
        embeds: [embed]
    })
});


client.on('messageDelete', async function(message) {
    if (message.author.bot || !message.guild) return;

    let embed = new MessageEmbed()
        .setColor('RED')
        .setAuthor(message.author.tag, message.author.displayAvatarURL({
            dynamic: true
        }))
        .setFooter(`Message ID: ${message.id}`)
        .setTimestamp()

    if (message.partial) {
        return sendAudit(message.guild, {
            embeds: [embed]
        })
    }

    if (message.content && message.content.length > 700) message.content = message.content.slice(0, 700) + '...';
    embed.setDescription(`**Message deleted in <#${message.channel.id}>**\n\n${message.content || '**Message has no content.**'}`)

    let files = '';
    if (message.attachments.size) {
        message.attachments.forEach(image => {
            files += `[${image.name}](${image.url}) [**Alt Link**](${image.proxyURL})\n`
        })
        embed.setImage(message.attachments.first().url)
        embed.addField('Attachments', files, true)
    }
    if (message.pinned) embed.addField('Pinned', `\`true\``, true)

    if (message.mentions.everyone) {
        embed.addField('Mentions Everyone', `**Yes**`)
    }

    return sendAudit(message.guild, {
        embeds: [embed]
    })
});


client.on('messageDeleteBulk', function(messages) {

    let embed = new MessageEmbed()
        .setColor('RED')
        .setAuthor(messages.first().guild.name, messages.first().guild.iconURL())
        .setDescription(`**Bulk Delete in <#${messages.first().channel.id}>, ${messages.size} messages deleted.**`)
        .setTimestamp()

    return sendAudit(messages.first().guild, {
        embeds: [embed]
    })
});


client.on('roleCreate', function(role) {

    let embed = new MessageEmbed()
        .setColor('GREEN')
        .setAuthor(role.guild.name, role.guild.iconURL())
        .setDescription(`**Role Created: ${role.name}**`)
        .addField('Role Color', `**${role.hexColor}**`)
        .setFooter(`Role ID: ${role.id}`)
        .setTimestamp()

    return sendAudit(role.guild, {
        embeds: [embed]
    })
});


client.on('roleDelete', function(role) {

    let embed = new MessageEmbed()
        .setColor('RED')
        .setAuthor(role.guild.name, role.guild.iconURL())
        .setDescription(`**Role Deleted: ${role.name}**`)
        .addField('Role Color', `**${role.hexColor}**`, true)
        .addField('Hoisted', role.hoist ? '`Yes`' : '`No`', true)
        .addField('Mentionable', role.mentionable ? '`Yes`' : '`No`', true)
        .setFooter(`Role ID: ${role.id}`)
        .setTimestamp()

    return sendAudit(role.guild, {
        embeds: [embed]
    })
});


function getTime(args, eph = true, arg1) {
    args = args.join(' ');
    args = ' ' + args;
    console.log("bash ./time.sh" + args);
    try {
        let output = execSync("bash ./time.sh" + args); // Reach out to the ./time.sh file
        let message;
        message = `${client.config.emojis.servers} **Generated from data \`${arg1}\`:**\n\n${client.config.emojis.timestamp} ` + output.toString() + "" + "" + client.config.emojis.timestamp2 + " `" + output.toString() + "`"
        return message;
    } catch (e) {
        console.log(e.message)
        return "" + client.config.emojis.error + " Invalid time string, check https://tinyurl.com/cactus-manual for more info";
    }
}

function getTimeButton(args, eph = true, arg1) {
    args = args.join(' ');
    args = ' ' + args;
    console.log("bash ./time.sh" + args);
    try {
        let output = execSync("bash ./time.sh" + args); // Reach out to the ./time.sh file
        let message;
        message = new Discord.MessageActionRow().addComponents([new Discord.MessageButton().setLabel(`Send as message`).setEmoji(client.config.emojis.message).setStyle(`SECONDARY`).setCustomId(`msg_${output.toString()}`)])
        return message;
    } catch (e) {
        console.log(e.message)
    }
}

async function sendAudit(guild, content) {

    const data = await audit.findOne({
        guild: guild.id
    })
    if (!data) return;

    if (!guild) return;
    if (guild.id !== data.guild) return;

    const channel = client.guilds.cache.get(data.guild).channels.cache.get(data.channel)
    if (!channel) throw new SyntaxError('LOG Channel not found!')

    const perms = channel.permissionsFor(client.user);
    if (!perms.has('MANAGE_WEBHOOKS')) throw new SyntaxError(`Audit_Logger: Missing Permission to Manage Webhooks in ${channel.name}`)

    const webhooks = await channel.fetchWebhooks();
    let webhook = webhooks.find(w => w?.owner?.id === client.user.id)

    if (!webhook) {
        webhook = await channel.createWebhook(client.user.username + `- Audits` || 'Cactus - Audits', {
            avatar: client.user.displayAvatarURL({
                dynamic: true
            }) || guild.iconURL({
                format: 'png'
            })
        }).catch(r => {})
    }

    if (!webhook) throw new SyntaxError(`Audit_Logger: Unable to create Webhook in Log Channel.`)

    webhook.send(content)
}




// Login to Discord with your client's token
client.login(process.env.TOKEN);


/*           ANTI CRASHING            ¦¦           ANTI CRASHING           */
process.on('unhandledRejection', (reason, p) => {
    console.log('\n\n\n\n\n[🚩 Anti-Crash] unhandled Rejection:'.toUpperCase());
    console.log(reason.stack ? String(reason.stack) : String(reason));
    console.log('=== unhandled Rejection ===\n\n\n\n\n'.toUpperCase());
});
process.on("uncaughtException", (err, origin) => {
    console.log('\n\n\n\n\n\n[🚩 Anti-Crash] uncaught Exception'.toUpperCase());
    console.log(err.stack ? err.stack : err)
    console.log('=== uncaught Exception ===\n\n\n\n\n'.toUpperCase());
})
process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log('[🚩 Anti-Crash] uncaught Exception Monitor'.toUpperCase());
});
process.on('beforeExit', (code) => {
    console.log('\n\n\n\n\n[🚩 Anti-Crash] before Exit'.toUpperCase());
    console.log(code);
    console.log('=== before Exit ===\n\n\n\n\n'.toUpperCase());
});

process.on('multipleResolves', (type, promise, reason) => {
    console.log('\n\n\n\n\n[🚩 Anti-Crash] multiple Resolves'.toUpperCase());
    console.log(type, promise, reason);
    console.log('=== multiple Resolves ===\n\n\n\n\n'.toUpperCase());
});