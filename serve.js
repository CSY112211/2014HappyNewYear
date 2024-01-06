// app.js

const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const port = 3000; // 可以使用任意未被占用的端口

// 定义一个简单的路由
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.get('/start', (req, res) => {
  res.send('Hello, Express!');
});


app.get('/download-zip', (req, res) => {
  // 设置 ZIP 文件名
  const zipFileName = 'output.zip';

  // 创建输出流
  const output = fs.createWriteStream(zipFileName);
  const archive = archiver('zip', { zlib: { level: 9 } });

  // 将 ZIP 文件输出到客户端
  res.attachment(zipFileName);
  archive.pipe(res);

  // 遍历目录下的所有 PDF 文件，并添加到 ZIP 中
  const pdfDirectory = './pdf';
  const pdfFiles = fs.readdirSync(pdfDirectory).filter(file => file.endsWith('.pdf'));

  pdfFiles.forEach(pdfFile => {
    const filePath = path.join(pdfDirectory, pdfFile);
    archive.append(fs.createReadStream(filePath), { name: pdfFile });
  });

  // 完成压缩并关闭 ZIP 文件
  archive.finalize();
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
