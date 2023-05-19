type Contra<T> = T extends any ? (arg: T) => void : never;

type InferContra<T> = [T] extends [(arg: infer I) => void] ? I : never;

type PickOne<T> = InferContra<InferContra<Contra<Contra<T>>>>;

export type Union2Tuple<T> = PickOne<T> extends infer U
  ? Exclude<T, U> extends never
    ? [T]
    : [...Union2Tuple<Exclude<T, U>>, U]
  : never;

export type NonEmptyString<T extends string> = T extends "" ? never : T;
// export type NonEmptyString<T extends string = string> = T & { __nonEmptyString: never };

/***
 *
 * USE
 *
 * const record = new IterableRecord<string, number>();
 * record.add('one', 1);
 * record.add('two', 2);
 * record.add('three', 3);
 *
 * for (const [key, value] of record) {
 *   console.log(`${key}: ${value}`);
 * }
 */
export class IterableRecord<K extends string | number | symbol, V>
  implements Iterable<[K, V]>
{
  private record: Record<K, V>;

  constructor() {
    this.record = {} as Record<K, V>;
  }

  add(key: K, value: V): void {
    this.record[key] = value;
  }

  update(key: K, value: V): void {
    this.record[key] = value;
  }

  remove(key: K): void {
    delete this.record[key];
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const keys = Object.keys(this.record);
    let index = 0;
    const record = this.record;

    return {
      next(): IteratorResult<[K, V]> {
        if (index < keys.length) {
          const key = keys[index];
          index++;
          return { value: [key, record[key]], done: false };
        } else {
          return { value: undefined, done: true };
        }
      },
    };
  }
}
