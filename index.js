// promise
// 避免回调地狱
// 异步操作

// 异步操作函数
function asyncFn (fn) {
  if (typeof process === 'object' && process !== null && 
    typeof(process.nextTick) === 'function'
  ) {
    return process.nextTick(fn);
  } else if (typeof(setImmediate) === 'function') {
    return setImmediate(fn);
  }
  return setTimeout(fn);
}

/**
 * 1. pending 状态，记录，return
 * 2. 非 pending 状态，读取，对应的方法，返回一个 
 * @param {*} deferred 
 */
function _h(promise, deferred) {
  if(promise._state === 0) {
    return promise._defered.push(deferred)
  }
  
  const cb = promise._state === 1 ? deferred.onResolved : deferred.onRejected

  // 一般第二个参数没有，catch 向后遍历。传递
  if(cb === null) {
    return deferred.reject(promise._value)
  }

  try{
    const ret = cb(promise._value)
    deferred.resolve(ret) // 链式调用 resolve
  }catch(e){
    deferred.reject(e) // 链式调用 reject
  }
  
}

class Promise {
  // 借鉴于 https://github.com/taylorhakes/promise-polyfill/blob/master/src/index.js#L150
  static all(promises) {
    return new Promise((resolve, reject) => {
      let tmp = promises.length;
      promises.forEach(item => {
        const then = item.then;
        if(typeof then === 'function') {
          then.call(
            item,
            () => {
              tmp--;
              if(tmp === 0) resolve();
            },
            reject
          )
        }
      })
    })
  }

  static race(promises) {
    return new Promise((resolve, reject) => {
      promises.forEach(item => {
        item.then(resolve, reject);
      })
    })
  }

  static resolve(value) {
    return new Promise((resolve, reject) => {
      resolve(value);
    })
  }

  static reject(value) {
    return new Promise((resolve, reject) => {
      reject(value);
    })
  }

  constructor (fn) {
    this._fn = fn
    this._defered = []
    this._state = 0
    this._value = null

    // 异步执行
    // 防止 resolve 执行时， 还没有注册对应的 then，所以放在队尾去执行
    // const a = new Promise((resolve, reject) => {
    //   resolve()
    // }).then(f)
  
    asyncFn(() => {
      fn(this.resolve.bind(this), this.reject.bind(this))
    })
  }

  // 任何执行 then 返回一个 new Promise，状态固定
  then(onResolved, onRejected) {
    return new Promise((resolve, reject) => {
      _h(this, {
        onResolved,
        onRejected,
        resolve,
        reject
      })
    })
  }

  

  catch(onRejected) {
    return new Promise((resolve, reject) => {
      _h(this, {
        onResolved: null,
        onRejected,
        resolve,
        reject
      })
    })
  }

  reject (value) {
    this._value = value
    this._state = 2 // rejected
    this._handle()
  }

  resolve (value) {
    this._value = value
    this._state = 1 // fullfilled
    this._handle()
  }

  _handle (...args) {
    this._defered.forEach(item => {
      const cb = this._state === 1 ? item.onResolved : item.onRejected
      cb && cb.apply(null, args)
    })
    this._defered = []
  }
}

// base-demo
// const foo = new Promise(function(resolve){
//   console.log(1)
//   resolve('next')
// })
// foo.then(_ => {
//   console.log(_, 1)
// }).catch(e => {
//   console.log(e)
// })

// foo.then(_ => {
//   console.log(_, 3)
//   return 3
// }).then(_ => {
//   console.log(_, 4)
// })

Promise.all([Promise.resolve(1), Promise.reject(1)]).then(() => {
  console.log('all, resolve')
}, (e) => {
  console.log('all, reject')
})

Promise.all([Promise.resolve(1), Promise.resolve(1)]).then(() => {
  console.log('demo2, all, resolve')
}, (e) => {
  console.log('demo2, all, reject')
})

Promise.race([Promise.resolve(1), Promise.reject(1)]).then(() => {
  console.log('race, resolve')
}, (e) => {
  console.log('race, reject')
})

Promise.race([Promise.reject(1), Promise.resolve(1)]).then(() => {
  console.log('demo2, race, resolve')
}, (e) => {
  console.log('demo2, race, reject')
})