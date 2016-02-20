/*global angular*/

angular.module('phoenixeye')
.controller('ColorspaceController', ColorspaceController);

ColorspaceController.$inject = [
	'debug',
	'$scope',
	'localStorageService',
	'THREE'
];

function ColorspaceController (debug, $scope, localStorageService, THREE) {
	debug = debug('app:ColorspaceController');

	var vm = this;

	vm.alwaysDraw = localStorageService.get('colorspace.alwaysDraw');
	vm.alwaysDrawToggle = alwaysDrawToggle;
	vm.drawColorspace = drawColorspace;

	$scope.$watch('vm.pixelData', watchPixelData);

	function watchPixelData (pixelData) {
		if( ! pixelData ) {
			return;
		}

		debug('got pixel data', pixelData);

		if( localStorageService.get('colorspace.alwaysDraw') ) {
			drawColorspace();
		}
	}

	function alwaysDrawToggle () {
		localStorageService.set('colorspace.alwaysDraw', !! vm.alwaysDraw);
	}

	function drawColorspace () {
		if( ! vm.pixelData || vm.disabled ) {
			return;
		}

		vm.processing = true;

		var colorspaceWorker = new Worker('workers/colorspace.worker.js');

		colorspaceWorker.postMessage(vm.pixelData.data);

		colorspaceWorker.addEventListener('message', function (event) {
			renderColorspace(event.data);
		}, false);
	}

	function renderColorspace (uniqueColors) {
		//convenience to create vectors quickly
		function v (x,y,z) {
			return new THREE.Vector3(x,y,z);
		}
		//convenience to create colors
		function c (hex) {
			return new THREE.Color(hex);
		}

		//camera vars
		var WIDTH = 256,
			HEIGHT = 256;

		var VIEW_ANGLE = 45,
			ASPECT = WIDTH / HEIGHT,
			NEAR = 1,
			FAR = 10000;

		//main components of the whole thing
		var renderer = new THREE.WebGLRenderer();
		var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		var scene = new THREE.Scene();

		//controls (must be an easier way!)
		var controls = new THREE.OrbitControls(camera, renderer.domElement);
		var controls_dispatcher = new THREE.EventDispatcher();
		// controls_dispatcher.addEventListener('change', doesntfire);
		controls_dispatcher.apply(controls);

		//setup camera position & add to scene
		camera.position.z = 500;
		camera.position.x = 255;
		camera.position.y = 128;
		scene.add(camera);

		//renderer size & color
		renderer.setSize(WIDTH, HEIGHT);
		renderer.setClearColor('#000000');

		//main scatter plot
		var scatter_plot = new THREE.Object3D();
		scene.add(scatter_plot);

		//line geometry for axes
		var plot_axes_geom = new THREE.Geometry();
		plot_axes_geom.vertices.push(
			v(0,0,0), v(256,0,0), //x axis (red)
			v(0,0,0), v(0,256,0), //y axis (green)
			v(0,0,0), v(0,0,256) //z axis (blue)
		);

		plot_axes_geom.colors.push(
			c(0x000000), c(0xff0000),
			c(0x000000), c(0x00ff00),
			c(0x000000), c(0x0000ff)
		);

		//extrapolate start-end colors for each vertex (gradient)
		var plot_axes_material = new THREE.LineBasicMaterial({
			vertexColors: THREE.VertexColors,
			lineWidth: 1
		});

		var plot_axes = new THREE.Line(plot_axes_geom, plot_axes_material, THREE.LinePieces);
		scatter_plot.add(plot_axes);

		//line geometry for boundaries
		var plot_boundary_geom = new THREE.Geometry();
		plot_boundary_geom.vertices.push(
			//x-z
			v(256,0,0), v(256,0,256),
			v(0,0,256), v(256,0,256),
			//x-y
			v(256,0,0), v(256,256,0),
			v(0,256,0), v(256,256,0),
			//y-z
			v(0,256,0), v(0,256,256),
			v(0,0,256), v(0,256,256),
			//yz-xyz
			v(0,256,256), v(256,256,256),
			//xyz-xz
			v(256,256,256), v(256,0,256),
			//xyz-xy
			v(256,256,256), v(256,256,0)
		);

		var plot_boundary_material = new THREE.LineBasicMaterial({
			color: 0x808080,
			lineWidth: 1
		});

		var plot_boundary = new THREE.Line(plot_boundary_geom, plot_boundary_material);
		scatter_plot.add(plot_boundary);

		//points on the scatter plot
		var points_geom = new THREE.Geometry();
		var points_material = new THREE.PointCloudMaterial({
			vertexColors:true, size: 1.5
		});

		var points = new THREE.PointCloud(points_geom, points_material);
		for(var elem in uniqueColors) {
			var r = (elem >> 16) & 255,
				g = (elem >> 8) & 255,
				b = elem & 255;
			points_geom.colors.push(new THREE.Color().setRGB(r/255, g/255, b/255));
			points_geom.vertices.push(new THREE.Vector3(r,g,b));
		}
		scatter_plot.add(points);

		//center the cube to (0,0,0)
		scatter_plot.position.x = scatter_plot.position.y = scatter_plot.position.z = -128;

		//append to dom
		var domElement = angular.element(renderer.domElement);
		domElement.addClass('renderer');

		vm.element.append(domElement);
		vm.rendered = true;
		$scope.$digest();

		render();

		function render() {
			camera.lookAt(scene.position);
			controls.update();
			renderer.render(scene, camera);
			requestAnimationFrame(render);
		}
	}
}