app.models.Station = Ext.regModel("app.models.Station", {
    fields: [
        {name: "id", type: "int"},
        {name: "station", type: "string", mapping: function(obj) {return obj[0]}, index: 0},
		{name: "_lon",
			type: "number",
			useNull: true,
			defaultValue: null,
			index: 1,
			mapping: function(obj) {
				return obj[1]
			}},
		{name: "lon", type: "number",
			convert: function(value, record) {
				value = parseFloat(record.get('_lon'));
				
				// lon may be null, then value has no toFixed method
				return isNaN(value) ? null : value.toFixed(2);
			}
		},
		// to keep the precious
		{name: "_lat",
			type: "number",
			useNull: true,
			defaultValue: null,
			index: 2,
			mapping: function(obj) {
				return obj[2]}
			},
		{name: "lat", type: "number",
			convert: function(value, record) {
				var lat = record.get('_lat');
				value = parseFloat(lat);
				
				// lat may be null, then value has no toFixed method
				return isNaN(value) ? null : value.toFixed(2);
			}
		},
		{name: "lonlat", type: "int",
			convert: function(value, record) {
				return record.get('lon') != null && record.get('lat') != null;
		 	}
		},
		{name: "layers",
			index: 3,
			mapping: function(obj) {return obj[3]}
		},
		{name: "hasdata",
			convert: function(value, record) {
				var hasdata = false,
					layers = record.get("layers");
				for (var i = 0, layer; layer = layers[i++];) {
					if (layer[1]) {
						hasdata = true;
						break;
					}
				}
				return hasdata;
			}
		},
		{name: "visited",
			convert: function(value, record) {
				var station = record.get('station');
				return app.stores.history.getByStation(station);
			}
		}
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
    //inherit docs
	clear: function() {
        this.getStorageObject().removeItem(this.id);
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
				
				//if (typeof field.decode == 'function') {
				//	data[name] = field.decode(rawRecord[name]);
				//} else {
					//data[name] = rawRecord[name];
					field.mapping && (data[name] = rawRecord[field.index]);
				//}
			}
			
			data.id = j;

			record = new Model(data);
			record.phantom = false;
			
			records.push(record);//if(j>4)break;
		}
		
		return records;
    },
	setRecords: function(records) {
		var rawRecords = [];
		
		for (var j = 0, record; record = records[j++];) {
			var rawData = record.data,
			data    = [],	// here we use [] to instead of {} because we will store array for no key string
			model   = this.model,
			fields  = model.prototype.fields.items,
			length  = fields.length,
			i, field, name;
			
			for (i = 0; i < length; i++) {
				field = fields[i];
				name  = field.name;

				// here we don't use 'encode' choice
				//if (typeof field.encode == 'function') {
				//	data[name] = field.encode(rawData[name], record);
				//} else {
					//data[name] = rawData[name];
					// only store fields having "mapping"
					if (field.mapping) {
						data.push(rawData[name]);
					}
				//}
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


Ext.regModel('app.models.history', {
    fields: [
		{name: "station", type: "string", index: 0, mapping: function(obj){return obj[0]}},
		{name: "visited", type: "date", index: 1, mapping: function(obj){return obj[1]}}
    ]
});
app.stores.history = new Ext.data.Store({
    model:'app.models.history',
	proxy: {
		type: 'mylocalstorage',
		id: 'stations-history'
	},
	stationsMap: null,
	getByStation: function(station) {
		if (this.stationsMap == null) {
			var map = {}
			this.load();
			this.each(function(record, index) {
				map[record.get('station')] = record;
				record.needsAdd = true;
			});
			this.stationsMap = map;
		}
		return this.stationsMap[station]
	},
	setVisited: function(station) {
		if (!this.stationsMap[station]) {
			var	Model = this.model,
				values = {
					station: station,
					visited: (new Date()).dateFormat('Y-m-d H:i:s'),
				};
			var record = new Model(values);
			this.stationsMap[station] = record;
			this.add(record);
		}
		this.sync();
	}
});


app.stores.stations = new Ext.data.Store({
    model: "app.models.Station",
    sorters: 'station',
    getGroupString : function(record) {
        try {
			return record.get('station')[0].toUpperCase();
		} catch(e) {
			//alert('getGroupString: ' + e);
			return '' + e;
		}
    },
	proxy: {
		type: 'mylocalstorage',
		id: 'stations'
	},
	unloadForGoodPerformance: function() {
		console.log('store.unloadForGoodPerformance');
		
		this.filterBy(function(){
			return false;
		});
	},
	statusFilters: {},
	loadStationListFromLastStatus: function() {
		console.log('store.loadStationListFromLastStatus');
		
		var store = this;
		
		if (store.isFiltered() === false && store.getCount() == 0) {
			return this.loadStationListFromLocal();
		}
		
		store.filterBy(function(item, key){
			for (var filterFnIdentifier in store.statusFilters) {
				var filterFn = store.statusFilters[filterFnIdentifier];
				if (filterFn(item, key) === false) {
					return false;
				}
			}
			return true;
		});
	},
	loadStationListFromLocal: function() {
		console.log('store.loadStationListFromLocal');
		
		var store = this;
		store.load();
		
		if (0 == store.getCount()) {
			confirm(
				'Load stations right away? If it fails within 30 seconds, please try Refresh button with more time',  // message
				function(button) {
					if (button == 1) {// 1 for OK
						store.loadStationListFromServer(30);
					}
				},
				'Local data not detected',	// title
				'Ok,Cancel'				// so is default
			);
		}
	},
	loadStationListFromServer: function(timeoutSeconds) {
		timeoutSeconds = timeoutSeconds || 30;
		this.removeAll();
		this.clearFilter();
		
		var proxy = new Ext.data.AjaxProxy({
			url: 'http://www.albertawater.com/awp/api/realtime/stations',
			timeout: timeoutSeconds * 1000,
			reader: new Ext.data.JsonReader({
				model: app.models.Station
			})
		});
		
		Ext.getBody().mask('Loading...', 'x-mask-loading', false);
		
		proxy.read(new Ext.data.Operation({action: 'read'}), function(operation) {
			var records = operation.getRecords();
			records = records.slice(0, 100);
			
			if (typeof records == 'undefined') {
				records = [];
			}
			
			for (var i = 0, record; record = records[i++];) {
				if (record.data.id == 0) {
					record.data.id = i;
				}
			}
			
			Ext.getBody().mask('Saving into local storage...', 'x-mask-loading', false);
			alert('Total ' + records.length + ' stations loaded');
			
			this.proxy.clear();
			this.loadRecords(records);
			
			this.sync();//300 station need 15s, too slow
			Ext.getBody().unmask();
		}, this);
	}
});