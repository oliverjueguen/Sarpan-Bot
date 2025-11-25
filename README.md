# Sarpan-Bot – Discord Automation for Throne and Liberty

Sarpan-Bot is a custom Discord bot built for a **Throne and Liberty** guild.  
It automates **event notifications**, **in-game cycle alerts**, **voice channel actions**, and **moderation logs**, with support for **audio playback**, **scheduled jobs**, and **containerized deployment**.

---

## ✨ Features

- **Event & Schedule Automation**
  - Scheduled notifications for recurring in-game events
  - Custom messages and role mentions in specific text channels
  - Night/day cycle notifications using `node-schedule`

- **Voice Channel Integration**
  - Commands to join/leave voice channels
  - Automatic audio playback (MP3) in voice channels for event cues
  - Graceful disconnect and error handling

- **Moderation & Logging**
  - Logs for deleted messages (embeds sent to an admin channel)
  - Logs for voice state changes (users joining/leaving/moving voice channels)
  - Centralized admin channel for bot activity

- **Server Stats & Utilities**
  - Utility to update server statistics channels (total members, online, etc.)
  - Role-based access for certain features

- **Git Webhook Auto-Deploy**
  - Lightweight Express server listening for `/payload`
  - Executes `git pull` on push events for simple auto-deployment on a server

- **Container-Ready**
  - Provided `dockerfile` for running the bot in a container
  - Includes `ffmpeg` installation for voice/audio features

---

## 🏗 Architecture Overview

```mermaid
flowchart TD
    D[Discord Gateway] --> C[Discord Client (discord.js)]

    C --> CMD[Command Handler<br/>/commands/*.js]
    C --> EVT[Event Handlers<br/>ready, voiceStateUpdate, messageDelete]
    C --> SCH[Schedule Manager<br/>node-schedule]
    C --> UTIL[Utils<br/>scheduleNight, updateServerStats]
    C --> VOICE[Voice Audio Player<br/>@discordjs/voice]

    SCH --> VOICE
    SCH --> D

    EVT --> LOG[Admin Logs Channel]

    subgraph Webhook Server
      W[Express /payload] --> GP[git pull & restart flow]
    end
```

---

## 📁 Project Structure

```text
Sarpan-Bot/
├── commands/                 
│   ├── join.js               
│   ├── leave.js              
│   ├── notificationstl.js    
│   ├── saurodoma.js          
│   ├── tevent.js             
│   └── ...                   
│
├── events/
│   └── ready.js              
│
├── utils/
│   ├── scheduleManager.js    
│   ├── scheduleNight.js      
│   └── updateServerStats.js  
│
├── sounds/                   
│   ├── noche.mp3
│   ├── reve.mp3
│   └── tevent.mp3
│
├── messageDeleteHandler.js   
├── voiceStateHandler.js      
├── playAudio.js              
├── webhook.js                
│
├── sarpanbot.js              
├── package.json
├── package-lock.json
├── dockerfile                
├── .dockerignore
└── .gitignore
```

---

## ✅ Requirements

- **Node.js** `>= 18.x`  
- **npm**  
- A **Discord bot application** with privileged intents enabled  
- **ffmpeg** installed (Dockerfile already includes it)

---

## ⚙️ Configuration

Create a `.env` file:

```env
DISCORD_TOKEN=your-bot-token-here
```

IDs for channels, roles and guilds are currently hard-coded in the code.  
You can replace them manually or refactor into environment variables later.

---

## 🚀 Running Locally

```bash
npm install
node sarpanbot.js
```

---

## 🌐 Webhook Auto-Deploy Server

```bash
node webhook.js
```

Configure GitHub webhook → `/payload`  
It will execute `git pull` in your configured directory.

---

## 🐳 Running with Docker

```bash
docker build -t sarpan-bot .
docker run -d -e DISCORD_TOKEN=your-bot-token sarpan-bot
```

---

## ☁️ Optional Deployment (Container)

Supported on:

- Azure Container Apps  
- AWS ECS / Fargate  
- GCP Cloud Run  
- Any VPS running Docker  

---

## 📈 Roadmap

- Move hard-coded IDs to environment variables  
- Add slash commands  
- Add structured logging  
- CI/CD via GitHub Actions  
- Improve error handling  

---

## 📄 License

MIT License.
