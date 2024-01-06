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

// 快速排序法
function quickSortIterative(arr) {
    const stack = [{ low: 0, high: arr.length - 1 }];

    while (stack.length > 0) {
        const { low, high } = stack.pop();

        if (low < high) {
            const pivotIndex = partition(arr, low, high);

            // Push subarrays to stack
            stack.push({ low, high: pivotIndex - 1 });
            stack.push({ low: pivotIndex + 1, high });
        }
    }

    return arr;
}

function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
        // 修改比较条件
        if (arr[j].value > pivot.value) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}


function getTop10() {
    readFilesRecursively(directoryPath, jsonData => {
        allData = allData.concat(jsonData);
    });

    // 耗时456.043ms
    // console.time('快速排序')
    // const parsedData = allData.map(item => {
    //     const [key, value] = item.split(':');
    //     return { key, value: parseInt(value, 10) };
    // });

    // const sortedData = quickSortIterative(parsedData);
    // console.timeEnd('快速排序')


    // 耗时426.588ms
    console.time('sort')
    // 根据冒号后的数字进行排序
    allData.sort((a, b) => {
        const numA = parseInt(a.split(':')[1]);
        const numB = parseInt(b.split(':')[1]);
        return numB - numA;
    });
    console.timeEnd('sort')

    // 获取前十项
    const topTenItems = allData.slice(0, 10);
    console.log('Top ten items:', topTenItems);
    return topTenItems
}

// getTop10()

module.exports = getTop10
