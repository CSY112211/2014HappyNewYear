const axios = require('axios');
const md5 = require('md5');

function generateSign(appId, q, salt, appSecret) {
    const str1 = `${appId}${q}${salt}${appSecret}`;
    return md5(str1);
}


const css = `
body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  padding: 20px;
}

div {
  margin-bottom: 20px;
}

h3 {
  color: #333;
  font-size: 1.5em;
}

p {
  color: #666;
  font-size: 1.1em;
}

p.translation {
  font-style: italic;
  color: #888;
}
`

async function translateText(q, from, to, appId, appSecret) {
    const salt = Math.floor(Math.random() * 1000000000).toString();
    const sign = generateSign(appId, q, salt, appSecret);

    const apiUrl = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

    try {
        const response = await axios.post(apiUrl, null, {
            params: {
                q,
                from,
                to,
                appid: appId,
                salt,
                sign,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const result = response.data;

        if (result.error_code) {
            console.error(`Translation error: ${result.error_msg}`);
            console.log(q)
            return null;
        }

        return result.trans_result[0].dst;
    } catch (error) {
        console.error('Request error:', error.message);
        return null;
    }
}

function createHtml(paragraphs, translations) {
    let html = '<html><head>';
    html += '<style>';
    html += css;
    html += '</style>';
    html += '</head><body>';

    for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        const translation = translations[i];

        html += `<div id="${paragraph.id}">`;
        html += `<${paragraph.type}>${paragraph.text}</${paragraph.type}>`;

        if (translation) {
            html += `<p class="translation">Translation: ${translation}</p>`;
        }

        html += '</div>';
    }

    html += '</body></html>';

    return html;
}

async function processArticle(article) {
    const paragraphs = article;
    const translations = [];
    const maxCharacters = 5000
    let currentText = '';

    for (const paragraph of paragraphs) {
        // 如果加上当前段落的文本不超过最大字符数，则继续拼接
        if (currentText.length + paragraph.text.length <= maxCharacters) {
            currentText += paragraph.text + '$$$';  // 可以根据实际需求修改拼接方式
        } else {
            // 当超过最大字符数时，调用翻译接口，并将结果添加到 translations 数组中
            const translation = await translateText(currentText, 'en', 'zh', '20211210001024228', 'YcaO3KvFA6CZqGiFp30E');
            translations.push(translation);

            // 重置 currentText 为当前段落的文本
            currentText = paragraph.text + '$$$';
        }
    }

    // 处理最后一部分文本
    if (currentText.length > 0) {
        const translation = await translateText(currentText, 'en', 'zh', '20211210001024228', 'YcaO3KvFA6CZqGiFp30E');
        translations.push(translation);
    }
    let arr = []
    translations.map(item => {
        arr = arr.concat(item.split('$$$'))
    })


    const html = createHtml(paragraphs, arr);
    return html;
}


module.exports = processArticle
// 示例使用
// const article = [
//     {
//         "id": "6e7078d12d3a_0",
//         "name": "674d",
//         "type": "H3",
//         "href": null,
//         "layout": null,
//         "metadata": null,
//         "text": "the double-edged sword of efficiency",
//         "hasDropCap": null,
//         "dropCapImage": null,
//         "markups": [],
//         "__typename": "Paragraph",
//         "codeBlockMetadata": null,
//         "iframe": null,
//         "mixtapeMetadata": null
//     },
//     {
//         "id": "6e7078d12d3a_1",
//         "name": "2b05",
//         "type": "P",
//         "href": null,
//         "layout": null,
//         "metadata": null,
//         "text": "The big software defect story of the past couple of days is definitely Vassar’s accidental sending of acceptance notifications to several students. It’s a great example of one of the consequences of putting an algorithm (and indirectly, a programmer), in charge of disseminating information. On the one hand, I’m sure this saved Vassar a lot time and perhaps a job or two, completely eliminating their need for post and paper. On the other hand, they’ve adopted a system that is going to fail from time to time, and not in graceful ways that paper does, but in big, dramatic, and unpredictable ways.",
//         "hasDropCap": null,
//         "dropCapImage": null,
//         "markups": [
//             {
//                 "type": "A",
//                 "start": 71,
//                 "end": 146,
//                 "href": "http://www.pcmag.com/article2/0,2817,2399524,00.asp",
//                 "anchorType": "LINK",
//                 "userId": null,
//                 "linkMetadata": null,
//                 "__typename": "Markup"
//             }
//         ],
//         "__typename": "Paragraph",
//         "codeBlockMetadata": null,
//         "iframe": null,
//         "mixtapeMetadata": null
//     },
//     {
//         "id": "6e7078d12d3a_2",
//         "name": "6263",
//         "type": "P",
//         "href": null,
//         "layout": null,
//         "metadata": null,
//         "text": "The unpredictability of software defects is one of the most interesting properties of software as a medium. It’s inherent complexity means that even the people who develop it are going to have a hard time knowing what part of the system will fail and how dramatically. In fact, if the developer follows best practices by modularizing the system and enabling it to scale gracefully, it will actually guarantee that the failures will be more dramatic: whether it’s a list of 1, 100, or 1,000,000, I’m sure the Vassar notification system algorithm will do the exact same thing.",
//         "hasDropCap": null,
//         "dropCapImage": null,
//         "markups": [
//             {
//                 "type": "EM",
//                 "start": 364,
//                 "end": 370,
//                 "href": null,
//                 "anchorType": null,
//                 "userId": null,
//                 "linkMetadata": null,
//                 "__typename": "Markup"
//             }
//         ],
//         "__typename": "Paragraph",
//         "codeBlockMetadata": null,
//         "iframe": null,
//         "mixtapeMetadata": null
//     },
//     {
//         "id": "6e7078d12d3a_3",
//         "name": "a8b0",
//         "type": "P",
//         "href": null,
//         "layout": null,
//         "metadata": null,
//         "text": "I wonder how software might be built to better account for the significance of the information it transmits and computes. At the moment, I suppose this is captured in the software tests that teams perform. Perhaps a better way might be to tag the data that moves through software systems and propagate things like the confidence, credibility, and integrity of data as algorithms munge and manipulate it.",
//         "hasDropCap": null,
//         "dropCapImage": null,
//         "markups": [
//             {
//                 "type": "EM",
//                 "start": 63,
//                 "end": 76,
//                 "href": null,
//                 "anchorType": null,
//                 "userId": null,
//                 "linkMetadata": null,
//                 "__typename": "Markup"
//             }
//         ],
//         "__typename": "Paragraph",
//         "codeBlockMetadata": null,
//         "iframe": null,
//         "mixtapeMetadata": null
//     }
// ]

// processArticle(article)
//     .then(html => {
//         console.log(html);
//     })
//     .catch(error => {
//         console.error('Error:', error.message);
//     });
