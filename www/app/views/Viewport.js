app.views.Viewport = Ext.extend(Ext.Panel, {
    fullscreen: true,
    layout: 'card',
    cardSwitchAnimation: 'slide',
    initComponent: function() {
		try{
		var aa=new app.views.StationChart()
		}catch(e){alert('xx:'+e)}
		//put instances of cards into app.views namespace
		Ext.apply(app.views, {
			stationList: new app.views.StationList(),
			stationChart: aa,
			//contactForm: new app.views.ContactForm()
		});
		//put instances of cards into viewport
		Ext.apply(this, {
			items: [
				app.views.stationList,
				app.views.stationChart,
				//app.views.contactForm,
			]
		});
		
        app.views.Viewport.superclass.initComponent.apply(this, arguments);
    }
});