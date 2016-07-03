import template from './index.html'

let component = {
	restrict: 'E',
	template,
	bindings: {
		toggle: '='
	}
}

export default component
