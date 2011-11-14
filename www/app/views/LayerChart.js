app.stores.chart = new Lawnchair({adaptor:'dom'})


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
			id: 'comp-chart-title',
			text: 'View chart'
		}]
    }],
    items: [{
		id: 'comp-chart',
		xtype: 'component',	// important for auto max
		style: 'height: 100%; padding: 20px',
		html: ['<div id="chart-container"></div>',
			'<div class="credit">Data from Alberta Environment</div>',
			'<img height="50" src="css/images/logo-tesera.png" />'
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
	},
	renderChart: function() {
		var record = this.record,
			layer = this.layer || 'wd',
			station = record ? record.get('station') : 'Abee AGDM',
			cacheKey = station + '-' + layer,
			size = Ext.get('comp-chart').getSize(),
			summaryHeight = 50, adjust = 130;
		
		Ext.get('chart-container').setStyle({height: (size.height - adjust) + 'px'});
		
		var chart_data = [];
		HumbleFinance.trackFormatter = function (obj) {
			var x = Math.floor(obj.x);
			var data = chart_data[x];
			var text = data[2].substring(0, 16) + ", " + data[1];
			
			return text;
		};
		HumbleFinance.yTickFormatter = function (n) {
			// not to display the max label
			if (n == this.axes.y.max) {
				return '<br />(m3/s)';
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
				
				// for basin_2_datatype_1_rathjasp, all data is -999
				if (chart_data.length == 0) {
					alert('No data available');
				}
				
				HumbleFinance.init('chart-container', chart_data, {
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
						
						var obj = Ext.decode(response.responseText);
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
							priceHeight: size.height - summaryHeight - adjust + 'px',
							summaryHeight: summaryHeight + 'px',
						});
						
						app.stores.chart.save({
							key: cacheKey,
							expireDate: (new Date()).getTime(),
							data: chart_data
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
		this.layer = layer;
	
		var toolbar = this.getDockedItems()[0],
			station = record.get('station');
		//toolbar.setTitle(station + ' - ' + layer);
		var comp = Ext.ComponentMgr.get('comp-chart-title');
		comp.setText(station + ' - ' + layer);
		
		app.stores.history.setVisited(station);
    }
});