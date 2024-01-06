// app.js

const express = require('express');
const app = express();
const port = 3000; // 可以使用任意未被占用的端口

// 定义一个简单的路由
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.get('/start', (req, res) => {
    res.send('Hello, Express!');
  });

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
