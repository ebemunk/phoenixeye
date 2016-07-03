import KaTeX from 'katex'
require('katex/dist/katex.min.css')

export default function katex () {
	const directive = {
		restrict: 'E',
		scope: {},
		link: (scope, element) => {
			KaTeX.render(element.text(), element[0])
		}
	}
	return directive
}
