	
function init() { 
		/*Initialize the map*/
		initMap();
		
		/*Load the data*/
		var data = new DataLoader();
		//added
		data.loadPosData("data/test.json");
			
				
	}
function circleSelection(element){
	if (element.checked){
		console.log("cvvv");
	}
}

function visualize(data){	
	
		/**
		 * initialize WGL with link to data, the relative path to the shader folder, and id of the map div
		 */
		WGL = new WGL(data.num,'vl/', 'map');		
		
		/**
		 * map is global variable from Open Layers, we set our onMove 
		 * function to be called any time the map moves 
		 */		 
		map.events.register("move", map, onMove);							
			
		/**
		 * Adding heatmap, point map and polybrush interactions
		 */
		WGL.addHeatMapDimension(data.pts, 'heatmap');
		WGL.addMapDimension(data.pts, 'themap');
		WGL.addColorFilter('themap','colorbrush');
		WGL.addPolyBrushFilter('themap','polybrush');
		
		
		/**
		 * Adding fitering by map extent
		 */
		WGL.addExtentFilter();
	
	
		/**
		 * Configuring the histograms and charts
		 */
		var charts = [];
		
		/** Histogram for severity */
		/** we are still unsure on this calculation. It needs work from the traffic users to let us know what they would like - testing
		 ** we need to work on the domain as we have to many to make the histogram work as required and we are getting alot of console missing data warnings
		 ** is this the correct one to use?
		 */
		var sev   = {data: data.sev,  domain: ['0.0','0.1','0.2','0.3','0.4','0.5','0.6','0.7','0.8','0.9','1.0',
		'1.1','1.2','1.3','1.4','1.5','1.6','1.7','1.8','1.9','2.0',
		'2.1','2.2','2.3','2.4','2.5','2.6','2.7','2.8','2.9','3.0'] ,  name: 'sev', type:'ordinal' };	
		WGL.addOrdinalHistDimension(sev);
		WGL.addLinearFilter(sev,5, 'sevF');
		charts['sev']   = new StackedBarChart(sev, "chart3", "Flow/Speed Calculation Ratio","sevF");
		
		/** Histogram for days*/
		var days = {data: data.days,  domain: data.daysarray,  name: 'days', type:'ordinal'};			
		WGL.addOrdinalHistDimension(days);
		WGL.addLinearFilter(days,7, 'daysF');		
		charts['days'] = new StackedBarChart(days, "chart1", "Day of the week","daysF");
		
		/** Histogram for hours*/
		var hours = {data: data.hours,  min:0, max:24, num_bins: 24, name: 'hours',type:'linear'} ;
		WGL.addLinearHistDimension(hours);
		WGL.addLinearFilter(hours, 24*10, 'hoursF');
		charts['hours'] = new StackedBarChart(hours, "chart2", "Hour of the day","hoursF");
		
		/** Histogram for flow*/
		/** need advice on the flow rate. This was set just to test return  - testing*/
		var flow = {data: data.flow,  min:0.0, max:90.0, num_bins: 90, name: 'flow',type:'ordinal'} ;
		WGL.addLinearHistDimension(flow);
		WGL.addLinearFilter(flow,90, 'flowF');
		charts['flow'] = new StackedBarChart(flow, "chart4", "Flow Rate","flowF");
		
		/** Histogram for speed
		 ** A speed of 80 is essentially a dead sensor or dead reading at that moment in time * need advice - testing*/
		var speed = {data: data.speed,  min:0, max:79, num_bins: 79, name: 'speed',type:'ordinal'} ;
		WGL.addLinearHistDimension(speed);
		WGL.addLinearFilter(speed,79, 'speedF');
		charts['speed'] = new StackedBarChart(speed, "chart5", "Speed","speedF");
		
		/**
		 * Addin all charts
		 */		
		WGL.addCharts(charts);
		
		/**
		 * Initilizing all the filters
		 */
		WGL.initFilters();
		
		/** Drawing the map fist time */
		WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC());
		//WGL.render();
		
		
		var radius = 10.;		
		
		/*define radius fucntion*/
		WGL.getDimensions()['heatmap'].radiusFunction = function(z){			
			var res = radius* (z-10);
			//console.log(res);
			return  res ;
			};
		$("#slider_radius").on("input", function(){			
			radius = this.value;			
			WGL.render();			
		});
		
		$("#slider_color").on("input", function(){						
			WGL.filterDim('themap',"colorbrush",this.value);			
		});
	}
			
	

	

/**
 * Function to calculate top left corner of the map in pixels for zoom 0
 * @returns {___anonymous_res}
 */	
function getTopLeftTC() {

	
	var tlwgs = (new OpenLayers.LonLat(-180, 90)).transform(
			new OpenLayers.Projection("EPSG:4326"),
		 	new OpenLayers.Projection("EPSG:900913"));
	
	var s = Math.pow(2, map.getZoom());
	tlpixel = map.getViewPortPxFromLonLat(tlwgs);
	res = {
			x : -tlpixel.x / s,
			y : -tlpixel.y / s
	}
	//console.log(res);
	return res;
}
	
/**
 * Function to for moving the map event.
 */
function onMove() {			
		WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC(), WGL.filterByExt);
}
	
	
	