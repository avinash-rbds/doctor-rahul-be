var fs = require("fs");
const logger = require("../../../../config/logger");

exports.fetchPDF = (req, res) => {
    // FORMAT: assets/ church-wing / church-wing-pdf-1.pdf
    var pdf_folder_path = "public/pdfs/";
    var pdf_file_path = pdf_folder_path + req.params.wingname;
    var fileName = pdf_file_path + "/" + req.params.filename;

    fs.readFile(fileName, function (err, data) {
        if (err) {
            logger.error(
                `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()} ::: ERROR IN PDF ::: ${fileName} ::: ${err}`
            );
            fs.readFile(
                "public/pdfs/pdf_not_available.pdf",
                function (err, data) {
                    res.contentType("application/pdf");
                    res.send(data);
                }
            );
        } else {
            res.contentType("application/pdf");
            res.send(data);
        }
    });
};
