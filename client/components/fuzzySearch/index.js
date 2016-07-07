import controller from './controller'
import template from './index.html'

let component = {
	restrict: 'E',
	controller,
	template,
	bindings: {
		list: '=',
		filtered: '='
	}
}

export default component
