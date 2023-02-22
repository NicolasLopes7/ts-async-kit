# 🚀 ts-async-kit
A lightweight TypeScript library that provides an easy-to-use API for dealing with common promise-related operations such as retrying and looping.

## Installation
To install ts-async-kit in your project, simply run:

```sh
pnpm i ts-async-kit
```

## Usage

### Retry
Sometimes, a promise may fail due to a temporary issue such as a network error. In such cases, retrying the operation can be a useful strategy. With ts-async-kit, you can easily retry a promise until it succeeds or reaches a maximum number of attempts.

Here's an example:

```ts
import { retry } from 'ts-async-kit';

const fetchData = async () => {
  // Fetch data from an API
};

const result = await retry(fetchData, { maxRetries: 3 })
```

In the above example, fetchData is called up to three times, and the result is logged to the console if successful. If all attempts fail, an error is thrown.

### Loop (WIP)
Sometimes, you may need to perform a task repeatedly, such as polling an API for updates. With `ts-async-kit`, you can control how your loop will work. Error-tolerant, concurrent operations, until a condition is met, maximum number of iterations and so on...

Here's an example:

```ts

import { map } from 'ts-async-kit';

const data = [1, 2, 3]
const pollApi = async (id: number) => {
  // Poll an API for updates
};

const result = await map(data, pollApi, { concurrency: 2 })
```
In the above example, pollApi is called up until it finishes executing two promises concurrently. If all iterations fail, an error is thrown.

Contributing
We welcome contributions! If you have an idea for a feature or would like to report a bug, please open an issue or submit a pull request.

License
`ts-async-kit` is released under the MIT License.