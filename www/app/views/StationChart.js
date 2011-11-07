app.views.StationChart = Ext.extend(Ext.Panel, {
	fullscreen: true,
    dockedItems: [{
        xtype: 'toolbar',
        title: 'View chart',
        items: [
            {
                text: 'Back',
                ui: 'back',
                listeners: {
                    'tap': function () {
                        Ext.dispatch({
                            controller: app.controllers.stations,
                            action: 'index',
                            animation: {type:'slide', direction:'right'}
                        });
                    }
                }
            },
            /*{xtype:'spacer'},
            {
                id: 'edit',
                text: 'Edit',
                ui: 'action',
                listeners: {
                    'tap': function () {
                        Ext.dispatch({
                            controller: app.controllers.contacts,
                            action: 'edit',
                            id: this.record.getId()
                        });
                    }
                }
            }*/
        ]
    }],
    items: [{
		id: 'chart',
		xtype: 'chart'
	}],
    updateWithRecord: function(record, layer) {
		//record.station = record
		//Ext.each(this.items.items, function(item) {
		//    item.update(record.data);
		//});
		var toolbar = this.getDockedItems()[0];
		toolbar.setTitle(record.get('station') + ' - ' + layer);
		//toolbar.getComponent('edit').record = record;
    }
});