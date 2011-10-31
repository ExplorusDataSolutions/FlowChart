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
							return item.data.station.toLowerCase().indexOf(keyword) != -1;
						});
					}
				}
			}, {
				//text: 'Refresh',
				iconCls: 'refresh',
				handler: function() {
					navigator.notification.confirm(
						'Load stations from server?',  // message
						function(button) {
							if (button == 1) {// 1 for OK
								var store = app.stores.stations;
								store.loadStationListFromServer();
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
			itemTpl: '<div class="station"><span>{id}.</span> <a>{station}</a></div>',
			grouped: true,
			indexBar: true,
			onItemDisclosure: function (record) {
				Ext.dispatch({
					controller: app.controllers.stations,
					action: 'show',
					station: record.data.station
				});
			}
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
			navigator.notification.confirm(
				'Load stations right away?',  // message
				function(button) {
					if (button == 1) {// 1 for OK
						store.loadStationListFromServer();
					}
				},
				'Local data not detected',	// title
				'Ok,Cancel'				// so is default
			);
		}
		
        app.views.StationList.superclass.initComponent.apply(this, arguments);
    }
});