/* MQTT4Snap - add MQTT protocol to Snap!
 * ===========================================
 * MQTT library developed by Xavier Pi
 * Modified by Simon Walters 
 * and converted into an extension
 * November 2021
 */



SnapExtensions.primitives.set(
    'mqt_connect(broker,options)',
    function (broker,options,proc) {
        /* original code from github.com/pixavier/mqtt4snap  */
        /* adapted into extension by cymplecy 26Nov21 */
        /* modified to add in keepalive parameter by cymplecy 23Nov21 */

        broker = broker ? broker.trim() : broker;

        options = JSON.parse(options);
        const opts = {};
        if (options['username']) {
            opts.username = options['username'];
            if (options["password"]) {
                opts.password = options['password'];
            } else {
                opts.password = '';
            }
        }
        if (options["keepalive"]) {
            opts.keepalive = Number(options["keepalive"]);
        }

        var stage = this.parentThatIsA(StageMorph);

        if (!('mqtt' in stage)){
            stage.mqtt = [];
        }

        let wsbroker;
        if (broker.startsWith('ws://')) {
            wsbroker = broker;
        } else if (broker.startsWith('wss://')) {
            wsbroker = broker;
        } else {
            let prefix;
            prefix = window.location.protocol == 'https:'?'wss':'ws';
            wsbroker = prefix + '://' + broker;
        }

        try {
            stage.mqtt[broker].end();
        } catch (e){}

        delete stage.mqtt[broker];

        stage.mqtt[broker] = mqtt.connect(wsbroker, opts);

        stage.mqtt[broker].on('connect', function(connack) {
            proc.doSetVar('connection status', 'connected');
            console.log('Connected to ' + wsbroker);
        });

        stage.mqtt[broker].on('error', function(error) {
            proc.doSetVar('connection status', error);
            try {
                stage.mqtt[broker].end();
            } catch(e) {}
            delete stage.mqtt[broker];
        //  alert(error.message);
        });
    }
);

SnapExtensions.primitives.set(
    'mqt_pub(broker,topic,payload,options)',
    function (broker,topic,payload,options) {
        /* original code from github.com/pixavier/mqtt4snap  */
        /* adapted into extension by cymplecy 26Nov21 */
        /* modified 5 Sep2021 by cymplecy to add parameters for qos and retain flag */

        broker = broker ? broker.trim() : broker;
        topic = topic ? topic.trim() : topic;
        //payload not trimmed as might have real leading/trailing spaces

        options = JSON.parse(options);
        const opts = {};
        if (options['qos']) {
            opts.qos = Number(options['qos']);
        }
        if (options["retain"]) {
            opts.retain = options["retain"];
        }
                
        let stage =  this.parentThatIsA(StageMorph);

        if (!('mqtt' in stage)){
            throw new Error('No connection to broker ' + broker);
        }

        if(!stage.mqtt[broker]){
            throw new Error('No connection to broker ' + broker);
        }

        let prefix = window.location.protocol == 'https:'?'wss':'ws';
        let wsbroker = prefix+'://'+broker;


        try{
            let client = stage.mqtt[broker];
            client.publish(topic, '' + payload, opts);
        } catch(e) {
        //  console.log(e);
            throw e;
        }
    }
);

SnapExtensions.primitives.set(
    'mqt_sub(broker,topic,callback)',
    function (broker,topic,callback) {
        /* github.com/pixavier/mqtt4snap  */
        /* adapted into extension by cymplecy 26Nov21 */

        broker = broker ? broker.trim() : broker;
        topic = topic ? topic.trim() : topic;

        let stage =  this.parentThatIsA(StageMorph);

        if (!('mqtt' in stage)){throw new Error('No connection to broker '+broker);}

        let prefix = window.location.protocol == 'https:'?'wss':'ws';
        let wsbroker = prefix+'://'+broker;

        if (stage.mqtt[broker]) {
            try {stage.mqtt[broker].unsubscribe(topic);}catch(e){}
        } else {
            throw new Error('No connection to broker '+broker);
        }

        stage.mqtt[broker].subscribe(topic);

        let mqttListener = function (aTopic, payload) {	
        //  if (aTopic !== topic) { return; }
          if (!mqttWildcard(aTopic, topic)) {return;}
          let p = new Process();
          try {
              p.initializeFor(callback, new List([payload.toString() , aTopic]));
          } catch(e) {
              p.initializeFor(callback, new List([]));
          }
          stage.threads.processes.push(p);
        };

        stage.mqtt[broker].on('message', mqttListener);

        let mqttWildcard = function (topic, wildcard) {
            if (topic === wildcard) {return true;} 
            else if (wildcard === '#') {return true;}

            var res = [];
            var t = String(topic).split('/');
            var w = String(wildcard).split('/');
            var i = 0;
            for (var lt = t.length; i < lt; i++) {
                if (w[i] === '+') {
                    res.push(t[i]);
                } else if (w[i] === '#') {
                    res.push(t.slice(i).join('/'));
                    return true;
                } else if (w[i] !== t[i]) {
                    return false;
                }
            }
            if (w[i] === '#') {i += 1;}
            return (i === w.length) ? true : false;
        }
    }
);

SnapExtensions.primitives.set(
    'mqt_disconnect(broker)',
    function (broker) {
        /* original code from github.com/pixavier/mqtt4snap  */
        /* adapted into extension by cymplecy 26Nov21 */
        
        let stage =  this.parentThatIsA(StageMorph);

        try{
          if(broker=='all'){
            for(let brok of Object.keys(stage.mqtt)){
              try {
                stage.mqtt[brok].end();
              } catch (e0) {
                //console.log(e0);
              }
            } 
          }else{
            stage.mqtt[broker].end();
          }
        }catch(e1){
          //console.log(e1);
        }
        try{
          if(broker=='all'){
            try {
              delete stage.mqtt;
              stage.mqtt=[];
            } catch (e2) {
              //console.log(e2);
            }
          }else{
            delete stage.mqtt[broker];
          }
        }catch(e3){
        //  console.log(e3);
        }
    }
);

SnapExtensions.primitives.set(
    'mqt_unsub(broker,topic)',
    function (broker,topic) {
        /* original code from github.com/pixavier/mqtt4snap  */
        /* adapted into extension by cymplecy 26Nov21 */

        let stage =  this.parentThatIsA(StageMorph);
        try{
          stage.mqtt[broker].unsubscribe(topic);
          let listeners = stage.mqtt[broker].listeners('message');
        //  https://github.com/mqttjs/async-mqtt/issues/31
        //  listeners.forEach((listener) => {
        //      console.dir(listener); 
        //      stage.mqtt[broker].removeListener('message', listener); 
        //    })
        }catch(e){
          //console.log(e);
        }
    }
)
