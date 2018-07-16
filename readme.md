# fake-promise

promise 的最基本实现，还有很多小点没有写到，及部分 api 还未实现，待完善

## 主要概念点

0. 有状态
1. thenable
2. then/catch 返回 new Promise，满足链式调用
3. 静态方法 race | all | resolve | rejct

## 参考

1. [https://tech.meituan.com/promise-insight.html](https://tech.meituan.com/promise-insight.html)
2. [https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.js](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.js)
3. [https://github.com/taylorhakes/promise-polyfill/blob/master/src/polyfill.js](https://github.com/taylorhakes/promise-polyfill/blob/master/src/polyfill.js)