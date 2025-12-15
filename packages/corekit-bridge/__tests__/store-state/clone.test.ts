import { describe, it, expect } from 'vitest';
import { clone } from '../../src/core/store-state/clone';

class Person {
  constructor(
    public name: string,
    public age: number
  ) {}

  public greet(): string {
    return `Hello, I'm ${this.name}`;
  }
}

describe('clone', () => {
  it('returns primitive values unchanged', () => {
    expect(clone(42)).toBe(42);
    expect(clone('hello')).toBe('hello');
    expect(clone(true)).toBe(true);
    expect(clone(null)).toBeNull();
    expect(clone(undefined)).toBeUndefined();
  });

  it('performs a shallow clone of plain objects', () => {
    const original = { a: 1, nested: { b: 2 } };
    const copied = clone(original);

    // Should create a new reference for the top-level object
    expect(copied).not.toBe(original);
    expect(copied).toEqual(original);

    // Nested objects are not deeply cloned (shallow behaviour)
    expect(copied.nested).toBe(original.nested);

    // Mutating the clone should not affect the original top-level props
    copied.a = 100;
    expect(original.a).toBe(1);
  });

  it('clones arrays shallowly', () => {
    const original = [1, { a: 2 }];
    const copied = clone(original);

    expect(copied).not.toBe(original);
    expect(copied).toEqual(original);
    // Inner objects keep the same reference (shallow)
    expect(copied[1]).toBe(original[1]);
  });

  it('clones Date instances', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    const copied = clone(date);

    expect(copied).not.toBe(date);
    expect(copied).toBeInstanceOf(Date);
    expect(copied.getTime()).toBe(date.getTime());
  });

  it('clones RegExp instances', () => {
    const regex = /abc/gi;
    const copied = clone(regex);

    expect(copied).not.toBe(regex);
    expect(copied).toBeInstanceOf(RegExp);
    expect(copied.source).toBe(regex.source);
    expect(copied.flags).toBe(regex.flags);
  });

  it('clones Set instances', () => {
    const set = new Set([1, 2, 3]);
    const copied = clone(set);

    expect(copied).not.toBe(set);
    expect(copied).toBeInstanceOf(Set);
    expect([...copied]).toEqual([...set]);
  });

  it('clones Map instances', () => {
    const map = new Map<string, unknown>([
      ['a', 1],
      ['b', { c: 2 }]
    ]);
    const copied = clone(map);

    expect(copied).not.toBe(map);
    expect(copied).toBeInstanceOf(Map);
    expect(copied.size).toBe(map.size);
    // Nested objects remain shallow
    expect(copied.get('b')).toBe(map.get('b'));
  });

  it('clones class instances preserving prototype', () => {
    const alice = new Person('Alice', 30);
    const copied = clone(alice);

    expect(copied).not.toBe(alice);
    expect(copied).toBeInstanceOf(Person);
    expect(copied.name).toBe('Alice');
    expect(copied.age).toBe(30);
    expect(copied.greet()).toBe("Hello, I'm Alice");
  });

  it('mutating cloned array should only affect top-level of clone', () => {
    const original = [1, { a: 2 }];
    const copied = clone(original);

    // mutate clone
    copied[0] = 99;
    (copied[1] as { a: number }).a = 42;

    // top-level element differs
    expect(original[0]).toBe(1);
    // nested object reference shared (shallow clone)
    expect((original[1] as { a: number }).a).toBe(42);
  });

  it('mutating cloned Map should not affect original top-level entries', () => {
    const original = new Map<string, number | { c: number }>([
      ['a', 1],
      ['b', { c: 2 }]
    ]);
    const copied = clone(original);

    // mutate clone map
    copied.set('a', 100);
    (copied.get('b') as { c: number }).c = 999;

    expect(original.get('a')).toBe(1);
    // nested object shared between maps (shallow)
    expect((original.get('b') as { c: number }).c).toBe(999);
  });

  it('mutating cloned Date instance should not affect original', () => {
    const original = new Date('2024-01-01T00:00:00Z');
    const copied = clone(original);

    copied.setFullYear(2025);

    expect(original.getFullYear()).toBe(2024);
    expect(copied.getFullYear()).toBe(2025);
  });

  it('adding values to cloned Set should not affect original', () => {
    const original = new Set([1, 2, 3]);
    const copied = clone(original);

    copied.add(4);

    expect(original.has(4)).toBe(false);
    expect(copied.has(4)).toBe(true);
  });

  it('mutating cloned plain object should only affect top-level of clone', () => {
    const original = { x: 10, nested: { y: 20 } };
    const copied = clone(original);

    // mutate clone
    copied.x = 99;
    copied.nested.y = 42;

    // top-level property differs
    expect(original.x).toBe(10);
    // nested object reference shared (shallow clone)
    expect(original.nested.y).toBe(42);
  });

  it('mutating cloned class instance should only affect top-level of clone', () => {
    const bob = new Person('Bob', 25);
    const copied = clone(bob);

    // mutate clone
    copied.name = 'Robert';
    copied.age = 26;

    // top-level properties differ
    expect(bob.name).toBe('Bob');
    expect(bob.age).toBe(25);
  });
});
