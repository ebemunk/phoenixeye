import angular from 'angular'

export default function isEmptyObjectFilter () {
	return filter

	function filter (value) {
		return angular.equals(value, {})
	}
}
