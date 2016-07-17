import $ from 'jquery'

class Magnifier {
	constructor(scope, element) {
		this.scope = scope
		this.element = $(element)
		this.scope.magnifier = {
			active: true,
			power: 2
		}
		this.toggle()
	}

	toggle() {
		this.target = $(this.scope.target)

		if( ! this.scope.magnifier.active ) {
			this.scope.magnifier.active = true

			this.imageWatcher = this.scope.$watch(() => {
				return this.target.attr('src')
			}, ::this.adjustImage)
			this.sizeWatcher = this.scope.$watch(() => {
				return this.target.attr('class')
			}, ::this.adjustSize)

			this.target
			.on('mousemove', ::this.move)
			.on('mousewheel', ::this.zoom)
		} else {
			this.scope.magnifier.active = false

			this.imageWatcher && this.imageWatcher()
			this.sizeWatcher && this.sizeWatcher()

			this.target
			.off('mousemove')
			.off('mousewheel')
		}

		this.element.css({
			display: this.scope.magnifier.active ? 'block' : 'none'
		})
	}

	adjustImage(src) {
		this.element.css({
			'background-image': 'url(' + src + ')'
		})
		this.adjustSize()
	}

	adjustSize() {
		const x = this.target.width() * this.scope.magnifier.power
		const y = this.target.height() * this.scope.magnifier.power
		this.element.css({
			'background-size': x + 'px ' + y + 'px'
		})
	}

	move(e) {
		var offset = this.target.offset()
		var width = this.element.width() / 2
		var height = this.element.height() / 2

		var left = e.pageX - offset.left - width
		var top = e.pageY - offset.top - height
		var x = -(e.pageX - offset.left) * this.scope.magnifier.power + width
		var y = -(e.pageY - offset.top) * this.scope.magnifier.power + height

		this.element.css({
			left: left,
			top: top,
			'background-position': x + 'px ' + y + 'px'
		})
	}

	zoom(e) {
		e.preventDefault()
		if( e.originalEvent.deltaY > 0 ) {
			this.scope.magnifier.power = Math.min(this.scope.magnifier.power * 2, 128)
		} else {
			this.scope.magnifier.power = Math.max(2, this.scope.magnifier.power / 2)
		}
		this.scope.$apply(this.scope.magnifier)
		this.adjustSize()
		this.move(e)
	}
}

export default function magnifier() {
	const directive = {
		restrict: 'A',
		scope: {
			magnifier: '=',
			target: '@'
		},
		link: (scope, element) => {
			const mag = new Magnifier(scope, element)
			scope.magnifier.toggle = ::mag.toggle
		}
	}
	return directive
}
