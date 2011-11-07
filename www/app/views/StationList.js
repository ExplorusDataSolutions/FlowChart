app.views.StationList = Ext.extend(Ext.TabPanel, {
	tabBar: {
		dock: 'bottom',
		layout: {
			pack: 'center'
		}
	},
	fullscreen: true,
	ui: 'light',
	cardSwitchAnimation: {
		type: 'cube',
		//cover: true
	},
	defaults: {
		scroll: 'vertical'
	},
	
	items: [{
		id: 'card-stations',
		title: 'Stations',
		iconCls: 'search',
		cls: 'card',
		dockedItems: [{
			xtype: 'toolbar',
			items: [{
				xtype: 'searchfield',
				placeHolder: 'Search',
				name: 'keyword',
				listeners: {
					change: function() {
						//alert(this.getValue())
					},
					keyup: function() {
						var store = app.stores.stations,
							keyword = this.getValue().toLowerCase();
						
						store.filterBy(function(item, key){
							return item.get('station').toLowerCase().indexOf(keyword) != -1;
						});
					}
				}
			}, {
				//text: 'Refresh',
				iconCls: 'refresh',
				handler: function() {
					confirm(
						'Load stations from server? Timeout is extended to 180 seconds',  // message
						function(button) {
							if (button == 1) {// 1 for OK
								var store = app.stores.stations;
								store.loadStationListFromServer(180);
							}
						},
						'Refresh local data',	// title
						'Ok,Cancel'				// so is default
					);
				},
			}],
			defaults: {
				iconMask: true,
				ui: 'plain'
			},
		}],
		layout: 'fit',
		items: [{
			xtype: 'list',
			store: app.stores.stations,
			itemTpl: [
				'<div>',
					'<div class="title">',
						'<span>{id}. </span>',
						'<a class="', '<tpl if="hasdata">has-data</tpl>', '<tpl if="!hasdata">no-data</tpl>', '">{station}</a>',
					'</div>',
					'<div class="info ', '<tpl if="lonlat==true">has-location</tpl>', '<tpl if="lonlat==false">no-location</tpl>', '">',
						'<table><tr><td>',
						'<tpl if="lonlat"><div class="lonlat">{lon}, {lat}</div></tpl>',
						'<div class="layers">',
							'<tpl for="layers">',
								'<tpl if="values[1]"><a class="has-data">{0}<a></tpl>',
								'<tpl if="!values[1]"><a class="no-data">{0}<a></tpl>',
								'<tpl if="xindex!=xcount"><a class="no-data">&nbsp;- </a></tpl>',
							'</tpl>',
						'</div>',
						'</td></tr></table>',
					'</div>',
				'</div>',
			],
			grouped: true,
			indexBar: true,
			listeners: {
				itemtap: function(view, index, item, event) {
					var el = event.target;
					if (el.parentNode.className == 'layers') {
						var record = this.store.getAt(index),
							station = record.get('station'),
							layer = el.innerHTML;
						
						// bold station name
						Ext.query('div[class=title] > a', item)[0].setStyle('font-weight:bold');
						app.views.stationChart.updateWithRecord(record, layer);
						
						Ext.dispatch({
							controller: app.controllers.stations,
							action: 'show',
							animation: {type:'slide', direction:'left'}
						});
						
						app.views.stationChart.getComponent('chart').renderChart(station, layer);
					}
				}
			}
			/*onItemDisclosure: function (record) {
				Ext.dispatch({
					controller: app.controllers.stations,
					action: 'show',
					station: record.get('station'),
				});
			}*/
		}],
	}, {
		title: 'About',
		html: '<h1>About Card</h1>',
		iconCls: 'info',
		cls: 'card'
	}, {
		title: 'Favorites',
		html: '<h1>Favorites Card</h1>',
		iconCls: 'favorites',
		cls: 'card',
		badgeText: '4'
	}, {
		title: 'Settings',
		html: '<h1>Settings Card</h1>',
		cls: 'card',
		iconCls: 'settings'
	}],
	
    initComponent: function() {
		// this is better than "var store = app.stores.stations"
		var store = this.items[0].items[0].store;
		
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
		
        app.views.StationList.superclass.initComponent.apply(this, arguments);
    }
});