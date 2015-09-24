//worker to extract unique colors from image data
self.addEventListener('message', function (event) {
	//pdata is the pixel data coming from the canvas, containing 4 elements (RGBA)
	var pdata = event.data;
	var unique_colors = {};

	for( var nx=0; nx<pdata.length; nx+=4 ) {
		//encode RGB to a single integer
		var idx = ((pdata[nx] & 0xff) << 16) + ((pdata[nx+1] & 0xff) << 8) + (pdata[nx+2] & 0xff);
		//looks weird, but saves space on unique_colors
		unique_colors[String(idx)] = true;
	}

	//pass unique_colors to the invoker
	self.postMessage(unique_colors);
}, false);