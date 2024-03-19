const { createServer, createClient,states,ping } = require('minecraft-protocol'); // For Minecraft Protocol 
const readline = require('node:readline'); // Readline for cli
const fs = require('node:fs') // for Writing File.
require('colors'); // for Colorful cli

const { stdin: input, stdout: output } = require('node:process');
const rl = readline.createInterface({ input, output });



let Settings = {
  DirectoryName: "results",
  host: undefined,
  username: undefined,
  port: 25565,
  version: undefined,
  CustomString: [],
  favicon: "data:image/jpeg;base64,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"
};


async function start() {
  console.log(Settings.version ?? "1.8.9")
  let proxyServer = createServer({
    'online-mode': false,
    keepAlive: false,
    version: Settings.version ?? "1.8.9",
    favicon: Settings.favicon,
    motd: "§2Hello, You Are Running Packet Sniffer Which is Coded by Turki",   
    port: 25565
  });
    console.log("Please Connect into localhost:25565 For Capture The Packets.")
    proxyServer.on('login', (client) => {
     const proxyClient = createClient({
        host: Settings.host ??  "localhost",
        port: Settings.Port ?? 25565,
        username: Settings.username,
        auth:"offline",
        version: Settings.version ?? "1.8.9"
      });



client.on('end', (reason) => {
  proxyClient.end();
});
      // Packet binding
      client.on('packet', (data, meta) => { // Client ---> Server
        if (proxyClient.state === states.PLAY && meta.state === states.PLAY) {
      });       

      
      proxyClient.on('packet', (data, meta) => { // Server ---- > client
        if (meta.state === states.PLAY && client.state === states.PLAY) {

          client.write(meta.name,data)
          
          if (meta.name === 'set_compression') {
              client.compressionThreshold = data.threshold;
            }
            const PacketFilter = Settings.CustomString.filter(names => JSON.stringify(data).includes(names))
            if(Settings.CustomString.length > 0 && PacketFilter.length > 0) {
              const msg ={
                message:`"[Packet Sniffer]: We've Got Packet For ${PacketFilter.join(",")} Saving..."`
                ,position:1
              }
              client.write("chat",msg);
              SavePacket(meta.name,JSON.stringify(data))
            } else if(Settings.CustomString.length === 0) {
              SavePacket(meta.name,JSON.stringify(data))
            }
              
        }
      });
     proxyClient.on('packet',(data,meta) => {
      if(meta.state === 'login' && meta.name === 'disconnect') {
          client.write('kick_disconnect',data)
      }
     })
  });
}




async function Start() {
    console.clear();
    
    const host = await Qinput("What's The Ip server");
    Settings.host = host.length === 0 ? undefined : host;
    const Port = await Qinput("What's The Port (default is 25565)");
    if(Port.length > 0) {
      Settings.port = Number(Port);
    };
    const username = await Qinput("Type Your Username (only Crack) + (leave it if you don't have specify username)")
    if(username.length >= 3) {
      Settings.username = username
    } 
    const version = await Qinput("Please type The Server Version");
    Settings.version = version.length === 0 ? undefined : version
    const CustomStringinpacket = await Qinput("Please provide specific strings to capture by inputting them, separated by , (leave for Capture All)")
    if(CustomStringinpacket?.split(',').toString() !== '[]') {
      Settings.CustomString = CustomStringinpacket.split(',')
    }
    rl.close();
    try {
    const serverinfo = await ping({host:Settings.host ?? "ccc.blocksmc.com",port: Settings.port ?? 25565, version: Settings.version ?? "1.8.9"});
    Settings.favicon = serverinfo.favicon  
    console.log(`Version: ${serverinfo.version.name}`.green)  
    console.log(`Online Player: ${serverinfo.players.online} | ${serverinfo.players.max} `.blue)
    console.log(`Ping: ${serverinfo.latency}`.yellow)
    Settings.DirectoryName = new Date().toLocaleString().replaceAll(/[\/:]/g,"-").slice(0,-2)
    fs.mkdirSync('./results/'+Settings.DirectoryName)
start();
    } catch(err) {
      if(err.errno === -3008) {
        console.log(`Couldn't Connection into ${Settings.host}:${Settings.port} Try Again Later.`.red)
        return countdown(5);
      } else console.log(err)
    }
    
   
}
Start();
/**
 * 
 * @param {String} Query 
 */
function Qinput(Query) {
  return new Promise((resolve,reject) => {
    rl.question(Query.length > 0 ? Query + ": " : "Can't Find The Fucking Question", (answer) => {
      // TODO: Log the answer in a database
      resolve(answer);
      

    });
  }); 
};  


function SavePacket(metaname,data) {
  return fs.appendFileSync(`./results/${Settings.DirectoryName}/Packet.txt`,`\n--------------------------------------------------\nPacket Name:${metaname}\nData:${data ?? "Can't Find Packet Data"}\n--------------------------------------------------`)
}

function countdown(seconds) {
  if (seconds > 0) {
      console.log(`Closing in ${seconds}`);
      setTimeout(() => {
          countdown(seconds - 1);
      }, 1000); // 1000 milliseconds = 1 second
  } else {
      console.log("Closing now!");
      process.exit(0)
  }
}


