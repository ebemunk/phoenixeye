import $ from 'jquery'

export default function collapseWhen () {
	const directive = {
		restrict: 'A',
		scope: {
			collapseWhen: '='
		},
		link: (scope, element) => {
			scope.$watch('collapseWhen', value => {
				if( value ) {
					$(element).stop().slideUp()
				} else {
					$(element).stop().slideDown()
				}
			})
		}
	}
	return directive
}
