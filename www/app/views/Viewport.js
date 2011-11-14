app.views.Viewport = Ext.extend(Ext.Panel, {
    fullscreen: true,
    layout: 'card',
    cardSwitchAnimation: 'slide',
    initComponent: function() {
		//put instances of cards into app.views namespace
		Ext.apply(app.views, {
			layerChart: new app.views.LayerChart(),
			stationList: new app.views.StationList(),
		});
		
		//put instances of cards into viewport
		Ext.apply(this, {
			items: [
				app.views.stationList,
				app.views.layerChart,
			]
		});
		
        app.views.Viewport.superclass.initComponent.apply(this, arguments);
    },
	initEvents: function() {
        app.views.Viewport.superclass.initEvents.call(this);
		
		/*this.on('fterrender', function() {
			app.stores.station.load();
			app.views.layerChart.record = app.stores.station.getAt(0);
			app.views.layerChart.layer = 'wd';
			app.views.layerChart.renderChart();
		});*/
	}
});