const { createServer, createClient, states, ping } = require('minecraft-protocol');
const readline = require('node:readline');
const fs = require('node:fs');
require('colors');

const { stdin: input, stdout: output } = require('node:process');
const rl = readline.createInterface({ input, output });

class Settings {
  constructor() {
    this.directoryName = "";
    this.host = undefined;
    this.username = undefined;
    this.port = 25565;
    this.version = undefined;
    this.customStrings = [];
  }
}

class PacketSniffer {
  constructor() {
    this.settings = new Settings();
  }

  async start() {
    const proxyServer = createServer({
      'online-mode': false,
      keepAlive: false,
      version: this.settings.version ?? "1.8.9",
      motd: "§2Minecraft Packet Sniffer",
      port: 25565
    });

    console.log("Connect to localhost:25565 to capture packets.".green);

    proxyServer.on('login', (client) => {
      this.handleClientConnection(client);
    });
  }

  handleClientConnection(client) {
    const proxyClient = createClient({
      host: this.settings.host ?? "localhost",
      port: this.settings.port ?? 25565,
      username: this.settings.username,
      auth: "offline",
      version: this.settings.version ?? "1.8.9"
    });

    client.on('end', () => proxyClient.end());

    // Handle packets from server to client
    proxyClient.on('packet', (data, meta) => {
      if (meta.state === states.PLAY && client.state === states.PLAY) {
        client.write(meta.name, data);

        if (meta.name === 'set_compression') {
          client.compressionThreshold = data.threshold;
        }

        this.handlePacketCapture(client, meta.name, data);
      }
    });

    // Handle disconnect packets during login
    proxyClient.on('packet', (data, meta) => {
      if (meta.state === 'login' && meta.name === 'disconnect') {
        client.write('kick_disconnect', data);
      }
    });
  }

  handlePacketCapture(client, metaName, data) {
    const packetData = JSON.stringify(data);
    const matchingFilters = this.settings.customStrings.filter(str => packetData.includes(str));

    if (this.settings.customStrings.length > 0 && matchingFilters.length > 0) {
      this.notifyClient(client, matchingFilters);
      this.savePacket(metaName, packetData);
    } else if (this.settings.customStrings.length === 0) {
      this.savePacket(metaName, packetData);
    }
  }

  notifyClient(client, matchingFilters) {
    client.write("chat", {
      message: `[Packet Sniffer]: Captured packet matching ${matchingFilters.join(", ")}`,
      position: 1
    });
  }

  savePacket(metaName, data) {
    const separator = "-".repeat(50);
    const content = `\n${separator}\nPacket Name: ${metaName}\nData: ${data ?? "No packet data"}\n${separator}\n`;
    fs.appendFileSync(`./results/${this.settings.directoryName}/Packet.txt`, content);
  }

  async initialize() {
    try {
      await this.getUserInput();
      await this.checkServerConnection();
      this.createResultsDirectory();
      await this.start();
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUserInput() {
    this.settings.host = await this.prompt("Server IP") || undefined;
    const port = await this.prompt("Server port (default: 25565)");
    this.settings.port = port ? Number(port) : 25565;
    this.settings.username = await this.prompt("Username (optional)") || undefined;
    this.settings.version = await this.prompt("Server version") || "1.8.9";
    const customStrings = await this.prompt("Specific strings to capture (comma-separated, optional)");
    this.settings.customStrings = customStrings ? customStrings.split(',').map(s => s.trim()) : [];
  }

  async checkServerConnection() {
    try {
      const serverInfo = await ping({
        host: this.settings.host ?? "localhost",
        port: this.settings.port,
        version: this.settings.version
      });

      console.log(`Version: ${serverInfo.version.name}`.green);
      console.log(`Players: ${serverInfo.players.online}/${serverInfo.players.max}`.blue);
      console.log(`Ping: ${serverInfo.latency}ms`.yellow);
    } catch (error) {
      throw new Error(`Failed to connect to ${this.settings.host}:${this.settings.port}`);
    }
  }

  createResultsDirectory() {
    this.settings.directoryName = new Date().toLocaleString().replaceAll(/[\/:]/g, "-").slice(0, -2);
    if (!fs.existsSync('./results')) {
      fs.mkdirSync('./results');
    }
    fs.mkdirSync(`./results/${this.settings.directoryName}`);
  }

  async prompt(question) {
    return new Promise((resolve) => {
      rl.question(`${question}: `, resolve);
    });
  }

  handleError(error) {
    console.error(`Error: ${error.message}`.red);
    this.countdown(5);
  }

  countdown(seconds) {
    if (seconds > 0) {
      console.log(`Closing in ${seconds}`);
      setTimeout(() => this.countdown(seconds - 1), 1000);
    } else {
      console.log("Closing now!");
      process.exit(0);
    }
  }
}

// Start the application
const sniffer = new PacketSniffer();
sniffer.initialize();
