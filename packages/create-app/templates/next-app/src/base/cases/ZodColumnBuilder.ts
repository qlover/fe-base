import { merge } from 'lodash';
import {
  type z,
  ZodFirstPartyTypeKind,
  type ZodObject,
  type ZodRawShape,
  type ZodType
} from 'zod';
import type {
  ResourceTableFormType,
  ResourceTableOption
} from '@/uikit/components/resourceTable';
import { ResourceTableFormMap } from '@/uikit/components/resourceTable';
import { joinI18nKey } from '@config/i18n/i18nKeyScheam';
import type { ZodBuilderInterface } from '../port/ZodBuilderInterface';
import type { NamePath } from 'antd/es/form/interface';
import type { useTranslations } from 'next-intl';

type OptionMap<
  Value extends ZodRawShape,
  Input extends ZodObject<Value>
> = Record<keyof Input['shape'], ResourceTableOption<z.infer<Input>>>;

export const ZodType2RenderFormMap = {
  [ZodFirstPartyTypeKind.ZodString]: ResourceTableFormMap.input,
  [ZodFirstPartyTypeKind.ZodNumber]: ResourceTableFormMap.input,
  [ZodFirstPartyTypeKind.ZodBigInt]: ResourceTableFormMap.input,
  [ZodFirstPartyTypeKind.ZodBoolean]: ResourceTableFormMap.select,
  [ZodFirstPartyTypeKind.ZodEnum]: ResourceTableFormMap.select,
  [ZodFirstPartyTypeKind.ZodNativeEnum]: ResourceTableFormMap.select
} as const;

export class ZodColumnBuilder<
  Value extends ZodRawShape,
  Input extends ZodObject<Value>
> implements ZodBuilderInterface<Input, ResourceTableOption<z.infer<Input>>>
{
  protected optionMap: OptionMap<Value, Input>;

  constructor(
    readonly namespace: string,
    readonly input: Input,
    optionMap?: OptionMap<Value, Input>
  ) {
    const baseOptions = this.getBaseOptions(input);
    this.optionMap = optionMap ? merge(baseOptions, optionMap) : baseOptions;
  }

  static zodType2RenderForm(zod: ZodType): ResourceTableFormType | undefined {
    // @ts-expect-error - zod._def.typeName is not typed
    const typeName = zod._def?.typeName as ZodFirstPartyTypeKind;

    // Handle wrapper types (Optional, Nullable, Default)
    if (
      typeName === ZodFirstPartyTypeKind.ZodOptional ||
      typeName === ZodFirstPartyTypeKind.ZodNullable ||
      typeName === ZodFirstPartyTypeKind.ZodDefault
    ) {
      // @ts-expect-error - innerType is not typed
      return ZodColumnBuilder.zodType2RenderForm(zod._def.innerType);
    }

    // Direct mapping lookup
    return ZodType2RenderFormMap[
      typeName as keyof typeof ZodType2RenderFormMap
    ];
  }

  zod2BaseOption(
    key: string,
    zod: ZodType
  ): ResourceTableOption<z.infer<Input>> {
    return {
      key: key,
      title: key,
      dataIndex: key,
      tt: {
        tableTitle: joinI18nKey(this.namespace, key, 'title'),
        description: joinI18nKey(this.namespace, key, 'description'),
        formItemLabel: joinI18nKey(this.namespace, key, 'label'),
        formItemPlaceholder: joinI18nKey(this.namespace, key, 'placeholder'),
        formItemError: joinI18nKey(this.namespace, key, 'error'),
        formItemRequired: joinI18nKey(this.namespace, key, 'required')
      },
      renderForm: ZodColumnBuilder.zodType2RenderForm(zod),
      formItemWrapProps: {
        name: key as NamePath<z.infer<Input>>,
        label: key,
        rules: []
      },
      formItemProps: {}
    };
  }

  getBaseOptions(input: Input): OptionMap<Value, Input> {
    return Object.entries(input.shape).reduce(
      (acc, [key, zod]) => {
        acc[key as keyof Input['shape']] = this.zod2BaseOption(
          key,
          zod as ZodType
        );
        return acc;
      },
      {} as OptionMap<Value, Input>
    );
  }

  bind(
    key: keyof Input['shape'],
    params?: Partial<ResourceTableOption<z.infer<Input>>>
  ): this {
    if (params) {
      const existingOption = this.optionMap[key];
      this.optionMap[key] = merge({}, existingOption, params);
    }
    return this;
  }

  render<K extends keyof Input['shape']>(
    key: K,
    render: (
      value: unknown,
      record: z.infer<Input>,
      index: number
    ) => React.ReactNode
  ): this {
    this.optionMap[key].render = render;
    return this;
  }

  /**
   * Translate all i18n keys in options to actual text
   * @param t - Translation function from next-intl
   * @returns this for chaining
   */
  translate(t: ReturnType<typeof useTranslations>): this {
    Object.values(this.optionMap).forEach((option) => {
      const { tt } = option;
      // Translate title if it's a string (i18n key)
      if (typeof option.title === 'string') {
        option.title = t(tt.tableTitle);
      }

      // Translate formItemWrapProps label if exists
      if (
        option.formItemWrapProps?.label &&
        typeof option.formItemWrapProps.label === 'string'
      ) {
        option.formItemWrapProps = {
          ...option.formItemWrapProps,
          label: t(tt.formItemLabel)
        };
      }

      // Translate formItemProps placeholder if exists
      if (option.formItemProps && typeof option.formItemProps === 'object') {
        Object.assign(
          option.formItemProps as Record<string, unknown>,
          {
            placeholder: t(tt.formItemPlaceholder)
          } as Record<string, unknown>
        );
      }
    });

    return this;
  }

  /**
   * Build a single option by key
   * @param key - The key of the option to build
   * @param params - Optional additional parameters to merge
   * @returns The built option
   */
  build(key: string, params?: unknown): ResourceTableOption<z.infer<Input>> {
    const option = this.optionMap[key as keyof Input['shape']];
    if (!option) {
      throw new Error(`Option with key "${key}" not found`);
    }

    if (params && typeof params === 'object') {
      return merge(
        {},
        option,
        params as Partial<ResourceTableOption<z.infer<Input>>>
      );
    }

    return option;
  }

  /**
   * Build all options
   * @param params - Optional additional parameters (currently unused)
   * @returns Array of all built options
   */
  buildAll(_params?: unknown): ResourceTableOption<z.infer<Input>>[] {
    return Object.values(this.optionMap);
  }
}
