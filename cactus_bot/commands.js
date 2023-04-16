const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { timezones } = require('./timezones.json');
const client = require(`./bot.js`);

  const token = "add-your-token-here"

const commands = [
        
        new SlashCommandBuilder()
        .setName('help')
        .setDescription('Replies with help information'),

        new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Replies with admin sub groups')
        .addSubcommand((subcommand) =>
				subcommand.setName('giveaway')
					.setDescription('Create a giveaway in this channel')
                    .addStringOption(option =>
                        option.setName('time')
                            .setRequired(true)
                            .setDescription('Enter a time string, for example: 1h, 30m, 15s')
                    )
                    .addIntegerOption(option =>
                        option.setName('winners')
                            .setRequired(true)
                            .setDescription('Choose how many winners there should be')
                            
                    )
                    .addStringOption(option =>
                        option.setName('prize')
                            .setRequired(true)
                            .setDescription('Choose what the prize should be')
                            
                    )
                    .addStringOption(option =>
                        option.setName('description')
                            .setRequired(true)
                            .setDescription('Choose what the description should be')
                            
                    ),
            )
        .addSubcommand((subcommand) =>
            subcommand.setName('warn')
                .setDescription('Warn a user for something')
                .addUserOption((option) =>
						option.setName('user')
                        .setDescription('User to warn')
                        .setRequired(true),
					)
                .addStringOption(option =>
                    option.setName('reason')
                        .setRequired(true)
                        .setDescription('Reason for warning')
                )
        )
     .addSubcommand((subcommand) =>
                subcommand.setName('kick')
                    .setDescription('Kick a user for something')
                    .addUserOption((option) =>
                            option.setName('user')
                            .setDescription('User to kick')
                            .setRequired(true),
                        )
                    .addStringOption(option =>
                        option.setName('reason')
                            .setRequired(true)
                            .setDescription('Reason for kicking')
                    )
     )
        .addSubcommand((subcommand) =>
                    subcommand.setName('ban')
                        .setDescription('Ban a user for something')
                        .addUserOption((option) =>
                                option.setName('user')
                                .setDescription('User to ban')
                                .setRequired(true),
                            )
                        .addStringOption(option =>
                            option.setName('reason')
                                .setRequired(true)
                                .setDescription('Reason for banning')
                        ),
        )
    .addSubcommand((subcommand) =>
        subcommand.setName('purge')
            .setDescription('Ban a user for something')
            .addIntegerOption((option) =>
                    option.setName('number')
                    .setDescription('Number of messages to purge')
                    .setRequired(true),
                ),
)
.addSubcommand((subcommand) =>
        subcommand.setName('remoji')
            .setDescription('Steal an emoji from another server')
            .addStringOption((option) =>
                    option.setName('emoji')
                    .setDescription('Emoji to re-mote (steal)')
                    .setRequired(true),
                )
            .addStringOption((option) =>
                option.setName('name')
                .setDescription('Name to re-mote (steal)')
                .setRequired(true),
            ),
)
  
.addSubcommand((subcommand) =>
				subcommand.setName('application')
					.setDescription('test cmd'),
            ),
  
  


  new SlashCommandBuilder()
        .setName('utility')
        .setDescription('Replies with utility sub groups')

			.addSubcommand((subcommand) =>
				subcommand.setName('calculator')
					.setDescription('Use a useful calculator'),
            )
            .addSubcommand((subcommand) =>
                subcommand.setName('remind')
					.setDescription('Create a reminder to remind yourself')
                    .addStringOption(option =>
                        option.setName('time')
                            .setRequired(true)
                            .setDescription('Enter a time string, for example: 1h, 30m, 15s')
                    )
                    .addStringOption(option =>
                        option.setName('text')
                            .setRequired(true)
                            .setDescription('Choose what you want to be reminded of')
                            
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand.setName('timestamp')
					.setDescription('Create a timestamp for dates')
                    .addStringOption(option =>
                        option.setName('time')
                            .setRequired(true)
                            .setDescription('Enter a time string, for example: now, now + 2 hours, next monday 12:00 UTC, 2021-01-01T12:00+02:00')
                    )
                    .addStringOption(option =>
                        option.setName('format')
                            .setRequired(true)
                            .setDescription('Choose how timestamp is displayed')
                            .addChoices(
                                [
                                    ['Short date/time (default)', 'f'],
                                    ['Long date/time', 'F'],
                                    ['Short time, HH:MM', 't'],
                                    ['Long time, HH:MM:SS', 'T'],
                                    ['Short date', 'd'],
                                    ['Long date', 'D'],
                                    ['Relative time', 'R'],
                                ])
                    ),
            )
            /*.addSubcommand((subcommand) =>
                subcommand.setName('gpt')
					.setDescription('Ask ChatGPT a question')
                    .addStringOption(option =>
                        option.setName('prompt')
                            .setRequired(true)
                            .setDescription('Choose what you want to ask')
                            
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand.setName('dalle')
					.setDescription('Ask Dalle to generate a image')
                    .addStringOption(option =>
                        option.setName('prompt')
                            .setRequired(true)
                            .setDescription('Choose what image to generate')
                            
                    ),
            )*/
            .addSubcommand((subcommand) =>
                subcommand.setName('translate')
					.setDescription('Translate text')
                    .addStringOption(option =>
                        option.setName('text')
                            .setRequired(true)
                            .setDescription('Enter a text to be translated')
                    )
                    .addStringOption(option =>
                        option.setName('language_to')
                            .setRequired(true)
                            .setDescription('Choose which language to translate to')
                            .addChoices(
                                [
                                    ['English', 'english'],
                                    ['Dutch', 'dutch'],
                                    ['Spanish', 'spanish'],
                                    ['French', 'french'],
                                    ['Arabian', 'arabian'],
                                    ['Hindi', 'hindi'],
                                    ['Chinese', 'chinese'],
                                    ['Arabic', 'arabic'],
                                    ['Russian', 'russian'],
                                    ['Portuguese', 'portuguese'],
                                    ['German', 'german'],
                                    ['Japanese', 'japanese'],
                                    ['Turkish', 'turkish'],
                                    ['Mandarin', 'mandarin'],
                                    ['Latvian', 'latvian'],
                                    ['Swedish', 'swedish'],
                                    ['Lithuanian', 'lithuanian'],
                                    ['Ukrainian', 'ukrainian'],
                                ])
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand.setName('aichecker')
					.setDescription('Check of a text is generated by AI')
                    .addStringOption(option =>
                        option.setName('text')
                            .setRequired(true)
                            .setDescription('Enter a text to be checked')
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand.setName('afk')
					.setDescription('Need to brb? Then use an afk status!')
                    .addStringOption(option =>
                        option.setName('reason')
                            .setRequired(true)
                            .setDescription('Choose what the afk reason should be')
                            
                    ),
            
			),


            /*new SlashCommandBuilder()
            .setName('music')
            .setDescription('Replies with music player')
    
                .addSubcommand((subcommand) =>
                    subcommand.setName('play')
                        .setDescription('Play a song off distube api')
                        .addStringOption(option =>
                            option.setName('song')
                                .setRequired(true)
                                .setDescription('Choose what song to play using distube api')
                                
                        )
                )
                        .addSubcommand((subcommand) =>
                    subcommand.setName('stop')
                        .setDescription('Stop the current playing song')  
                ),*/
            
  
  new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Replies with status information'),

  new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Replies with bot invite'),
        
  new SlashCommandBuilder()
        .setName('discord')
        .setDescription('Replies with bot support server'),

  new SlashCommandBuilder()
        .setName('guide')
        .setDescription('Replies with a guide'),

  new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Replies with settings'),
        
]
    .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

client.once('ready', async () => {
  rest.put(Routes.applicationCommands(client.user.id), { body: commands }).then(async()=> {console.log(`Successfully reloaded application (/) commands for all ${client.guilds.cache.size} guilds.`)}).catch(`SLASH ERR: `+console.error);

})


