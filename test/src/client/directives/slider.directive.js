/*eslint-env node, mocha*/
/*global inject, should, sinon*/

'use strict';

describe('Directive: slider', function () {
	var $compile;
	var scope;

	beforeEach(module('phoenixeye'));
	beforeEach(module('templates'));

	beforeEach(inject(function ($injector) {
		$compile = $injector.get('$compile');
		scope = $injector.get('$rootScope').$new();
	}));

	it('should require ngModel', function () {
		should.Throw(function () {
			$compile('<slider start="start" range="range"></slider>')(scope);
		});
	});

	it('should initialize noUiSlider', function () {
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