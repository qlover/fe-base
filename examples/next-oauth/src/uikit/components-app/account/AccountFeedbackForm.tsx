'use client';

import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { type FormEvent, useState } from 'react';
import { UserFeedbackApi } from '@/impls/appApi/UserFeedbackApi';
import { useIOC } from '@/uikit/hook/useIOC';
import type { AccountI18nInterface } from '@config/i18n-mapping/accountI18n';
import {
  USER_FEEDBACK_CATEGORIES,
  UserFeedbackCategory,
  type UserFeedbackCategoryType
} from '@schemas/UserFeedbackSchema';

const inputClass =
  'border-primary-border text-primary-text placeholder:text-tertiary-text focus:border-brand focus:ring-brand w-full rounded-xl border bg-bg-container px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0';

/**
 * 个人中心提交反馈表单。
 */
export function AccountFeedbackForm({ tt }: { tt: AccountI18nInterface }) {
  const api = useIOC(UserFeedbackApi);
  const [category, setCategory] = useState<UserFeedbackCategoryType>(
    UserFeedbackCategory.bug
  );
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const categoryLabels: Record<UserFeedbackCategoryType, string> = {
    bug: tt.feedbackCategoryBug,
    ux: tt.feedbackCategoryUx,
    feature: tt.feedbackCategoryFeature,
    performance: tt.feedbackCategoryPerformance,
    content: tt.feedbackCategoryContent,
    other: tt.feedbackCategoryOther
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || saving) {
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.create({
        category,
        body: trimmed,
        pageUrl:
          typeof window !== 'undefined' ? window.location.href : undefined,
        clientContext: {
          reportedAt: new Date().toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: typeof navigator !== 'undefined' ? navigator.language : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
        }
      });
      setBody('');
      setSuccess(true);
    } catch {
      setError(tt.feedbackError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      data-testid="AccountFeedbackForm"
      className="rounded-2xl border border-primary-border bg-primary p-5 sm:p-6"
    >
      <h2 className="mb-1 text-base font-semibold text-primary-text">
        {tt.feedbackSectionTitle}
      </h2>
      <p className="mb-4 text-sm text-secondary-text">{tt.feedbackDescription}</p>
      <form className="flex flex-col gap-3" onSubmit={onSubmit} noValidate>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-secondary-text">{tt.feedbackCategoryLabel}</span>
          <select
            value={category}
            disabled={saving}
            className={inputClass}
            onChange={(e) =>
              setCategory(e.target.value as UserFeedbackCategoryType)
            }
          >
            {USER_FEEDBACK_CATEGORIES.map((key) => (
              <option key={key} value={key}>
                {categoryLabels[key]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-secondary-text">{tt.feedbackBodyLabel}</span>
          <textarea
            value={body}
            disabled={saving}
            rows={4}
            maxLength={4000}
            placeholder={tt.feedbackBodyPlaceholder}
            className={clsx(inputClass, 'resize-y')}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? (
          <p className="text-sm text-emerald-600">{tt.feedbackSuccess}</p>
        ) : null}
        <button
          type="submit"
          disabled={saving || body.trim().length === 0}
          className="inline-flex w-fit cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-on-brand hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : null}
          {tt.feedbackSubmit}
        </button>
      </form>
    </section>
  );
}
