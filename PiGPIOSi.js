const icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADTUlEQVRIS63VTWgUZxgH8P+7Mzsf+2U2SrPJKBoEA1WKUMzupaKHpgoetadCnaBN9FRaLLRQEW17KKIed1V21dJLbU/FRqiixx219NDaVi+NmnWNZT+cze7Ozsf7yoxEYpnMRJI5DQzP+5v3P8/7DEHANVHM7iXAVyAkwQCNgZYjDp3KH7jzZ1DdwmckBLirrE29KQgcTNOBZTrQdYP2es631LSPnp34zQqDlgTIcvTlOowxNBsG6o3uHw6he899eOt+EBIGeBHxUW5ElDjEYwKSKdFbzzAsVB61/q4lWlsvv3/XXAwJBOaL9pe29slE3MgoOSHF+N0DAwnwfASNehe1WudkYVw7sixgYfFkMXtSikU/VZQU3LhmHjVZ17Sz59Tbt/2QJe3glUIGMnEhe3PgjcR2Ny5dN/Df0873ebX8gS/wshUBUMK+PKveuhzWGZPF0fdiceHq4FAK3a6FyoyuFca13GKA14ruw8qM/ldhXNscBnz03duDUSY83jCchu04ePBvs5ZXtTW+wGQpW12/IZ1xP9r0dAM9g2bOH9Rmg5DDpW0ZwvFVD7CpW1ctqNqQP1DM/ZJRErvdFqw+bqHdMccKqvZr4AEsbdsVj4lTbkTttolqtXWloGp7FtlB7uv+1fIX6bSM9pyJJ9W5a3m1PAYC5ou4H7mUvT44mNwZTwio17to1Dsn8qp21Bc4cGl0WCLcP+vW9wkRQrxddNrW6cyw9NmxnTfthUX7ftgs9LcTP8dkfmxIWeW16cOHTdO22EheLU8v2qYTxezn6bT8zeo1MS/T2dk5GB3rHgNOMd6+SsFxnE3eJcAnohwdUZQkQAjqtTYadePHwri2L/CgHbuxg3/ywPhdUZJbJOnF3GnpPS9fw7ABAkgij3h8flS46REYPRvVig5KoebV8oXAg3bw4ugmjkV+6u+Xt/T1SSDE/wy6sTxrdiHHBYgCH4q8ssqLjOPHZYk/kkiKEUHg4Y5qBgbLpDBNG62W5Rhde4rjsGdISUEUgxHf1zx0MfsWdTBGCHIAeQeABbAyBdPmfziTpdz+SASlMOT1Z9GCoJeCLAtwrTBk2UAYsiKAH+JN2YreXDHg/wilzJ3Oz1YUmEcYY2fce0LIx88BFi6vvp70RPYAAAAASUVORK5CYII=";
class PiGPIOSi {
  constructor() {}

  getInfo() {
    return {
      id: 'pigpiosi',
      name: 'PiGPIOSi',

      colour: '#8BC34A',
      colourSecondary: '#7CB342',
      colourTertiary: '#689F38',

      menuIconURI: icon,

      blocks: [
        {
          opcode: 'sghBroadcast',
          blockType: Scratch.BlockType.COMMAND,
          
          text: 'PiGPIOSi broadcast [BC]',
          arguments: {
            BC: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: ''
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
              defaultValue: ''
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
        }
      ]
    }
  }

  
  sghBroadcast({BC}) {
    new Promise(resolve => {
      fetch('https://translate-service.scratch.mit.edu/translate?lang=fr&text=' + BC).then(res => res.text()).then(resolve)
      .catch(err => resolve(''));
    });
  }  
  
  sghBroadcastMult({A, B, C, D, E}) {
    new Promise(resolve => {
      fetch('https://translate-service.scratch.mit.edu/translate?lang=fr&text=' + A + B + C + D + E).then(res => res.text()).then(resolve)
      .catch(err => resolve(''));
    });
  }   
  
  sghSenderUpdate({VARNAME, VARVALUE}) {
    new Promise(resolve => {
      fetch('https://translate-service.scratch.mit.edu/translate?lang=fr&text=' + VARNAME + '=' + VARVALUE).then(res => res.text()).then(resolve)
      .catch(err => resolve(''));
    });
  }    

}

Scratch.extensions.register(new PiGPIOSi());
