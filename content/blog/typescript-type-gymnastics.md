---
title: TypeScript 类型体操入门
description: 从条件类型到映射类型再到模板字面量类型，一步步理解 TypeScript 高级类型系统。附带练习题与常见模式拆解。
publishedAt: 2023-12-15
category: 前端
tags:
  - TypeScript
  - 前端
---

> TODO(replace): 本文为设计稿示例占位文章，请替换为真实内容。

## 从一个练习开始

实现 `DeepReadonly<T>`：把对象的所有嵌套属性都变成只读。

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};
```

这一个例子就覆盖了类型体操的三块基石：映射类型、条件类型和递归类型。

## 三块基石

### 1. 条件类型

```ts
type IsString<T> = T extends string ? true : false;
```

配合 `never` 和分布式条件类型可以做类型层面的「过滤」：

```ts
type NonNullish<T> = T extends null | undefined ? never : T;
```

### 2. 映射类型

```ts
type Partial<T> = { [K in keyof T]?: T[K] };
```

### 3. 模板字面量类型

```ts
type Getter<T, K extends keyof T> = `get${Capitalize<string & K>}`;
// Getter<{name: string}, 'name'> = 'getName'
```

## 何时该克制

类型体操的目的是让**使用者**的类型更安全、提示更友好，而不是炫技。如果一个复杂类型可以用三个简单类型 + 注释替代，选后者。

`satisfies` 操作符常常能让你少写一半的类型魔法——既保留字面量推断，又约束范围。
