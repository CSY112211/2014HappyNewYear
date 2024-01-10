// 年月筛选json
const mediumDate = require('./date.json')
// 年月抓取完成情况
const { getComplete } = require('./util')


// 抓取数据控制
class QueueMange {
    constructor() {
        // 未完成队列
        this.incomplete = []
        // 错误队列
        this.errList = []
        // 运行中
        this.operation = []
        // 并行请求数量
        this.count = 10

        this.getIncomplete()
    }

    getIncomplete() {
        const complete = getComplete();

        for (const { year, months } of mediumDate) {
            for (const { month } of months) {
                // 若已经遍历完成直接跳过
                if (!complete[year]?.[month]) {
                    this.incomplete.push([year, month])
                }
            }
        }
    }


    // 判断队列是否撑满
    hasMore() {
        return (this.incomplete.length > 0 || this.errList.length > 0) && this.operation.length < this.count
    }


    async start(proxy) {

        while (this.hasMore()) {
            // await proxy(...this.incomplete.pop())
            if (this.incomplete.length) {
                this.operation.push(proxy(...this.incomplete.pop(), '', this.errList))
            } else {
                console.log('暂无需要抓取的数据')
                return
            }
        }

        while (this.incomplete > 0 || this.errList > 0) {
            const completedPromise = await Promise.race(this.operation);


            // 当有请求完成时，移除完成的请求，并添加新的请求到窗口
            this.operation.splice(promises.indexOf(completedPromise), 1);

            if (this.hasMore) {
                if (this.errList > 0) {
                    const newProxyPromise = proxy(...this.errList.pop()());
                    this.operation.push(newProxyPromise);
                } else {
                    const newProxyPromise = proxy(...this.incomplete.pop(), '', this.errList);
                    this.operation.push(newProxyPromise);
                }
            }

        }
        await Promise.all(this.operation);
        console.log('over')
    }
}

module.exports = QueueMange
// const test = new QueueMange()
// console.log(test.incomplete)