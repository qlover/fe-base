'use client';

import { clsx } from 'clsx';
import { useMemo } from 'react';
import type { FeCorsRule } from '@config/feSiteSettings';
import {
  corsRuleIdentity,
  isValidCorsOriginValue,
  isValidCorsPathValue
} from '@schemas/corsValueSchema';

const METHOD_OPTIONS = [
  'GET',
  'POST',
  'OPTIONS',
  'PUT',
  'DELETE',
  'PATCH'
] as const;

export function isValidCorsOrigin(value: string): boolean {
  return isValidCorsOriginValue(value);
}

export function isValidCorsPath(value: string): boolean {
  return isValidCorsPathValue(value);
}

export { corsRuleIdentity };

export function findDuplicateCorsRuleIndexes(
  rules: readonly FeCorsRule[]
): ReadonlySet<number> {
  const seen = new Map<string, number>();
  const duplicates = new Set<number>();

  rules.forEach((rule, index) => {
    if (!isValidCorsOrigin(rule.origin) || !isValidCorsPath(rule.path)) {
      return;
    }
    if (rule.methods.length === 0) {
      return;
    }
    const key = corsRuleIdentity(rule);
    const first = seen.get(key);
    if (first !== undefined) {
      duplicates.add(first);
      duplicates.add(index);
      return;
    }
    seen.set(key, index);
  });

  return duplicates;
}

function normalizeMethods(methods: readonly string[]): string[] {
  return methods.map((method) => method.trim().toUpperCase()).filter(Boolean);
}

function isAllMethods(methods: readonly string[]): boolean {
  return methods.includes('*');
}

function InputWithStar({
  value,
  placeholder,
  ariaLabel,
  starAriaLabel,
  invalid,
  onChange,
  onStar
}: {
  value: string;
  placeholder: string;
  ariaLabel: string;
  starAriaLabel: string;
  invalid: boolean;
  onChange: (value: string) => void;
  onStar: () => void;
}) {
  return (
    <div
      data-testid="InputWithStar"
      className={clsx(
        'flex min-w-[12rem] flex-1 overflow-hidden rounded-lg border bg-bg-container focus-within:ring-2 sm:min-w-[14rem]',
        invalid
          ? 'border-red-400 focus-within:ring-red-300'
          : 'border-primary-border focus-within:ring-brand/40'
      )}
    >
      <input
        type="text"
        aria-label={ariaLabel}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent px-2.5 py-1.5 text-sm text-primary-text outline-none"
      />
      <button
        type="button"
        title="*"
        aria-label={starAriaLabel}
        onClick={onStar}
        className={clsx(
          'shrink-0 border-l px-2.5 text-xs font-semibold transition',
          value.trim() === '*'
            ? 'border-brand/30 bg-brand/10 text-brand'
            : 'border-primary-border text-secondary-text hover:bg-elevated'
        )}
      >
        *
      </button>
    </div>
  );
}

export type CorsRulesEditorLabels = {
  origin: string;
  path: string;
  methods: string;
  add: string;
  remove: string;
  empty: string;
  originInvalid: string;
  duplicate: string;
};

type CorsRulesEditorProps = {
  rules: readonly FeCorsRule[];
  onChange: (rules: FeCorsRule[]) => void;
  labels: CorsRulesEditorLabels;
};

/**
 * Compact one-row CORS rule editor: combined input+* groups, method chips (* last).
 */
export function CorsRulesEditor({
  rules,
  onChange,
  labels
}: CorsRulesEditorProps) {
  const rows = useMemo(() => [...rules], [rules]);
  const duplicateIndexes = useMemo(
    () => findDuplicateCorsRuleIndexes(rows),
    [rows]
  );

  const updateRow = (index: number, next: FeCorsRule) => {
    const copy = [...rows];
    copy[index] = {
      origin: next.origin,
      path: next.path,
      methods: normalizeMethods(next.methods)
    };
    onChange(copy);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    onChange([
      ...rows,
      {
        origin: '',
        path: '',
        methods: []
      }
    ]);
  };

  return (
    <div data-testid="CorsRulesEditor" className="flex flex-col gap-2">
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-primary-border px-3 py-4 text-sm text-secondary-text">
          {labels.empty}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((rule, index) => {
            const allMethods = isAllMethods(rule.methods);
            const originEmpty = !rule.origin.trim();
            const pathEmpty = !rule.path.trim();
            const originInvalid =
              !originEmpty && !isValidCorsOrigin(rule.origin);
            const pathInvalid = !pathEmpty && !isValidCorsPath(rule.path);
            const isDuplicate = duplicateIndexes.has(index);

            return (
              <li
                key={`cors-rule-${index}`}
                data-testid="CorsRuleRow"
                className={clsx(
                  'rounded-lg border bg-elevated/30 px-2 py-2',
                  isDuplicate ? 'border-red-400' : 'border-primary-border'
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <InputWithStar
                    value={rule.origin}
                    placeholder="https://spa.example.com"
                    ariaLabel={labels.origin}
                    starAriaLabel={`${labels.origin} *`}
                    invalid={originInvalid}
                    onChange={(origin) => updateRow(index, { ...rule, origin })}
                    onStar={() => updateRow(index, { ...rule, origin: '*' })}
                  />

                  <InputWithStar
                    value={rule.path}
                    placeholder="/oauth/token"
                    ariaLabel={labels.path}
                    starAriaLabel={`${labels.path} *`}
                    invalid={pathInvalid}
                    onChange={(path) => updateRow(index, { ...rule, path })}
                    onStar={() => updateRow(index, { ...rule, path: '*' })}
                  />

                  <div
                    className="inline-flex flex-wrap overflow-hidden rounded-lg border border-primary-border"
                    aria-label={labels.methods}
                  >
                    {METHOD_OPTIONS.map((method, methodIndex) => {
                      const active =
                        !allMethods && rule.methods.includes(method);
                      return (
                        <button
                          data-testid="CorsRulesEditor"
                          key={method}
                          type="button"
                          onClick={() => {
                            if (allMethods) {
                              updateRow(index, {
                                ...rule,
                                methods: [method]
                              });
                              return;
                            }
                            const next = active
                              ? rule.methods.filter((item) => item !== method)
                              : [...rule.methods, method];
                            updateRow(index, {
                              ...rule,
                              methods: next
                            });
                          }}
                          className={clsx(
                            'px-2 py-1.5 text-xs font-medium transition',
                            methodIndex > 0 && 'border-l border-primary-border',
                            active
                              ? 'bg-brand/10 text-brand'
                              : 'text-secondary-text hover:bg-elevated'
                          )}
                        >
                          {method}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() =>
                        updateRow(index, { ...rule, methods: ['*'] })
                      }
                      className={clsx(
                        'border-l border-primary-border px-2.5 py-1.5 text-xs font-semibold transition',
                        allMethods
                          ? 'bg-brand/10 text-brand'
                          : 'text-secondary-text hover:bg-elevated'
                      )}
                    >
                      *
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="ml-auto shrink-0 rounded-md px-2 py-1 text-xs text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                  >
                    {labels.remove}
                  </button>
                </div>
                {originInvalid ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                    {labels.originInvalid}
                  </p>
                ) : null}
                {isDuplicate ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                    {labels.duplicate}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={addRow}
        className="self-start rounded-lg border border-dashed border-primary-border px-3 py-2 text-sm font-medium text-primary-text transition hover:bg-elevated"
      >
        {labels.add}
      </button>
    </div>
  );
}
