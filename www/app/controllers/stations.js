app.controllers.stations = new Ext.Controller({
    index: function(options) {
        app.views.viewport.setActiveItem(
            app.views.stationList, options.animation
        );
    },
    show: function(options) {
        var station = options.station,
			layer = options.layer;
		
		//app.views.stationChart.updateWithRecord({station: station});
		app.views.viewport.setActiveItem(
			app.views.stationChart, options.animation
		);
    },
    edit: function(options) {
        var id = parseInt(options.id),
            contact = app.stores.contacts.getById(id);
        if (contact) {
            app.views.contactForm.updateWithRecord(contact);
            app.views.viewport.setActiveItem(
                app.views.contactForm, options.animation
            );
        }
    }
});