const icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADTUlEQVRIS63VTWgUZxgH8P+7Mzsf+2U2SrPJKBoEA1WKUMzupaKHpgoetadCnaBN9FRaLLRQEW17KKIed1V21dJLbU/FRqiixx219NDaVi+NmnWNZT+cze7Ozsf7yoxEYpnMRJI5DQzP+5v3P8/7DEHANVHM7iXAVyAkwQCNgZYjDp3KH7jzZ1DdwmckBLirrE29KQgcTNOBZTrQdYP2es631LSPnp34zQqDlgTIcvTlOowxNBsG6o3uHw6he899eOt+EBIGeBHxUW5ElDjEYwKSKdFbzzAsVB61/q4lWlsvv3/XXAwJBOaL9pe29slE3MgoOSHF+N0DAwnwfASNehe1WudkYVw7sixgYfFkMXtSikU/VZQU3LhmHjVZ17Sz59Tbt/2QJe3glUIGMnEhe3PgjcR2Ny5dN/Df0873ebX8gS/wshUBUMK+PKveuhzWGZPF0fdiceHq4FAK3a6FyoyuFca13GKA14ruw8qM/ldhXNscBnz03duDUSY83jCchu04ePBvs5ZXtTW+wGQpW12/IZ1xP9r0dAM9g2bOH9Rmg5DDpW0ZwvFVD7CpW1ctqNqQP1DM/ZJRErvdFqw+bqHdMccKqvZr4AEsbdsVj4lTbkTttolqtXWloGp7FtlB7uv+1fIX6bSM9pyJJ9W5a3m1PAYC5ou4H7mUvT44mNwZTwio17to1Dsn8qp21Bc4cGl0WCLcP+vW9wkRQrxddNrW6cyw9NmxnTfthUX7ftgs9LcTP8dkfmxIWeW16cOHTdO22EheLU8v2qYTxezn6bT8zeo1MS/T2dk5GB3rHgNOMd6+SsFxnE3eJcAnohwdUZQkQAjqtTYadePHwri2L/CgHbuxg3/ywPhdUZJbJOnF3GnpPS9fw7ABAkgij3h8flS46REYPRvVig5KoebV8oXAg3bw4ugmjkV+6u+Xt/T1SSDE/wy6sTxrdiHHBYgCH4q8ssqLjOPHZYk/kkiKEUHg4Y5qBgbLpDBNG62W5Rhde4rjsGdISUEUgxHf1zx0MfsWdTBGCHIAeQeABbAyBdPmfziTpdz+SASlMOT1Z9GCoJeCLAtwrTBk2UAYsiKAH+JN2YreXDHg/wilzJ3Oz1YUmEcYY2fce0LIx88BFi6vvp70RPYAAAAASUVORK5CYII=";
//const JSONRPCWebSocket = require('../util/jsonrpc-web-socket');
//const ScratchLinkWebSocket = 'ws://translate-service.scratch.mit.edu:8000/scratch/ble';
var sensorDict = {}

class PiGPIOSiWS {
  

  constructor() {
    this.ws = new WebSocket('wss:localhost:8000/');
    //console.log(Scratch);
    this.ws.onopen = function(evt) { console.log('websocket opened') };
    this.ws.onmessage = function(evt) {
      var data = evt.data
      console.log('msg from sgh:' + data)
      var sensorSplit = data.split(":");
      sensorDict[sensorSplit[0]] = sensorSplit[1];
      console.log("sensorDict:" + sensorDict);
    };
    setInterval(function(){ console.log("refresh sent"); }, 1000);
    //this.ws.send('refresh');

  }
  
 

  getInfo() {
    return {
      id: 'pigpiosiws',
      name: 'PiGPIOSiWS',

      colour: '#8BC34A',
      colourSecondary: '#7CB342',
      colourTertiary: '#689F38',

      menuIconURI: icon,

      blocks: [
        {
          opcode: 'sghWSBroadcast',
          blockType: Scratch.BlockType.COMMAND,
          
          text: 'PiGPIOSi broadcast [BC]',
          arguments: {
            BC: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'config22in'
            }
          }
        },
        {
          opcode: 'sghBroadcastMult',
          blockType: Scratch.BlockType.COMMAND,
          
          text: 'PiGPIOSi broadcast [A] [B] [C] [D] [E]',
          arguments: {
            A: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'null'
            },
            B: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: ''
            },
            C: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: ''
            },
            D: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: ''
            },
            E: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: ''
            }            
          }
        },        
        {
          opcode: 'sghSenderUpdate',
          blockType: Scratch.BlockType.COMMAND,
          
          text: 'PiGPIOSi: set [VARNAME] to [VARVALUE]',
          arguments: {
            VARNAME: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: ''
            },
            VARVALUE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: ''
            }            
          }        
        },
        {
          opcode: 'sghGetSensor',
          blockType: Scratch.BlockType.REPORTER,
          text: 'PiGPIOSi: get [VARNAME]',
          arguments: {
            VARNAME: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: ''
            }          
          }
        }
      ]
    }
  }

  sghWSBroadcast({BC}) {
    this.ws.send('broadcast "' + BC + '"');
    console.log('sent:' + BC);
  }  
  
  sghBroadcastMult({A, B, C, D, E}) {
    this.ws.send('broadcast "' + A + B + C + D + E + '"');
    console.log('sent:'  + A + B + C + D + E);
  }   
  
  sghSenderUpdate({VARNAME, VARVALUE}) {
    new Promise(resolve => {
      fetch('https://translate-service.scratch.mit.edu/translate?lang=fr&text=' + VARNAME + '=' + VARVALUE).then(res => res.text()).then(resolve)
      .catch(err => resolve(''));
    });
  }    
  sghGetSensor({VARNAME}) {
    return sensorDict[VARNAME.toLowerCase()];
  }  

}

Scratch.extensions.register(new PiGPIOSiWS());
