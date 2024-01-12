type Mapper<T, R> =  (item: T, index: number, arrayLength: number) => R | Promise<R>;

export const map = async <U, Q>(data: Array<Q>, mapper: Mapper<Q, U>): Promise<U[]> => {
    const result: U[] = []
    let index = 0
    for (const item of data) {
        result.push(await mapper(item, index, data.length))
        index++
    }
    return result
}

const double = (num: number) => num * 2
const data = [1, 2, 3, 4, 5]

map(data, double)