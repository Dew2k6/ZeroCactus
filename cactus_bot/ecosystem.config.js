module.exports = {
    apps: [
      {
        name: "CactusBot",
        exec_mode: "cluster",
        instances: "1",
        script: "./bot.js",
        args: "start",
        env: {
            NODE_ENV: "development",
            COLOR: "303135",
            TOKEN: "MTA2MzU3NTA1NzUwODYxODM2MA.GYjRha.0RMSpS0IA-Q68Ni_IZMhQZg9V6p4wbd19R3q_s",
          },
        env_production: {
            NODE_ENV: "production",
            COLOR: "303135",
            TOKEN: "MTA2MzU3NTA1NzUwODYxODM2MA.GYjRha.0RMSpS0IA-Q68Ni_IZMhQZg9V6p4wbd19R3q_s",
        }
      },
    ],
  };