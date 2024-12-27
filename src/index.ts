export type OmitUndefined<T> = T extends undefined ? never : T;
export type StringToBoolean<T> = T extends "true" | "false" ? boolean : T;

export type ConfigSchema<T> = Record<string, Record<string, T>>;

export type ConfigVariants<T, CS extends ConfigSchema<T>> = {
  [Variant in keyof CS]?: StringToBoolean<keyof CS[Variant]> | null | undefined;
};

export type Config<T, CS extends ConfigSchema<T>> = {
  base: T | T[];
  compoundVariants?: [ConfigVariants<T, CS>, T][];
  defaultVariants?: ConfigVariants<T, CS>;
  variants?: CS;
};

export interface VA {
  <T, CS extends ConfigSchema<T>>(
    config: Omit<Config<T, CS>, "base"> & { base: T },
  ): (props: ConfigVariants<T, CS>, extra?: T) => T;
}

export interface VA {
  <T, CS extends ConfigSchema<T>>(
    config: Omit<Config<T, CS>, "base"> & { base: T[] },
  ): (props: ConfigVariants<T, CS>, extra?: T) => T[];
}

export const va: VA =
  <T, CS extends ConfigSchema<T>>(config: Config<T, CS>) =>
  (props: ConfigVariants<T, CS>, extra?: T) => {
    const { base } = config;

    if (typeof base === "string") {
      return mergeVariantsToString(config, props, extra);
    } else if (Array.isArray(base)) {
      return mergeVariantsToArray(config, props, extra);
    } else if (typeof base === "object" && base !== null) {
      return mergeVariantsToObject(config, props, extra);
    }

    return base;
  };

const falsyToString = <T extends unknown>(value: T) =>
  typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;

const getPropsWithoutUndefined = <P = Record<string, unknown>>(props: P) =>
  Object.entries(props || {}).reduce(
    (acc, [key, value]) => {
      if (value === undefined) return acc;

      acc[key] = value;
      return acc;
    },
    {} as Record<string, unknown>,
  );

const mergeVariantsToArray = <T, CS extends ConfigSchema<T>>(
  config: Config<T, CS>,
  props: ConfigVariants<T, CS>,
  extra?: T,
): T[] => {
  if (!config.variants)
    return [config.base, extra].flat().filter(Boolean) as T[];

  const { variants, defaultVariants } = config;

  const vars = Object.keys(variants).map((variant) => {
    const variantProp = props?.[variant as keyof typeof props];
    const defaultVariantProp = defaultVariants?.[variant];

    if (variantProp === null) return null;

    const variantKey = (falsyToString(variantProp) ||
      falsyToString(defaultVariantProp)) as string;

    return variants[variant]?.[variantKey];
  }) as T[];

  const compoundVars = (config?.compoundVariants || []).reduce((acc, val) => {
    const propsWithDefaults = {
      ...defaultVariants,
      ...getPropsWithoutUndefined(props),
    };

    return Object.entries(val[0]).every(([key, value]) =>
      Array.isArray(value)
        ? value.includes(propsWithDefaults[key])
        : propsWithDefaults[key] === value,
    )
      ? ([...acc, val[1]] as T[])
      : acc;
  }, [] as T[]);

  return [config.base, ...vars, ...compoundVars, extra]
    .flat()
    .filter(Boolean) as T[];
};

const mergeVariantsToObject = <T, CS extends ConfigSchema<T>>(
  config: Config<T, CS>,
  props: ConfigVariants<T, CS>,
  extra?: T,
): T => {
  if (!config.variants)
    return getPropsWithoutUndefined({ ...config.base, ...(extra || {}) }) as T;

  const { variants, defaultVariants } = config;

  const vars = Object.keys(variants).reduce((acc, variant) => {
    const variantProp = props?.[variant as keyof typeof props];
    const defaultVariantProp = defaultVariants?.[variant];

    if (variantProp === null) return acc;

    const variantKey = (falsyToString(variantProp) ||
      falsyToString(defaultVariantProp)) as string;

    return {
      ...acc,
      ...(variants[variant]?.[variantKey] || {}),
    };
  }, {} as T);

  const compoundVars = (config?.compoundVariants || []).reduce((acc, val) => {
    const propsWithDefaults = {
      ...defaultVariants,
      ...getPropsWithoutUndefined(props),
    };

    return Object.entries(val[0]).every(([key, value]) =>
      Array.isArray(value)
        ? value.includes(propsWithDefaults[key])
        : propsWithDefaults[key] === value,
    )
      ? { ...acc, ...val[1] }
      : acc;
  }, {} as T);

  return { ...config.base, ...vars, ...compoundVars, ...(extra || {}) } as T;
};

const mergeVariantsToString = <T, CS extends ConfigSchema<T>>(
  config: Config<T, CS>,
  props: ConfigVariants<T, CS>,
  extra?: T,
): T => {
  if (!config.variants)
    return [config.base, extra].filter(Boolean).join(" ") as T;

  const { variants, defaultVariants } = config;

  const vars = Object.keys(variants).reduce((acc, variant) => {
    const variantProp = props?.[variant as keyof typeof props];
    const defaultVariantProp = defaultVariants?.[variant];

    if (variantProp === null) return acc;

    const variantKey = (falsyToString(variantProp) ||
      falsyToString(defaultVariantProp)) as string;

    return `${acc} ${variants[variant]?.[variantKey]}`.trim();
  }, "");

  const compoundVars = (config?.compoundVariants || []).reduce((acc, val) => {
    const propsWithDefaults = {
      ...defaultVariants,
      ...getPropsWithoutUndefined(props),
    };

    return Object.entries(val[0]).every(([key, value]) =>
      Array.isArray(value)
        ? value.includes(propsWithDefaults[key])
        : propsWithDefaults[key] === value,
    )
      ? `${acc} ${val[1]}`.trim()
      : acc;
  }, "");

  return [config.base, vars, compoundVars, extra]
    .filter(Boolean)
    .join(" ") as T;
};
