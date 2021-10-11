const formidable = require("formidable");
const cloudinary = require("cloudinary");

cloudinary.config({
    cloud_name: "rbds",
    api_key: "567783489792516",
    api_secret: "fL4QAa77VZLwzK7GeQD6YhbCHAI",
});

exports.uploadByFile = (req, res) => {
    const form = formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        cloudinary.uploader.upload(files.image.path, (result) => {
            // This will return the output after the code is exercuted both in the terminal and web browser
            // When successful, the output will consist of the metadata of the uploaded file one after the other. These include the name, type, size and many more.

            if (result.public_id) {
                console.log("***** -> \n", result.url);

                res.status(200).json({
                    success: 1,
                    file: {
                        url: `${result.url}`,
                        // ... and any additional fields you want to store, such as width, height, color, extension, etc
                    },
                });
            }
        });
    });
};
