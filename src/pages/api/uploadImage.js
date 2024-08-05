// import multer from 'multer';
// import AWS from 'aws-sdk';

// const upload = multer();

// export const config = {
//     api: {
//         bodyParser: false, // Disable body parsing, as we're using multer for file uploads
//     },
// };

// export default async function handler(req, res) {
//     try {
//         const s3 = new AWS.S3({
//             accessKeyId: 'AKIA45HL7IZT5EGOFWRF',
//             secretAccessKey: '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',
//             region: 'us-east-1',
//         });

//         upload.single('file')(req, res, async (err) => {
//             if (err) {
//                 console.error('Error uploading file:', err);
//                 return res.status(500).json({ error: 'Error uploading file' });
//             }

//             const params = {
//                 Bucket: 'sudheer-fbimages',
//                 Key: req.file.originalname,
//                 Body: req.file.buffer,
//             };

//             try {
//                 const data = await s3.upload(params).promise();
//                 const imageUrl = data.Location;

//                 // Send a response back to the client with the image URL
//                 return res.status(200).json({ imageUrl });
//             } catch (error) {
//                 console.error('Error uploading file to S3:', error);
//                 return res.status(500).json({ error: 'Error uploading file to S3' });
//             }
//         });
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// }
import multer from 'multer';
import AWS from 'aws-sdk';

const upload = multer();

export const config = {
    api: {
        bodyParser: false, // Disable body parsing, as we're using multer for file uploads
    },
};

export default async function handler(req, res) {
    try {
        const s3 = new AWS.S3({
            accessKeyId: 'AKIA45HL7IZT5EGOFWRF',
            secretAccessKey: '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',
            region: 'us-east-1',
        });

        upload.single('file')(req, res, async (err) => {
            if (err) {
                console.error('Error uploading file:', err);
                return res.status(500).json({ error: 'Error uploading file' });
            }

            const params = {
                Bucket: 'sudheer-fbimages',
                Key: req.file.originalname,
                Body: req.file.buffer,
                // ACL: 'public-read',
            };

            const data = await s3.upload(params).promise();
            const imageUrl = data.Location;

            res.status(200).json({ imageUrl });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}



