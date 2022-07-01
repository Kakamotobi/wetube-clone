const { s3 } = require("../../libs/s3Client.js");
const {
	DeleteObjectCommand,
	DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");

modules.export = {
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
