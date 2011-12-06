app.stores.chart = new Lawnchair({adaptor:'dom'})


app.views.Select = Ext.extend(Ext.form.Select, {
    // @private
    getPicker: function() {
        if (!this.picker) {
            this.picker = new Ext.Picker({
                slots: [{
                    align       : 'center',
                    name        : this.name,
                    valueField  : this.valueField,
                    displayField: this.displayField,
                    value       : this.getValue(),
                    store       : this.store
                }],
                listeners: {
                    change: this.onPickerChange,
                    scope: this,
					cancel: this.onPickerCancel,
                }
            });
        }

        return this.picker;
    },
	// @private
    getListPanel: function() {
        if (!this.listPanel) {
            this.listPanel = new Ext.Panel({
                floating         : true,
                stopMaskTapEvent : false,
                hideOnMaskTap    : true,
                cls              : 'x-select-overlay',
                scroll           : 'vertical',
                items: {
                    xtype: 'list',
                    store: this.store,
                    itemId: 'list',
                    scroll: false,
                    itemTpl : [
                        '<span class="x-list-label {cls}">{' + this.displayField + '}</span>',
                        '<span class="x-list-selected"></span>'
                    ],
                    listeners: {
                        select : this.onListSelect,
                        scope  : this
                    }
                }
            });
        }

        return this.listPanel;
    },
	onPickerCancel: function(picker) {
		this.fireEvent('cancel', this);
    },
});
Ext.reg('app.views.Selectfield', app.views.Select);


app.views.LayerChart = Ext.extend(Ext.Panel, {
	fullscreen: true,
    dockedItems: [{
        xtype: 'toolbar',
        title: '',
		scroll: 'horizontal',
		layout: {
			pack: 'left'
		},
        items: [{
			id: 'comp-chart-back',
			text: 'Back',
			ui: 'back'
		}, {
		//	id: 'comp-chart-title',
		//	text: 'View chart'
		//}, {
			id: 'comp-chart-layers',
			width: 200,
			xtype: 'app.views.Selectfield',
			name: 'layerlist',	// important for the select list to work properly on iPhone
			options: [{
				value: '',
				text: '- Select layers -'
			}],
		}]
    }],
    items: [{
		id: 'comp-chart',
		xtype: 'component',	// important for auto max
		style: 'height: 100%; padding: 10px 20px',
		html: [
			'<div id="chart-title"></div>',
			'<div id="chart-container"></div>',
			'<div class="credit">Data from Alberta Environment</div>',
			'<img height="50" src="css/images/logo-ltdf.png" />'
		]
	}],
	initEvents: function() {
        app.views.LayerChart.superclass.initEvents.call(this);
		
		var me = this;
		
		/**
		 * 当点击左上角的返回按钮，从 chart 返回 stations 列表
		 * when click the "back" button to go back to station list
		 */
		var comp = Ext.ComponentMgr.get('comp-chart-back');
		comp.on('tap', function () {
			console.log('comp-chart-back tap');
			
			var el = Ext.get('chart-container');
			el.dom.innerHTML = '';
			
			Ext.dispatch({
				controller: app.controllers.stations,
				action: 'index',
				animation: {type:'slide', direction:'right'}
			});
		});
		
		
		/**
		 * 当此 card 被激活
		 * when this card is activated
		 */
		this.on('activate', function() {
			console.log('view-chart activate');
			me.renderChart();
		});
		
		
		/**
		 * when layers select list is done
		 */
		var comp = Ext.ComponentMgr.get('comp-chart-layers');
		comp.on('change', function(select, value) {
			this.layer = value;
			this.renderChart();
		}, this);
		
		
		/**
		 * when layers select is cancelled
		 */
		var comp = Ext.ComponentMgr.get('comp-chart-layers');
		comp.on('cancel', function(select) {
			if ('' == select.getValue()) {
				var el = Ext.get('chart-container');
				el.dom.innerHTML = '';
				
				Ext.dispatch({
					controller: app.controllers.stations,
					action: 'index',
					animation: {type:'slide', direction:'right'}
				});
			}
		}, this);
	},
	renderChart: function() {
		var size = Ext.get('comp-chart').getSize(),
			summaryHeight = 50, adjust = 150;
		Ext.get('chart-container').setStyle({height: (size.height - adjust) + 'px'});
		
		var record = this.record,
			layers = record.get('layers');
		if (!this.layer) {
			var comp = Ext.ComponentMgr.get('comp-chart-layers');
			comp.showComponent();
			return true;
		}
		
		var layer = this.layer,
			station = record.get('station'),
			cacheKey = station + '-' + layer;
		var chart_data = [];
		HumbleFinance.trackFormatter = function (obj) {
			var x = Math.floor(obj.x);
			var data = chart_data[x];
			var text = data[2].substring(0, 16) + ", " + data[1];
			
			return text;
		};
		HumbleFinance.yTickFormatter = function (n) {
			var y = this.axes.y,
				ticks = y.ticks;
			
			if (ticks.length == 0) {
				if (y.options.labelUnit) {
					if (y.options.labelUnit.match(/\(.+\)/)) {
						unit = ' ' + y.options.labelUnit;
					} else {
						unit = ' (' + y.options.labelUnit + ')';
					}
				} else {
					unit = '';
				}
				ticks.push({
					v: y.max,
					label: '<br />' + y.min.toFixed(2) + ' - ' + y.max.toFixed(2) + unit
				})
			}
			if (n == ticks[0].v) {
				return '';
			}
			
			return n;
		};
		HumbleFinance.xTickFormatter = function (n) {
			n = Math.floor(n);// n sometimes is "0.0"
			var date = chart_data[n][2];
			return date.substring(5, 10) + '<br />' + date.substring(11, 16); 
		}
		
		app.stores.chart.get(cacheKey, function(cache) {
			if (cache && cache.data && (new Date()).getTime() - cache.expireDate < 900000) {//15 minutes
				chart_data = cache.data;
				unit = cache.unit;
				
				// for basin_2_datatype_1_rathjasp, all data is -999
				if (chart_data.length == 0) {
					alert('No data available');
				}
				
				HumbleFinance.init('chart-container', chart_data, {
					yAxis: {
						labelUnit: unit,
					},
					priceHeight: size.height - summaryHeight - adjust + 'px',
					summaryHeight: summaryHeight + 'px',
				});
			} else {
				Ext.getBody().mask('Loading...', 'x-mask-loading', false);
				
				Ext.Ajax.request({
					url: 'http://www.albertawater.com/awp/api/realtime/station',
					jsonData: {
						request: "getdata",
						serviceid: 2,
						layerid: layer,
						time : {
							begintime: '',
							endtime: ''
						},
						station: station
					},
					timeout: 180 * 1000,
					success: function(response, opts) {
						Ext.getBody().unmask();
						
						var obj = Ext.decode(response.responseText),
							unit = obj.data[0].unit
						try {
							rawData = obj.data[0].readings.reverse();
						} catch(e) {
							rawData = [];
						}
						
						
						if (rawData.length == 0) {
							alert('No data available');
						}
						
						for (var i = 0, row; row = rawData[i]; i++) {
							chart_data.push([i, row.value, row.time]);
						}
						
						HumbleFinance.init('chart-container', chart_data, {
							yAxis: {
								labelUnit: unit,
							},
							priceHeight: size.height - summaryHeight - adjust + 'px',
							summaryHeight: summaryHeight + 'px',
						});
						
						app.stores.chart.save({
							key: cacheKey,
							expireDate: (new Date()).getTime(),
							data: chart_data,
							unit: unit
						});
					},
					failure: function(response, opts) {
						console.log('server-side failure with status code ' + response.status);
						alert("Load chart data failure");
						Ext.getBody().unmask();
					}
				});
			}
		})
	},
    updateWithRecord: function(record, layer) {
		this.record = record;
		
		// allow this.layer to remeber last value
		var layer = layer || this.layer;
		if (layer) {
			this.layer = '';
			var layers = record.get('layers');
			for (var i = 0; i < layers.length; i++) {
				if (layer == layers[i][0]) {
					this.layer = layer;
					break;
				}
			}
		}
		
		// fill the layers list for current record
		var options = [],
			layers = record.get('layers');
		for (var i = 0; i < layers.length; i++) {
			var layer = layers[i];
			options.push({
				value: layer[0],
				text: layer[0] + (layer[2] == 0 ? '(no data)' : ''),
				cls: layer[2] == 0 ? 'no-data' : 'has-data',
			});
		}
		var comp = Ext.ComponentMgr.get('comp-chart-layers');
		comp.setOptions(options);
		
	
		var toolbar = this.getDockedItems()[0],
			station = record.get('station');
		//toolbar.setTitle(station + ' - ' + layer);
		//var comp = Ext.ComponentMgr.get('comp-chart-title');
		//comp.setText(station + (layer ? ' - ' + layer : ''));
		Ext.get('chart-title').update(station);
		
		app.stores.history.setVisited(record);
    }
});