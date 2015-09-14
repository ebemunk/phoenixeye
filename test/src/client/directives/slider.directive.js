'use strict';

describe('Directive: slider', function () {
	var $compile;
	var $rootScope;
	var noUiSlider;

	beforeEach(module('phoenixeye'));
	beforeEach(module('templates'));

	beforeEach(inject(function ($injector) {
		$compile = $injector.get('$compile');
		$rootScope = $injector.get('$rootScope');
		noUiSlider = $injector.get('noUiSlider');
	}));

	it('should require ngModel', function () {
		var scope = $rootScope.$new();

		should.Throw(function () {
			$compile('<slider start="start" range="range"></slider>')(scope);
		});
	});

	it('should initialize noUiSlider', function () {
		var scope = $rootScope.$new();

		scope.start = [0];
		scope.range = {
			min: [1],
			max: [100]
		};

		var element = $compile('<slider start="start" range="range" ng-model="myModel"></slider>')(scope);

		scope.$digest();

		should.exist(element[0].noUiSlider);
	});

	it('should update ngModel when slider value updates', function () {
		var scope = $rootScope.$new();

		scope.start = [0];
		scope.range = {
			min: [1],
			max: [100]
		};

		var element = $compile('<slider start="start" range="range" ng-model="myModel"></slider>')(scope);

		scope.$digest();

		element[0].noUiSlider.set([25]);

		scope.$digest();

		scope.myModel.should.equal('25.00');
	});

	it('should update slider when ngModel value is changed', function () {
		var scope = $rootScope.$new();

		scope.start = [0];
		scope.range = {
			min: [1],
			max: [100]
		};

		var element = $compile('<slider start="start" range="range" ng-model="myModel"></slider>')(scope);

		scope.$digest();

		scope.myModel = 30;

		scope.$digest();

		element[0].noUiSlider.get().should.equal('30.00');
	});

	it('should re-initialize the slider if any option changes', function () {
		var scope = $rootScope.$new();

		scope.start = [0];
		scope.range = {
			min: [1],
			max: [100]
		};

		var element = $compile('<slider start="start" range="range" ng-model="myModel"></slider>')(scope);

		scope.$digest();

		var destroySpy = sinon.spy(element[0].noUiSlider, 'destroy');

		scope.range = {
			min: [1],
			max: [25]
		};

		scope.$digest();

		destroySpy.calledOnce.should.be.true;
		should.exist(element[0].noUiSlider);

		destroySpy.restore();
	});

	it('should destroy the slider if scope is destroyed', function () {
		var scope = $rootScope.$new();

		scope.start = [0];
		scope.range = {
			min: [1],
			max: [100]
		};

		var element = $compile('<slider start="start" range="range" ng-model="myModel"></slider>')(scope);

		scope.$digest();

		var destroySpy = sinon.spy(element[0].noUiSlider, 'destroy');

		scope.$destroy();

		destroySpy.calledOnce.should.be.true;
		should.not.exist(element[0].noUiSlider);

		destroySpy.restore();
	});

	it('should use custom integer formatter if formatInteger is true', function () {
		var scope = $rootScope.$new();

		scope.start = [0];
		scope.range = {
			min: [1],
			max: [100]
		};

		var element = $compile('<slider start="start" range="range" ng-model="myModel" format-integer="true"></slider>')(scope);

		scope.$digest();

		element[0].noUiSlider.set([25]);

		scope.$digest();

		scope.myModel.should.equal(25);
	});
});