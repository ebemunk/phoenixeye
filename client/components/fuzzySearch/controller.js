import Fuse from 'fuse.js'
import _ from 'lodash'
import debug from 'debug'

const log = debug('cli:components:fuzzySearch')

let DI

export default class FuzzySearchController {
	static $inject = [
		'$scope',
	]

	constructor() {
		DI = _.zipObject(FuzzySearchController.$inject, [...arguments])
		DI.$scope.$watch('$ctrl.list', ::this.listWatcher)
	}

	clear() {
		this.search = ''
		this.filter()
	}

	filter() {
		if( ! this.search ) {
			this.filtered = this.list
			return
		}
		const matches = this.fuzzySearch
		.search(this.search)
		.map(function (el) {
			return el.key
		})
		this.filtered = this.buildFilteredObject(matches)
	}

	listWatcher(list) {
		this.filtered = list
		if( ! list ) return
		const fuzzySearchArray = this.buildFuzzySearchArray(list)
		this.fuzzySearch = new Fuse(fuzzySearchArray, {
			keys: ['key', 'val'],
			threshold: 0.4
		})
	}


	buildFuzzySearchArray(obj) {
		let array = []
		for( const field in obj ) {
			for( const prop in obj[field] ) {
				array = array.concat(
					Object.keys(obj[field][prop]).map(key => {
						return {
							key: key,
							val: obj[field][prop][key]
						}
					})
				)
			}
		}
		return array
	}

	buildFilteredObject(matches) {
		const obj = {}
		for( const field in this.list ) {
			for( const prop in this.list[field] ) {
				for( const key in this.list[field][prop] ) {
					if( matches.indexOf(key) < 0 ) continue
					if( ! obj[field] ) {
						obj[field] = {}
					}
					if( ! obj[field][prop] ) {
						obj[field][prop] = {}
					}
					obj[field][prop][key] = this.list[field][prop][key]
				}
			}
		}
		return obj
	}
}
