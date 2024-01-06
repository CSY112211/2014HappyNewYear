const axios = require('axios');
const sleep = require('sleep-promise');
const { HttpsProxyAgent } = require('https-proxy-agent');
const mediumDate = require('./date.json')
// const complete = require('./complete.json')
const htmlToPdf = require('./htmlToPDF')

const apiBaseUrl = 'https://medium.com/_/graphql';
const vpnProxyUrl = 'http://127.0.0.1:7078';

const query = require('./query.json')

// const { getRandomInt } = require('./util')
const fs = require('fs');
const path = require('path');

const compressPdfDirectory = require('./pdfToZip')

const obj = {}
let showReturn = false

// 创建代理实例
const vpnProxyAgent = new HttpsProxyAgent(vpnProxyUrl);
// 翻译
const processArticle = require('./translateAndToHtml')
const getTop10 = require('./sort')


// 获取list
async function fetchData(year, month, sortOrder, next = "") {
    try {
        const response = await axios.post(apiBaseUrl, [
            {
                "operationName": "TagArchiveFeedQuery",
                "variables": {
                    "tagSlug": "software-engineering",
                    "timeRange": {
                        "kind": "IN_MONTH",
                        "inMonth": {
                            "year": year,
                            "month": month
                        }
                    },
                    "sortOrder": sortOrder, // NEWEST
                    "first": 15,
                    "after": next
                },
                "query": query.queryList
            }
        ], {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            httpsAgent: vpnProxyAgent,
        });

        console.log(year, month, '正常')
        return {
            edges: response.data[0].data.tagFromSlug.sortedFeed.edges,
            pageInfo: response.data[0].data.tagFromSlug.sortedFeed.pageInfo
        };
    } catch (error) {
        showReturn = true
        throw new Error(`Error fetching data: ${year, month, error.message}`);
    }
}

function getComplete() {
    const content = fs.readFileSync('./complete.json', 'utf-8');
    return JSON.parse(content);
}

/**
 * @description 获取文章列表
 * @param { number } year 年
 * @param {number} month 月
 * @param { string } next 下一页信息
 */
async function getArtListfetch(year, month, next1 = '', next2 = '') {
    try {
        // await sleep(getRandomInt(100, 300));

        const forwardResponse = await fetchData(year, month, 'OLDEST', next1)

        // 处理获取到的数据
        const forwardData = forwardResponse.edges.map(item => (`${item.node.id}:${item.node.clapCount}`));

        if (!Array.isArray(obj[year])) {
            obj[year] = []
        }
        obj[year] = obj[year].concat(forwardData)


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
    } catch (error) {
        console.error('Error:', year, month, error.message);
    }
}


// 获取文章详情
async function getArtDetail(postId) {
    try {
        const response = await axios.post(apiBaseUrl, [
            {
                "operationName": "PostPageQuery",
                "variables": {
                    "postId": postId,
                    "postMeteringOptions": {}
                },
                "query": query.queryDetail
            },
        ], {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            httpsAgent: vpnProxyAgent,
        });

        return response.data[0].data.postResult.content.bodyModel.paragraphs
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
}

const processMediumDate = async () => {
    const complete = getComplete();
    let count = 0
    let hasMore = false

    const arr = []
    for (const { year, months } of mediumDate) {
        for (const { month } of months) {
            // 若已经遍历完成直接跳过
            if (!complete[year]?.[month]) {
                if (count < 5) {
                    arr.push(getArtListfetch(year, month))
                    count++
                } else {
                    hasMore = true
                }
                // await getArtListfetch(year, month);
                // arr.push(getArtListfetch(year, month))
            }
        }
    }


    await Promise.all(arr);

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
        // compressPdfDirectory(path.join(__dirname, '/pdf'), path.join(__dirname, '/zip'))
    }
};

module.exports = processMediumDate

// processMediumDate()
