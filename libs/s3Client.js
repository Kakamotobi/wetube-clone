const {
	S3Client,
	DeleteObjectCommand,
	DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");

module.exports = {
	s3: new S3Client({
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		},
		region: process.env.AWS_S3_REGION,
	}),

	s3DeleteObject: async (key) => {
		try {
			await s3.send(
				new DeleteObjectCommand({ Bucket: "wetube-project-clone", Key: key })
			);
		} catch (err) {
			console.log(err);
		}
	},

	s3DeleteObjects: async (keys) => {
		try {
			const objects = [];
			for (let key of keys) {
				objects.push({ Key: key });
			}

			await s3.send(
				new DeleteObjectsCommand({
					Bucket: "wetube-project-clone",
					Delete: {
						Objects: objects,
					},
				})
			);
		} catch (err) {
			console.log(err);
		}
	},
};
