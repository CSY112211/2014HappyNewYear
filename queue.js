const sleep = require('sleep-promise')
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
        this.count = 3

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
                const arr = this.incomplete.pop()
                console.log(arr)
                this.operation.push(proxy(...arr, '', this.errList, this.operation.length))
            } else {
                console.log('暂无需要抓取的数据')
                return
            }
        }
        console.log(`进行中任务数${this.operation.length},剩余任务数${this.incomplete.length}`)

        while (this.incomplete.length > 0 || this.errList.length > 0) {
            try {
                const completedPromise = await Promise.race(this.operation); // 返回完成下标
                console.log('任务完成，下标为：', completedPromise)
                // if (this.errList.length > 0) {
                //     const newProxyPromise = this.errList.pop()(completedPromise);
                //     this.operation.splice(completedPromise, 1, newProxyPromise);
                // } else {
                    const newProxyPromise = proxy(...this.incomplete.pop(), '', this.errList, completedPromise);
                    this.operation.splice(completedPromise, 1, newProxyPromise);
                // }
                console.log(`变更后，进行中任务数${this.operation.length},剩余任务数${this.incomplete.length + this.errList.length}`)

            } catch (error) {
                console.log(error.message)

                await sleep(3000)
                const completedPromise = Number(error.message)
                if (!Number.isNaN(completedPromise)) {
                    if (this.errList.length > 0) {
                        const newProxyPromise = this.errList.pop()(completedPromise);
                        this.operation.splice(completedPromise, 1, newProxyPromise);
                    }
                }

            }
        }

        await Promise.all(this.operation);
        console.log('over')
        return
    }
}

module.exports = QueueMange
// const test = new QueueMange()
// console.log(test.incomplete)