app.views.Viewport = Ext.extend(Ext.Panel, {
    fullscreen: true,
    layout: 'card',
    cardSwitchAnimation: 'slide',
    initComponent: function() {
        //put instances of cards into app.views namespace
        Ext.apply(app.views, {
            stationList: new app.views.StationList(),
            stationChart: new app.views.StationChart(),
            contactForm: new app.views.ContactForm()
        });
        //put instances of cards into viewport
        Ext.apply(this, {
            items: [
                app.views.stationList,
                app.views.stationChart,
                app.views.contactForm,
            ]
        });
        app.views.Viewport.superclass.initComponent.apply(this, arguments);
    }
});