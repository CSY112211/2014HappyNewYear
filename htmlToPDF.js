const puppeteer = require('puppeteer');
const fs = require('fs');

async function htmlToPdf(html, outputPath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    // 设置一些可选项，例如页面大小、边距等
    await page.pdf({
        path: outputPath,
        format: 'A4',
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    await browser.close();
}


module.exports = htmlToPdf
// 示例使用
// const htmlString = '<html><body><h1>Hello, World!</h1></body></html>';
// const outputPath = 'output.pdf';

// htmlToPdf(htmlString, outputPath)
//     .then(() => {
//         console.log(`PDF saved to ${outputPath}`);
//     })
//     .catch(error => {
//         console.error('Error:', error.message);
//     });
