const icon = "data:image/png;base64,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";
class Dictionary {

  constructor() {
    this.maps = {'my dictionary':{'hello':'world'}};
    console.log(Scratch);
  }

  _getMaps() {
    return Object.keys(this.maps).map(key => {
      return {text: key, value: key}
    });
  }

  getInfo() {
    return {
      id: 'dictionary',
      name: 'Dictionary',

      colour: '#ef5350',
      colourSecondary: '#f44336',
      colourTertiary: '#e53935',

      menuIconURI: icon,
      blockIconURI: icon,

      blocks: [
        {
          opcode: 'getMap',
          blockType: Scratch.BlockType.REPORTER,
          text: '[MAP]',
          arguments: {
            MAP: {
              type: Scratch.ArgumentType.STRING,
              menu: 'MAPS',
              defaultValue: 'my dictionary'
            }
          }
        },
        {
          opcode: 'getKeyOfMap',
          blockType: Scratch.BlockType.REPORTER,
          text: 'get [KEY] of [MAP]',
          arguments: {
            KEY: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'hello'
            },
            MAP: {
              type: Scratch.ArgumentType.STRING,
              menu: 'MAPS',
              defaultValue: 'my dictionary'
            }
          }
        },
        {
          opcode: 'setKeyOfMap',
          blockType: Scratch.BlockType.COMMAND,
          text: 'set [KEY] of [MAP] to [VALUE]',
          arguments: {
            KEY: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'hello'
            },
            MAP: {
              type: Scratch.ArgumentType.STRING,
              menu: 'MAPS',
              defaultValue: 'my dictionary'
            },
            VALUE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'world'
            }
          }
        },
        {
          opcode: 'changeKeyOfMap',
          blockType: Scratch.BlockType.COMMAND,
          text: 'change [KEY] of [MAP] by [VALUE]',
          arguments: {
            KEY: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'hello'
            },
            MAP: {
              type: Scratch.ArgumentType.STRING,
              menu: 'MAPS',
              defaultValue: 'my dictionary'
            },
            VALUE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 1
            }
          }
        }
      ],
      menus: {
        MAPS: this._getMaps()
      }
    }
  }

  _checkTypes(VALUE) {
    if (Number(VALUE)) {
      return Number(VALUE);
    } else {
      return VALUE;
    }
  }

  getMap({MAP}) {
    return JSON.stringify(this.maps[MAP]);
  }

  getKeyOfMap({KEY, MAP}) {
    return this.maps[MAP][KEY];
  }

  setKeyOfMap({KEY, MAP, VALUE}) {
    VALUE = this._checkTypes(VALUE);
    this.maps[MAP][KEY] = VALUE;
  }

  changeKeyOfMap({KEY, MAP, VALUE}) {
    VALUE = this._checkTypes(VALUE);
    console.log(VALUE);
    this.maps[MAP][KEY] += VALUE;
  }

}

Scratch.extensions.register(new Dictionary());
