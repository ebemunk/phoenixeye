export default function overlay () {
	var directive = {
		restrict: 'A',
		scope: {
			overlay: '='
		},
		link: link
	}

	return directive

	function link (scope, element) {
		if( element[0].tagName !== 'IMG' ) {
			throw new Error('overlay can only be used for <img> elements')
		}
		scope.overlay = {
			active: true,
			opacity: 50
		}
		scope.overlay.toggle = toggle
		toggle()

		function toggle () {
			if( ! scope.overlay.active ) {
				scope.overlay.active = true
				element.on('mousewheel', adjustOpacity)
			} else {
				scope.overlay.active = false
				element.off('mousewheel')
			}
			element.css({
				display: scope.overlay.active ? 'block' : 'none',
				opacity: scope.overlay.opacity / 100
			})
		}

		function adjustOpacity (e) {
			e.preventDefault()
			if( e.originalEvent.deltaY > 0 ) {
				scope.overlay.opacity = Math.min(scope.overlay.opacity + 5, 100)
			} else {
				scope.overlay.opacity = Math.max(0, scope.overlay.opacity - 5)
			}
			element.css({
				opacity: scope.overlay.opacity / 100
			})
			scope.$apply(scope.overlay)
		}
	}
}
