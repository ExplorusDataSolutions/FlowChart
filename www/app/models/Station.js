app.models.Station = Ext.regModel("app.models.Station", {
    fields: [
        {name: "id", type: "int"},
        {name: "station", type: "string"},
    ]
});


Ext.data.MyLocalStorageProxy = Ext.extend(Ext.data.WebStorageProxy, {
    //inherit docs
    getStorageObject: function() {
        return window.localStorage;
    },
	//inherit docs
    create: function(operation, callback, scope) {
        var records = operation.records;
        
        operation.setStarted();
		
        this.setRecords(records);
		
        operation.setCompleted();
        operation.setSuccessful();

        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },
    //inherit docs
    read: function(operation, callback, scope) {
		records = this.getRecords();
		
		operation.setSuccessful();
		operation.setCompleted();

		operation.resultSet = new Ext.data.ResultSet({
			records: records,
			total  : records.length,
			loaded : true
		});

		if (typeof callback == 'function') {
			callback.call(scope || this, operation);
		}
    },
	getRecords: function() {
		try{
			var rawRecords = Ext.decode(this.getStorageObject().getItem(this.id));
		} catch(e) {
			var rawRecords = [];
		}
		
		var records = [];
		for (var j = 0, rawRecord; rawRecord = rawRecords[j++];) {
			var data    = {},
				Model   = this.model,
				fields  = Model.prototype.fields.items,
				length  = fields.length,
				i, field, name, record;

			for (i = 0; i < length; i++) {
				field = fields[i];
				name  = field.name;
				
				if (typeof field.decode == 'function') {
					data[name] = field.decode(rawRecord[name]);
				} else {
					data[name] = rawRecord[name];
				}
			}

			record = new Model(data);
			record.phantom = false;
			
			records.push(record);
		}
		
		return records;
    },
	setRecords: function(records) {
		var rawRecords = [];
		
		for (var j = 0, record; record = records[j++];) {
			var rawData = record.data,
			data    = {},
			model   = this.model,
			fields  = model.prototype.fields.items,
			length  = fields.length,
			i, field, name;

			for (i = 0; i < length; i++) {
				field = fields[i];
				name  = field.name;

				if (typeof field.encode == 'function') {
					data[name] = field.encode(rawData[name], record);
				} else {
					data[name] = rawData[name];
				}
			}
			
			rawRecords.push(data);
		}
		
        var obj = this.getStorageObject(),
            key = this.id;
        
        //iPad bug requires that we remove the item before setting it
        obj.removeItem(key);
        obj.setItem(key, Ext.encode(rawRecords));
    }
});
Ext.data.ProxyMgr.registerType('mylocalstorage', Ext.data.MyLocalStorageProxy);


app.stores.stations = new Ext.data.Store({
    model: "app.models.Station",
    sorters: 'station',
    getGroupString : function(record) {
        return record.get('station')[0].toUpperCase();
    },
	proxy: {
		type: 'mylocalstorage',
		id: 'stations'
	},
	loadStationListFromServer: function() {
		this.removeAll();
	
		var proxy = new Ext.data.AjaxProxy({
			url: 'http://www.albertawater.com/awp/api/realtime/stations',
			reader: new Ext.data.JsonReader({
				model: app.models.Station
			})
		});
		
		Ext.getBody().mask('Loading...', 'x-mask-loading', false);
		
		proxy.read(new Ext.data.Operation({action: 'read'}), function(operation) {
			var records = operation.getRecords();
			
			for (var i = 0, record; record = records[i++];) {
				if (record.data.id == 0) {
					record.data.id = i;
				}
			}
			//alert(app.views.stationList.getComponent('card-stations').setBadge)
			//app.views.stationList.items[0].setBadge(records.length);
			navigator.notification.alert('Total ' + records.length + ' stations loaded');
			
			this.proxy.clear();
			this.loadRecords(records);
			
			Ext.getBody().unmask();
			this.sync();//300 station need 15s, too slow
		}, this);
	}
});