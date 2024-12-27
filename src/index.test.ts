import { va, ConfigSchema, Config } from "./index";

describe("va function", () => {
  it("should handle base string configuration", () => {
    const config: Config<string, ConfigSchema<string>> = {
      base: "base-class",
    };
    const result = va(config)({});
    expect(result).toBe("base-class");
  });

  it("should handle base array configuration", () => {
    const config: Config<string, ConfigSchema<string>> = {
      base: ["base-class1", "base-class2"],
    };
    const result = va(config)({});
    expect(result).toEqual(["base-class1", "base-class2"]);
  });

  it("should handle base object configuration", () => {
    const config: Config<
      Record<string, string>,
      ConfigSchema<Record<string, string>>
    > = {
      base: { baseKey: "baseValue" },
    };
    const result = va(config)({});
    expect(result).toEqual({ baseKey: "baseValue" });
  });

  it("should handle variants with string base", () => {
    const config: Config<string, ConfigSchema<string>> = {
      base: "base-class",
      variants: {
        size: {
          small: "size-small",
          large: "size-large",
        },
      },
    };
    const result = va(config)({ size: "small" });
    expect(result).toBe("base-class size-small");
  });

  it("should handle variants with array base", () => {
    const config: Config<string, ConfigSchema<string>> = {
      base: ["base-class1", "base-class2"],
      variants: {
        size: {
          small: "size-small",
          large: "size-large",
        },
      },
    };
    const result = va(config)({ size: "small" });
    expect(result).toEqual(["base-class1", "base-class2", "size-small"]);
  });

  it("should handle variants with object base", () => {
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
      },
    };
    const result = va(config)({ size: "small" });
    expect(result).toEqual({ baseKey: "baseValue", sizeKey: "small" });
  });

  it("should handle compound variants with string base", () => {
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
    expect(result).toBe("base-class size-small color-red small-red");
  });

  it("should handle compound variants with array base", () => {
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
    expect(result).toEqual([
      "base-class",
      "size-small",
      "color-red",
      "small-red",
    ]);
  });

  it("should handle compound variants with object base", () => {
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
    expect(result).toEqual({
      baseKey: "baseValue",
      sizeKey: "small",
      colorKey: "pink",
      compoundKey: "small-red",
    });
  });

  it("should handle default variants", () => {
    const config: Config<string, ConfigSchema<string>> = {
      base: "base-class",
      variants: {
        size: {
          small: "size-small",
          large: "size-large",
        },
      },
      defaultVariants: {
        size: "large",
      },
    };
    const result = va(config)({});
    expect(result).toBe("base-class size-large");
  });

  it("should handle extra prop", () => {
    const config: Config<string, ConfigSchema<string>> = {
      base: "base-class",
    };
    const result = va(config)({}, "extra-class");
    expect(result).toBe("base-class extra-class");
  });
});

it("should handle compound variants and extra prop with string base", () => {
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
  const result = va(config)({ size: "small", color: "red" }, "extra-class");
  expect(result).toBe("base-class size-small color-red small-red extra-class");
});

it("should handle compound variants and extra prop with array base", () => {
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
  const result = va(config)({ size: "small", color: "red" }, "extra-class");
  expect(result).toEqual([
    "base-class",
    "size-small",
    "color-red",
    "small-red",
    "extra-class",
  ]);
});

it("should handle compound variants and extr prop with object base", () => {
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
  const result = va(config)(
    { size: "small", color: "red" },
    { colorKey: "purple" },
  );
  expect(result).toEqual({
    baseKey: "baseValue",
    sizeKey: "small",
    colorKey: "purple",
    compoundKey: "small-red",
  });
});
