Ext.Chart = Ext.extend(Ext.Component, {
	id: 'ml-chart',
	chartContainerId: 'xx',
	style: 'width: 100%; height: 100%; padding: 30px',
	
    initComponent : function() {
        this.mapOptions = this.mapOptions || {};
        
        this.scroll = false;
		this.chartContainerId = this.id + '-chart';
        
        /*if (!window.google) {
			var script = document.createElement("script");
			script.setAttribute("src", 'http://maps.google.com/maps/api/js?sensor=true&callback=gm_callback');
			script.setAttribute("type", "text/javascript");
			
			var me = this;
			window.gm_callback = function() {
				me.renderChart();
			}
			
			Ext.getHead().appendChild(script);
        }*/
		this.html = '<div id="' + this.chartContainerId + '"></div>';
		
        Ext.Chart.superclass.initComponent.call(this);
    },
	renderChart: function() {
		var size = this.el.getSize(true),
			chartEl = Ext.get(this.chartContainerId);
		
		chartEl.applyStyles({
			border: '1px solid gray',
			height: size.height + 'px'
		});
		
		var summaryHeight = 80;
		HumbleFinance.init(this.chartContainerId, priceData, {
			touchable: true,//window.navigator.userAgent.match(/Android/)
			priceHeight: size.height - summaryHeight + 'px',
			summaryHeight: summaryHeight + 'px',
		});
	}
});

Ext.reg('chart', Ext.Chart);