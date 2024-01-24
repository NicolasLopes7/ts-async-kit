# 🚀 ts-async-kit

A lightweight TypeScript library that provides an easy-to-use API for dealing with asyhchronous operations and create scalable systems capable of handling heavy operations. It counts with event-loop helpers, a Thread implementation based on workers and an action pool that can be used to distribute intensive tasks through the event loop and external threads.

## Installation

To install ts-async-kit in your project, simply run:

```sh
pnpm i ts-async-kit
```

## Usage

### Retry ↩️

Sometimes, a promise may fail due to a temporary issue such as a network error. In such cases, retrying the operation can be a useful strategy. With ts-async-kit, you can easily retry a promise until it succeeds or reaches a maximum number of attempts.

Here's an example:

```ts
import { retry } from "ts-async-kit";

const fetchData = async () => {
  // Fetch data from an API
};

const result = await retry(fetchData, { maxRetries: 3 });
```

In the above example, fetchData is called up to three times, and the result is logged to the console if successful. If all attempts fail, an error is thrown.
| Parameter | Description |
| ------- | ------- |
| MaxRetries (Optional) | How many times the function will be executed |
| Interval (Optional) | How long the function should wait to retry it again |
| Timeout (Optional) | How long the function should wait until stops the function execution (and fail) |
| backoffFactor (Optional) | How much the interval should increase after each retry |
| onRetry (Optional) | Callback function that can be called with the error when a function is retried |
| onFail (Optional) | Callback function that can be called with the error when the function execution finishes by `MaxRetries` OR `Timeout` |

### Sleep 😴

Sometimes, you just want to block the current flow of execution and wait a certain time. For you don't waste time searching
on StackOverflow, we shipped a function that easily does that. It's called `sleep`.

Here's an example:

```ts
import { sleep } from "ts-async-kit";

await sleep(1000); // Time in ms to sleep
```

### Loop (WIP) 🏃‍♂️

Sometimes, you may need to perform a task repeatedly, such as polling an API for updates. With `ts-async-kit`, you can control how your loop will work. Error-tolerant, concurrent operations, until a condition is met, maximum number of iterations and so on...

Here's an example:

```ts
import { map } from "ts-async-kit";

const data = [1, 2, 3];
const pollApi = async (id: number) => {
  // Poll an API for updates
};

const result = await map(data, pollApi, { concurrency: 2 });
```

In the above example, pollApi is called up until it finishes executing two promises concurrently. If all iterations fail, an error is thrown.

Contributing
We welcome contributions! If you have an idea for a feature or would like to report a bug, please open an issue or submit a pull request.

License
`ts-async-kit` is released under the MIT License.
