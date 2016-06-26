if( process.env.NODE_ENV !== 'production' ) {
	require('dotenv').config({silent: true})
}

export default {
	env: process.env.NODE_ENV || 'development',
	port: 3000,
	dbString: process.env.DB_STRING || 'mongodb://xxx:xxx@xxx.xxx.xxx:555/xxx',
	upload: {
		maxFiles: 1,
		sizeLimit: 8388608,
		acceptedTypes: {
			'image/jpeg': 'jpg',
			'image/pjpeg': 'jpg',
			'image/png': 'png',
			'image/x-png': 'png',
			'image/tiff': 'tiff'
		},
		maxDims: 15000000
	},
	defaultAnalysisOpts: {
		ela: {
			quality: 70
		},
		avgdist: true,
		lg: true,
		hsv: {
			whitebg: false
		},
		labfast: {
			whitebg: false
		},
		copymove: {
			retain: 4,
			qcoeff: 1
		},
		autolevels: false
	},
	bin: {
		phoenix: process.env.BIN_PHOENIX || './server/bin/phoenix'
	},
	analytics: {
		rollbar: {
			serverToken: process.env.ROLLBAR_SERVER_TOKEN || '',
			clientToken: process.env.ROLLBAR_CLIENT_TOKEN || ''
		},
		google: {
			id: process.env.GOOGLE_ANALYTICS_ID || ''
		},
		heap: {
			id: process.env.HEAP_ANALYTICS_ID || ''
		}
	},
	aws: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'x',
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'x',
		bucket: process.env.AWS_S3_BUCKET || ''
	}
}
