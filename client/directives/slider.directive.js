import noUiSlider from 'no-ui-slider'
import 'no-ui-slider/css/nouislider.css'

export default function slider () {
	var directive = {
		restrict: 'E',
		scope: {
			//noUiSlider params
			step: '=',
			start: '=',
			connect: '=',
			direction: '=',
			snap: '=',
			animate: '=',
			range: '=',
			orientation: '=',
			margin: '=',
			limit: '=',
			behaviour: '=',
			// format: '=',
			pips: '=',

			//angular-specific attrs
			// slider: '=',
			ngModel: '=',
			formatInteger: '='
		},
		require: 'ngModel',
		template: '<div></div>',
		replace: true,
		link: link
	}

	return directive

	function link (scope, element, attrs, ngModelCtrl) {
		var ngModelWatchDeregisterFn

		//prevent memory leaks on destroy
		scope.$on('$destroy', destroy)

		//watch noUiSlider options & reconstruct if they change
		scope.$watchCollection(
			function () {
				return [
					scope.step,
					scope.start,
					scope.connect,
					scope.direction,
					scope.snap,
					scope.animate,
					scope.range,
					scope.orientation,
					scope.margin,
					scope.limit,
					scope.behaviour,
					scope.format,
					scope.pips,
					scope.formatInteger
				]
			},
			initialize
		)

		//initialize slider
		function initialize () {
			//convenience to get integer formatting
			if( ! scope.format && attrs.hasOwnProperty('formatInteger') && attrs.formatInteger ) {
				scope.format = {
					to: function (val) {
						return Math.round(val)
					},
					from: function (val) {
						return val
					}
				}
			}

			//remove old noUiSlider if it was already initialized
			if( element[0].noUiSlider ) {
				destroy()
			}

			//create element
			var slider = noUiSlider.create(element[0], {
				step: scope.step,
				start: scope.start,
				connect: scope.connect,
				direction: scope.direction,
				snap: scope.snap,
				animate: scope.animate,
				range: scope.range,
				orientation: scope.orientation,
				margin: scope.margin,
				limit: scope.limit,
				behaviour: scope.behaviour,
				format: scope.format,
				pips: scope.pips
			})

			scope.slider = slider

			var update = true

			element[0].noUiSlider.on('update', function () {
				var val = element[0].noUiSlider.get()
				update = false
				ngModelCtrl.$setViewValue(val)
			})

			ngModelWatchDeregisterFn = scope.$watch('ngModel', function (newV) {
				if( ! update ) {
					update = true
					return
				}
				element[0].noUiSlider.set(newV)
			})
		}

		//destroy slider and remove watchers/events
		function destroy () {
			if( angular.isFunction(ngModelWatchDeregisterFn) ) {
				ngModelWatchDeregisterFn()
			}

			element[0].noUiSlider.off('update')
			element[0].noUiSlider.destroy()
		}
	}
}
