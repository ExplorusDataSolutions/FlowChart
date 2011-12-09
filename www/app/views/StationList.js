app.views.StationList = Ext.extend(Ext.TabPanel, {
	id: 'view-station-list',
	tabBar: {
		dock: 'bottom',
		layout: {
			pack: 'center'
		},
		hidden: true,
	},
	fullscreen: true,
	ui: 'light',
	cardSwitchAnimation: {
		type: 'cube',
		//cover: true 	// cover means what?
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
			dock: 'top',
			items: [{
				id: 'station-search',
				xtype: 'searchfield',
				placeHolder: 'Search',
				name: 'keyword'
			}, {
				id: 'station-refresh',
				iconCls: 'refresh',
			}],
			defaults: {
				iconMask: true,
				ui: 'plain'
			},
		}, {
			xtype: 'toolbar',
			dock: 'bottom',
			items: [{
				id: 'comp-station-layers',
				xtype: 'selectfield',
				placeHolder: 'Select layer to filter',
				name: 'layer'
			}],
			defaults: {
				iconMask: true,
				ui: 'plain'
			},
		}],
		layout: 'fit',
		items: [{
			id: 'list-stations',
			xtype: 'list',
			store: app.stores.stations,
			itemTpl: [
				// let it be as simple as possible
				'<span>{id}. </span>',
				'<a <tpl if="visited">class="visited"</tpl>>{station}</a>'
		//		'<div class="title">',
		//			'<span>{id}. </span>',
		//			'<tpl if="visited"><strong></tpl>',
		//			'<a class="', '<tpl if="hasdata">has-data</tpl>', '<tpl if="!hasdata">no-data</tpl>', '">{station}</a>',
		//			'<tpl if="visited"></strong></tpl>',
		//		'</div>',
//					'<div class="info ', '<tpl if="lonlat==true">has-location</tpl>', '<tpl if="lonlat==false">no-location</tpl>', '">',
//						'<table><tr><td>',
//						'<tpl if="lonlat"><div class="lonlat">{lon}, {lat}</div></tpl>',
//						'<div class="layers">',
//							'<tpl for="layers">',
//								'<tpl if="values[1]"><a class="has-data">{0}<a></tpl>',
//								'<tpl if="!values[1]"><a class="no-data">{0}<a></tpl>',
//								'<tpl if="xindex!=xcount"><a class="no-data">&nbsp;- </a></tpl>',
//							'</tpl>',
//						'</div>',
//						'</td></tr></table>',
//					'</div>',
			],
			grouped: true,
			indexBar: true,
			onIndex : function(record, target, index) {
				var comp = Ext.ComponentMgr.get('list-stations');
				var k = record.get("key").toLowerCase(), c = comp.store.getGroups(), h = c.length, j, d, b, a;
				for (d = 0; d < h; d++) {
					j = c[d];
					a = comp.getGroupId(j);
					if(a == k || a > k) {
						b = a;
						break
					} else {
						b = a
					}
				}
				b = comp.getTargetEl().down(".x-group-" + a);
				if (b) {
					comp.scroller.scrollTo({
						x : 0,
						y : b.getOffsetsTo(comp.scrollEl)[1]
					}, false, null, true)
				}	
			},
			onLoad : function() {
				var comp = Ext.ComponentMgr.get('list-stations');
				if (comp.scroller.offsetBoundary.top == 0) {
       				comp.scroller.updateBoundary();
    			}
			}
			// Itemtap event will disable this automatically
			//onItemDisclosure: function (record) {alert('Oops')
			//	app.views.stationList.showChart(record);
			//}
		}]
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
	}, {
		title: 'More',
		html: '<h1>More</h1>',
		cls: 'card',
		iconCls: 'more'
	}],
	initEvents: function() {
        app.views.StationList.superclass.initEvents.call(this);
		
		var me = this,
			store = app.stores.stations;
		
		
		/**
		 * 当视图 station-list 被激活
		 */
		var comp = Ext.ComponentMgr.get('view-station-list');
		comp.on('activate', function() {
			console.log('view-station-list activate');
			
			setTimeout(function() {
				store.loadStationListFromLastStatus();
			}, 100);
		});
		
		
		/**
		 * unload stations data, to make animation lightly
		 */
		var comp = Ext.ComponentMgr.get('card-stations');
		comp.on('beforedeactivate', function() {
			console.log('beforedeactivate, filterBy a function always return false instead of remove all data');
			
			store.unloadForGoodPerformance();
		});
		
		
		/**
		 * when card switch back to stations list
		 */
		var comp = Ext.ComponentMgr.get('view-station-list');
		comp.on('cardswitch', function(panel, newCard, oldCard, newIndex) {
			if (newCard.id == 'card-stations') {
				console.log('card-stations cardswitch back to stations list');
				
				// timeout is necessary for cube animation
				setTimeout(function() {
					store.loadStationListFromLastStatus();
				}, 100);
			}
		});
		
		
		/**
		 * click a layer to show chart
		 */
		var comp = Ext.ComponentMgr.get('list-stations');
		comp.on('itemtap', function(view, index, item, event) {
			var record = store.getAt(index);
			app.views.stationList.showChart(record);
			/*var el = event.target;
			
			if (el.parentNode.className == 'layers') {
				var record = store.getAt(index),
					layer = el.innerHTML,
					hasRealtimeData = el.className == 'has-data';
				
				if (!hasRealtimeData) {
					confirm('No real-time data for "' + layer + '"',
						function(button) {
							if (button == 1) {// 1 for OK
								me.showChart(record, layer);
							}
						}
					);
				}
				if (hasRealtimeData) {
					me.showChart(record, layer);
				}
			}*/
		});
		comp.store.addListener('load', comp.onLoad);
		
		/**
		 * Search stations
		 */
		var comp = Ext.ComponentMgr.get('station-search');
		comp.on('keyup', function() {
			var keyword = this.getValue().toLowerCase();
			
			if (keyword.length == 0) {
				delete store.statusFilters.keyword;
				store.loadStationListFromLastStatus();
			}
			if (keyword.length > 2) {
				var filters = store.statusFilters,
					previousKeyword = filters['keyword'] && filters['keyword'].previousKeyword;
				filters['keyword'] = function(item, key){
					return item.get('station').toLowerCase().indexOf(keyword) != -1;
				};
				filters['keyword'].previousKeyword = previousKeyword;
				filters['keyword'].currentKeyword = keyword;
				store.loadStationListFromLastStatus();
			}
		});
		if (Ext.Viewport.orientation == 'portrait') {
			comp.setWidth('250px');
		} else {
			comp.setWidth('400px');
		}
		
		/**
		 * Refresh stations
		 */
		var comp = Ext.ComponentMgr.get('station-refresh');
		comp.on('tap', function() {
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
		});
		
		//var comp = Ext.ComponentMgr.get('list-stations');
		//comp.indexBar.addListener('index', this.index);
		
		/**
		 *
		 */
		var comp = Ext.ComponentMgr.get('comp-station-layers');
		comp.on('change', function(select, value) {
			store.setLayerFilter(value);
			store.loadStationListFromLastStatus();
		}, this);
	},
	showChart: function(record, layer) {
		console.log('showChart called');
		
		var store = app.stores.stations;
		store.unloadForGoodPerformance();
			
		app.views.layerChart.updateWithRecord(record, layer);
		
		Ext.dispatch({
			controller: app.controllers.stations,
			action: 'show',
			animation: {type:'slide', direction:'left'}
		});
	},
	onOrientationChange : function(orientation, w, h) {
		var comp = Ext.ComponentMgr.get('station-search');
		if (orientation == 'portrait') {
			comp.setWidth('250px');
		} else {
			comp.setWidth('400px');
		}
	}	
});