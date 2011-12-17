Ext.regApplication({
	/**
	 * This enables app.* namespace for this project
	 */
	name: 'app',
	/**
	 * As said in Gmail
	 * @date 2011-12-14
	 */
    appName: 'Flowchart',
	langerName: 'Water and Environmental Charting Utility',
    launch: function() {
        this.launched = true;	// This will be also set to true after launch() is excuted
        this.mainLaunch();
    },
    mainLaunch: function() {
		if (typeof device == 'undefined') {
			// This is, for example, Chrome
			// Unfortunately, Android goes here also, to be researched
		} else {
			// Iphone goes here
			// handle langched 2 times
			if (!this.launched) {return;}
			
			// After using phonegap-1.2.0, Android goes here finally. device.name is GT_I9003
			// window.alert(device.name)
		}
		
		/**
		 * strange that navigator.network is unavailable for Android
		 */
		if (typeof(navigator) != 'undefined' && typeof(navigator.network) != 'undefined') {
			var states = {},
				networkState = navigator.network.connection.type;
			states[Connection.UNKNOWN]  = 'Unknown connection';
			states[Connection.ETHERNET] = 'Ethernet connection';
			states[Connection.WIFI]     = 'WiFi connection';
			states[Connection.CELL_2G]  = 'Cell 2G connection';
			states[Connection.CELL_3G]  = 'Cell 3G connection';
			states[Connection.CELL_4G]  = 'Cell 4G connection';
			states[Connection.NONE]     = 'No network connection';
			
			this.connectionType = states[networkState];
		}
		
		var confirm = window.confirm,
			me = this;
		window.confirm = function(message, callback, title, buttons) {
			if (navigator.notification) {
				// async
				navigator.notification.confirm(message, callback, title || me.appName, buttons);
			} else {
				// sync
				confirm(message) && callback(1);//default value 1 for OK
			}
		}
		
		var alert = window.alert,
			me = this;
		window.alert = function(message, callback, title, buttonName) {
			if (navigator.notification) {
				navigator.notification.alert(message, callback, title || me.appName, buttonName);
			} else {
				alert(message);
			}
		}
		
		window.showEvent = function(eventDescription) {
			console.log(eventDescription);
		}
		
		
		this.views.viewport = new this.views.Viewport();
		
		
		/**
		 * AjaxProxy usage example 1
		 * /
		var proxy = new Ext.data.AjaxProxy({
			url: 'http://www.albertawater.com/awp/api/realtime/service/1',
			createRequestCallback: function(request, operation, callback) {
				return function(options, success, response) {
					alert(response.responseText)
					alert('b:' + request.params.b)
					callback(operation)
				}
			}
		});
		
		proxy.read(new Ext.data.Operation({
			action: 'read',
			a: 'aa',
			params: {b: 'bb'},
		}), function(operation){
			alert('a:' + operation.a)
		});
		/**/
		
		
		/**
		 * AjaxProxy usage example 2
		 * /
			var proxy = new Ext.data.AjaxProxy({
				url: 'http://www.albertawater.com/awp/api/realtime/stations',
				reader: new Ext.data.JsonReader({
					model: app.models.Station
				})
			});
			
			proxy.read(new Ext.data.Operation({
				action: 'read',
				a: 'aa'
			}), function(operation) {
				alert(operation.a)
				alert(operation.resultSet.records.length)
			});
		/**/
		
		
		/**
		 * A simple test for Ext.data.Store
		 * /
		Ext.regModel('User', {
			fields: [
				{name: 'firstName', type: 'string'},
				{name: 'lastName',  type: 'string'},
				{name: 'age',       type: 'int'},
				{name: 'eyeColor',  type: 'string'}
			]
		});
		
		var myStore = new Ext.data.Store({
			model: 'User',
			proxy: {
				type: 'ajax',
				url : 'http://50.17.233.63/awp/api/realtime/service/1',
				reader: {
					type: 'json',
				}
			},
			//autoLoad: true
		});
		myStore.load(function(r){
			alert(r.length)
			alert(JSON.stringify(r))
		});
		/**/
		
		
	}
});