# 环境

* win11
* nodejs v20.10.0

### 技术栈

* express + vue + axios

### 运行

* npm i 安装所有依赖
* **修改mian.js vpnProxyUrl 为vpn代理地址**
* node serve
* 浏览器打开http://localhost:3000

### 大概逻辑

1.抓取Medium 当前tag下年月选项保存于date.json中

2.遍历所有年月获取文章id与点赞量，**测试抓取时请清空`complete.js`文件**

```javascript
const mediumDate = require('./date.json')

for (const { year, months } of mediumDate) { // mei
    for (const { month } of months) {
        // complete中保存了爬取完成的年月，再次爬取会自动排除
        if (!complete[year]?.[month]) {
            // count 为并行请求数量
            if (count < 5) {
                arr.push(getArtListfetch(year, month))
                count++
            } else {
                hasMore = true
            }
        }
    }
}
```



3. 每次循环玩后判断是否需要再次进行

```javascript
// hasMore 表示存在未抓取的年月
// showReturn 表示抓取过程中触发了api频率限制
if (hasMore || showReturn) {
    hasMore = false
    showReturn = false
    await sleep(10000)
    await processMediumDate()
} else {
    // 获取top10
    const top10 = getTop10()

    for (const item of top10) {
        const postId = item.split(':')[0]
        // 获取文章详情
        const res = await getArtDetail(postId)

        // 翻译文章
        try {
            const html = await processArticle(res)
            await htmlToPdf(html, path.join(__dirname, `/pdf/${item.replace(':', '-')}.pdf`))

        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    return true

```



4. 抓取结束后会存入Set自动去重，然后根据年份日期存放到datas目录

```javascript
if (forwardResponse.pageInfo.hasNextPage === false) {
    obj[year] = new Set(obj[year])
    // 遍历完成,生成json
    const setJsonString = JSON.stringify(Array.from(obj[year]));
    const directoryPath = path.join(__dirname, `${datas}/${year}/${month}`)
    // 存储到本地文件
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }
    fs.writeFileSync(path.join(directoryPath, `articl-${year}-${month}.json`), setJsonString, 'utf-8');
    const complete = getComplete();
    if (!complete[year]) {
        complete[year] = {}
    }

    complete[year][month] = true
    const newcomplete = JSON.stringify(complete);

    // 标记已完成年月
    fs.writeFileSync('complete.json', newcomplete, 'utf-8');
} else {
    // await sleep(getRandomInt(100, 300));
    // 继续遍历
    await getArtListfetch(year, month, forwardResponse.pageInfo.endCursor)
}
```

5. 对比快速排序与原生sort排序

```javascript
// 1.递归会超出js引擎最大限制报错

// 2.代版本的快速排序，使用栈来管理子数组，而不是使用递归。 耗时456.043ms
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
        if (arr[j].value < pivot.value) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}

const sortedData = quickSortIterative(parsedData);

// 3.nodejs原生sort排序 耗时426.588ms
console.time('sort')
// 根据冒号后的数字进行排序
allData.sort((a, b) => {
    const numA = parseInt(a.split(':')[1]);
    const numB = parseInt(b.split(':')[1]);
    return numB - numA;
});
console.timeEnd('sort')


```

6. 遍历top10并调用百度翻译api进行翻译

```javascript
for (const item of top10) {
    const postId = item.split(':')[0]
    // 获取文章详情
    const res = await getArtDetail(postId)

   
    try {
         // 翻译文章
        const html = await processArticle(res)
        // html字符串转pdf
        await htmlToPdf(html, path.join(__dirname, `/pdf/${item.replace(':', '-')}.pdf`))

    } catch (error) {
        console.error('Error:', error.message);
    }
}
```



