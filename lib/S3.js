import AWS from 'aws-sdk'
import appConfig from '../appConfig'

//loads credentials from my own machine otherwise
//cant tell if thats terrible or not
AWS.config.update({
	accessKeyId: appConfig.aws.accessKeyId,
	secretAccessKey: appConfig.aws.secretAccessKey
})

let s3 = new AWS.S3({
	params: {
		Bucket: appConfig.aws.bucket
	}
})

export default s3
