const axios = require('axios');
const md5 = require('md5');

function generateSign(appId, q, salt, appSecret) {
    const str1 = `${appId}${q}${salt}${appSecret}`;
    return md5(str1);
}

async function translateText(q, from= 'auto', to = 'zh') {
    const appSecret = 'YcaO3KvFA6CZqGiFp30E';
    const appId = '20211210001024228';
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
            return null;
        }

        return result.trans_result[0].dst;
    } catch (error) {
        console.error('Request error:', error.message);
        return null;
    }
}

// 示例使用
// const q = 'apple';
// const from = 'en';
// const to = 'zh';

// translateText(q)
//     .then(translatedText => {
//         if (translatedText) {
//             console.log(`Original: ${q}`);
//             console.log(`Translated: ${translatedText}`);
//         }
//     })
//     .catch(error => {
//         console.error('Translation error:', error.message);
//     });


module.exports = translateText