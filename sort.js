const fs = require('fs');
const path = require('path');

const readFilesRecursively = (directoryPath, fileCallback) => {
    const fileNames = fs.readdirSync(directoryPath);

    for (const fileName of fileNames) {
        const filePath = path.join(directoryPath, fileName);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            // 如果是子目录，则递归遍历
            readFilesRecursively(filePath, fileCallback);
        } else if (stats.isFile() && fileName.endsWith('.json')) {
            // 如果是 JSON 文件，则执行回调函数
            try {
                const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                fileCallback(jsonData);
            } catch (error) {
                console.error(`Error reading file ${filePath}:`, error.message);
            }
        }
    }
};

const directoryPath = path.join(__dirname, '/datas'); // 替换为实际的目录路径
let allData = [];


function getTop10() {
    readFilesRecursively(directoryPath, jsonData => {
        allData = allData.concat(jsonData);
    });

    // 根据冒号后的数字进行排序
    allData.sort((a, b) => {
        const numA = parseInt(a.split(':')[1]);
        const numB = parseInt(b.split(':')[1]);
        return numB - numA;
    });

    // 获取前十项
    const topTenItems = allData.slice(0, 10);
    console.log('Top ten items:', topTenItems);
    return topTenItems
}

module.exports = getTop10
