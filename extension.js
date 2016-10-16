/*
 *This program is free software: you can redistribute it and/or modify
 *it under the terms of the GNU General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *This program is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
(function(ext) {
	ext.addOn = function(message) {
	var myKeyVals = { "gbroadcast" :  "AddOn" + message };

	var saveData = $.ajax({
		  type: 'POST',
		  url: "http://192.168.0.18:8181?action=saveData",
                    cache:false,
		  data: myKeyVals,
		  dataType: "json",
		  success: function(resultData) { console.log("OK") }
		});
	saveData.error(function() { console.log("who knows"); });
	  };    
    
	ext.pinWrite = function(pin, val) {
        $.ajaxSetup({
          cache:false
        });
	var myKeyVals = { "gBroadcast" :  "pin" + pin + val };

	var saveData = $.ajax({
		  type: 'POST',
		  url: "http://127.0.0.1:8181?action=saveData",
                    cache:false,
		  data: myKeyVals,
		  dataType: "json",
		  success: function(resultData) { console.log("OK") }
		});
	saveData.error(function() { console.log("who knows"); });
	  };

  ext.pinRead = function(pin, callback) {
      var myKeyVals = { "readpin" :  pin };

	var saveData = $.ajax({
		  type: 'POST',
		  url: "http://192.168.0.18:8181?action=saveData",

		  data: myKeyVals,
		  dataType: "json",
		  success: function(resultData) { console.log("OK") }
		});
	saveData.error(function() { console.log("who knows"); });
	  
      
    $.ajax({
      method: "GET",
      url: "http://192.168.0.18/pin" + pin + ".json",
		dataType: "json",

		  success: function(data) {
			  callback(data.val);
			  return;
		  },
		  error: function(xhr, textStatus, error) {
			console.log(error);
			callback("eRRor:" + error);
		  }
		});
  };

	ext.gBroadcast = function(message) {

	var myKeyVals = { "gbroadcast" :  message };

	var saveData = $.ajax({
		  type: 'POST',
		  url: "http://192.168.0.18:8181?action=saveData",
                    cache:false,
		  data: myKeyVals,
		  dataType: "json",
		  success: function(resultData) { console.log("OK") }
		});
	saveData.error(function() { console.log("who knows"); });
	  };

  ext._getStatus = function() {
    return { status:2, msg:'Ready' };
  };

  var descriptor = {
    blocks: [
	  [' ', 'set AddOn to %s', 'addOn', ''],    
      ['R', 'pin %s', 'pinRead', '36'],
      [' ', 'broadcast to GPIO %s', 'gBroadcast', ''],
	  [' ', 'set pin %m.pins to %m.onoff', 'pinWrite', '11', 'On'],
    ],
    menus: {
      onoff: ["On", "Off","1","0","High","Low"],
      pins: ["3","5","7","8","10","11","12","13","15","16","18","19","21","22","23","24","26","29","31","32","33","35","36","37","38","40"]
    },
    url: 'https://dev.twitter.com/overview/documentation'
  };

  ScratchExtensions.register('s2gpio', descriptor, ext);

})({});
