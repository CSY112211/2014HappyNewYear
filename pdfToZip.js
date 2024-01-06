const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

function compressPdfDirectory(directoryPath, zipFilePath) {
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.log(`${archive.pointer()} total bytes`);
        console.log('Compression finished successfully.');
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);

    // 遍历目录下所有的 PDF 文件，并添加到 ZIP 中
    const pdfFiles = fs.readdirSync(directoryPath).filter(file => file.endsWith('.pdf'));

    // console.log(pdfFiles)

    pdfFiles.forEach(pdfFile => {
        const filePath = `${directoryPath}/${pdfFile}`;

        // console.log(filePath)
        archive.append(fs.createReadStream(filePath), { name: pdfFile });
    });

    // 完成压缩并关闭 ZIP 文件
    archive.finalize();
}
module.exports = compressPdfDirectory
// 示例使用
// const directoryPath = '/path/to/pdf/directory';
// const zipFilePath = '/path/to/output/zip/file.zip';

// compressPdfDirectory('./pdf', './zip');
