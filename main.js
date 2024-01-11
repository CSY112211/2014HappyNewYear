const axios = require('axios')
const sleep = require('sleep-promise')
const { HttpsProxyAgent } = require('https-proxy-agent')
const htmlToPdf = require('./htmlToPDF')
const query = require('./query.json')
const fs = require('fs')
const path = require('path')
// 调用百度api翻译
const processArticle = require('./translateAndToHtml')
// 年月日
const mediumDate = require('./date.json')
const QueueMange = require('./queue')


const apiBaseUrl = 'https://medium.com/_/graphql'
const vpnProxyUrl = 'http://127.0.0.1:7078'

const obj = {}

// 创建代理实例
const vpnProxyAgent = new HttpsProxyAgent(vpnProxyUrl);
const getTop10 = require('./sort')


// api：获取当前tag下文章
async function fetchData(year, month, sortOrder, next = "", errList, index) {
    console.log('fetchData', year, month)
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
        return {
            edges: response.data[0].data.tagFromSlug.sortedFeed.edges,
            pageInfo: response.data[0].data.tagFromSlug.sortedFeed.pageInfo
        };
    } catch (error) {
        console.log('接口限制捕获成功')
        errList.push((index) => getArtListfetch(year, month, next, errList, index))
        console.error(`Error fetching data: ${error.message}`)
        if (error.message === 'Request failed with status code 429') {
            throw new Error(index);
        } else {
            throw new Error(error.message)
        }
    }
}


function getComplete() {
    const content = fs.readFileSync('./complete.json', 'utf-8');
    if (content.length === 0) {
        return {}

    }
    return JSON.parse(content);
}

/**
 * @description 获取文章列表
 * @param { number } year 年
 * @param {number} month 月
 * @param { string } next 下一页信息
 */
async function getArtListfetch(year, month, next = '', errList, index) {
    try {
        const forwardResponse = await fetchData(year, month, 'OLDEST', next, errList, index)
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
            const directoryPath = path.join(__dirname, `/datas/${year}/${month}`)
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

            // 释放占用内存
            delete obj[year][month]
            console.log(`${year}/${month}完成`)
            return index
        } else {
            // 继续遍历
            return await getArtListfetch(year, month, forwardResponse.pageInfo.endCursor, errList, index)
        }
    } catch (error) {
        throw new Error(index);
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
    const queue = new QueueMange()

    await queue.start(getArtListfetch)


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
};

// processMediumDate()

module.exports = processMediumDate
