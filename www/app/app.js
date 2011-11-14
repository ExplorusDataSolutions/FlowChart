Ext.regApplication({
    name: 'app',
    launch: function() {
        this.launched = true;
        this.mainLaunch();
    },
    mainLaunch: function() {
		if (navigator.notification) {
			if (typeof device == 'undefined' || !this.launched) {return;}
		}
		
		var confirm = window.confirm;
		window.confirm = function(message, callback, title, buttons) {
			if (navigator.notification) {
				navigator.notification.confirm(message, callback, title, buttons);
			} else {
				confirm(message) && callback(1);//default value 1 for OK
			}
		}
		
		var alert = window.alert;
		window.alert = function(message) {
			navigator.notification ? navigator.notification.alert(message) : alert(message);
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