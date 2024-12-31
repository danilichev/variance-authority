# Variance Authority

Variance Authority (based on [CVA](https://cva.style/docs)) is a tiny library for authoring (React/React Native but not only) components. The main difference is that this solution can handle arrays and objects as props/styles.

## Installation

```sh
npm install variance-authority
```

## API

### `va(config: Config): (props: Props) => string`

The `va` function takes a configuration object and returns a function that generates a class name string based on the provided props.

#### Parameters

- `config` (Config): The configuration object.
- `base` (string): The base class name.
- `variants` (object): An object where keys are variant names and values are objects mapping variant values to class names.
- `compoundVariants` (array): An array of compound variant objects. Each object should have a `className` property and a `conditions` property, which is an object mapping variant names to values.

#### Returns

- `(props: Props) => string | array | object`: A function that takes a props object and returns a class name string or array of class names or object with props.

```ts
    const config: Config<string, ConfigSchema<string>> = {
      base: "base-class",
      variants: {
        size: {
          small: "size-small",
          large: "size-large",
        },
        color: {
          red: "color-red",
          blue: "color-blue",
        },
      },
      compoundVariants: [
        [{ size: "small", color: "red" }, "small-red"],
        [{ size: "large", color: "blue" }, "large-blue"],
      ],
    };
    const result = va(config)({ size: "small", color: "red" });
    console.log(result);
    // Output: "base-class size-small color-red small-red"
```
```ts
    const config: Config<string, ConfigSchema<string>> = {
      base: ["base-class"],
      variants: {
        size: {
          small: "size-small",
          large: "size-large",
        },
        color: {
          red: "color-red",
          blue: "color-blue",
        },
      },
      compoundVariants: [
        [{ size: "small", color: "red" }, "small-red"],
        [{ size: "large", color: "blue" }, "large-blue"],
      ],
    };
    const result = va(config)({ size: "small", color: "red" });
    console.log(result);
    // Output: ["base-class", "size-small", "color-red", "small-red"]
```
```ts
const config: Config<
      Record<string, string>,
      ConfigSchema<Record<string, string>>
    > = {
      base: { baseKey: "baseValue" },
      variants: {
        size: {
          small: { sizeKey: "small" },
          large: { sizeKey: "large" },
        },
        color: {
          red: { colorKey: "red" },
          blue: { colorKey: "blue" },
        },
      },
      compoundVariants: [
        [
          { size: "small", color: "red" },
          { compoundKey: "small-red", colorKey: "pink" },
        ],
        [
          { size: "large", color: "blue" },
          { compoundKey: "large-blue", colorKey: "cyan" },
        ],
      ],
    };
    const result = va(config)({ size: "small", color: "red" });
    console.log(result);
    // Output: { 
    //     baseKey: "baseValue", 
    //     sizeKey: "small",
    //     colorKey: "pink",
    //     compoundKey: "small-red"
    // }
```

## Acknowledgements
[CVA](https://cva.style/docs)
