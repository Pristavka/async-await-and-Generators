const isPromise = obj => Boolean(obj) && typeof obj.then === 'function';

const next = (iter, callback, prev = undefined) => {
    const item = iter.next(prev);
    const value = item.value;

    if (item.done) return callback(prev);

    if (isPromise(value)) {
        value.then(val => {
            setImmediate(() => next(iter, callback, val));
        });
    } else {
        setImmediate(() => next(iter, callback, value));
    }
};

const genSync = fn => (...args) =>
    new Promise(resolve => {
        next(fn(...args), val => resolve(val));
    });

/* How to use genSync() */

const fetchSomething = () =>
    new Promise(resolve => {
        setTimeout(() => resolve('future value'), 500);
    });

const asyncFunc = genSync(function*() {
    const result = yield fetchSomething(); // returns promise

    // waits for promise and uses promise result
    yield result + ' Hello World';
});

// Call the async function and pass params.
asyncFunc('param1', 'param2', 'param3').then(val => console.log(val)); // 'future value 2'
