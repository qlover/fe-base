'use client';

import {
  ArrowPathIcon,
  BeakerIcon,
  ClipboardDocumentIcon,
  KeyIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Button, buttonClassName } from '@qlover/next-kit/client';
import { clsx } from 'clsx';
import { useLocale } from 'next-intl';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent
} from 'react';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import {
  DeveloperConfirmDialog,
  type DeveloperConfirmOptions
} from '@/uikit/components-app/developer/DeveloperConfirmDialog';
import { DeveloperOverlayModal } from '@/uikit/components-app/developer/DeveloperOverlayModal';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { useIOC } from '@/uikit/hook/useIOC';
import { oauthCardClass, oauthElevatedPanelClass } from '@config/component';
import { developerAppsI18n } from '@config/i18n-mapping/developerAppsI18n';
import { I } from '@config/ioc-identifiter';
import {
  API_CLIENTS,
  apiClientDetail,
  apiClientRotateSecret,
  ROUTE_OAUTH_PLAYGROUND
} from '@config/route';
import {
  OAuthClientAppForm,
  emptyOAuthClientFormValues,
  type OAuthClientFormValues
} from './OAuthClientAppForm';
import {
  OAuthClientCredentialsModal,
  type OAuthCredentials
} from './OAuthClientCredentialsModal';
import { readAppApiJson } from './readAppApiJson';
import type { DialogHandler } from '@qlover/next-kit/client';
import type {
  OAuthClientListItem,
  OAuthClientCreate,
  OAuthClientCreateResponse,
  OAuthClientDetail,
  OAuthClientSecretRotateResponse,
  OAuthClientUpdate
} from '@qlover/oauth-wrapper';

function parseRedirectUris(raw: string): string[] {
  return raw
    .split('\n')
    .map((uri) => uri.trim())
    .filter((uri) => uri.length > 0);
}

function AppListLogo({
  name,
  logoUri
}: {
  name: string;
  logoUri?: string | null;
}) {
  const [broken, setBroken] = useState(false);
  const initial = (name.trim().charAt(0) || '?').toUpperCase();
  const src = logoUri?.trim();
  const boxClass =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary-border bg-secondary text-sm font-semibold text-brand sm:h-9 sm:w-9';

  useEffect(() => {
    setBroken(false);
  }, [src]);

  if (!src || broken) {
    return (
      <div
        data-testid="DeveloperAppsPageLogoFallback"
        className={boxClass}
        aria-hidden
      >
        {initial}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external logo URL from developer input
    <img
      data-testid="DeveloperAppsPageLogo"
      src={src}
      alt=""
      className="h-8 w-8 shrink-0 rounded-lg border border-primary-border object-cover bg-secondary sm:h-9 sm:w-9"
      onError={() => setBroken(true)}
    />
  );
}

export interface DeveloperAppsPageProps {
  initialApps: OAuthClientListItem[];
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

export function DeveloperAppsPageComponent({
  initialApps
}: DeveloperAppsPageProps) {
  const locale = useLocale();
  const tt = useI18nMapping(developerAppsI18n);
  const dialogHandler = useIOC(I.DialogHandler) as DialogHandler;
  const [apps, setApps] = useState<OAuthClientListItem[]>(initialApps);
  const [loading, setLoading] = useState(initialApps.length === 0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editDetailLoading, setEditDetailLoading] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editingApp, setEditingApp] = useState<OAuthClientListItem | null>(
    null
  );
  const [credentials, setCredentials] = useState<OAuthCredentials | null>(null);
  const [credentialsModalVisible, setCredentialsModalVisible] = useState(false);
  const [confirmOptions, setConfirmOptions] =
    useState<DeveloperConfirmOptions | null>(null);
  const [createValues, setCreateValues] = useState<OAuthClientFormValues>(
    emptyOAuthClientFormValues
  );
  const [createFieldErrors, setCreateFieldErrors] = useState<
    Partial<Record<keyof OAuthClientFormValues, string>>
  >({});
  const [editValues, setEditValues] = useState<OAuthClientFormValues>(
    emptyOAuthClientFormValues
  );
  const [editFieldErrors, setEditFieldErrors] = useState<
    Partial<Record<keyof OAuthClientFormValues, string>>
  >({});
  const editLoadSeqRef = useRef(0);

  const formLabels = useMemo(
    () => ({
      appNameLabel: tt.appNameLabel || 'Application Name',
      appNameRequired: tt.appNameRequired || 'Please enter application name',
      redirectUrisLabel: tt.redirectUrisLabel || 'Redirect URIs (one per line)',
      redirectUrisRequired:
        tt.redirectUrisRequired || 'Please enter at least one redirect URI',
      redirectUrisPlaceholder:
        tt.redirectUrisPlaceholder ||
        'https://your-app.com/callback\nhttps://localhost:3000/callback',
      redirectUrisHint:
        tt.redirectUrisHint ||
        'Multiple callback URLs supported, one per line. Must use HTTPS (http://localhost allowed for local development).',
      clientUriLabel:
        tt.clientUriLabel || 'Application Homepage URL (Optional)',
      logoUriLabel: tt.logoUriLabel || 'Logo image URL (Optional)',
      logoUriHint:
        tt.logoUriHint ||
        'Public image URL shown on the consent screen and app list',
      logoUriInvalid: tt.logoUriInvalid || 'Please enter a valid image URL',
      clientTypeLabel: tt.clientTypeLabel || 'Client type',
      clientTypeConfidential:
        tt.clientTypeConfidential || 'Confidential (client_secret)',
      clientTypePublic: tt.clientTypePublic || 'Public (PKCE, no secret)',
      clientTypeHint:
        tt.clientTypeHint ||
        'Public clients require PKCE. Type cannot be changed after creation.',
      clientTypeLockedHint:
        tt.clientTypeLockedHint || 'Client type is fixed after creation.'
    }),
    [tt]
  );

  const resetCreateForm = () => {
    setCreateValues(emptyOAuthClientFormValues);
    setCreateFieldErrors({});
  };

  const resetEditForm = () => {
    setEditValues(emptyOAuthClientFormValues);
    setEditFieldErrors({});
  };

  const validateFormValues = (
    values: OAuthClientFormValues
  ): Partial<Record<keyof OAuthClientFormValues, string>> | null => {
    const errors: Partial<Record<keyof OAuthClientFormValues, string>> = {};
    if (!values.client_name.trim()) {
      errors.client_name = formLabels.appNameRequired;
    }
    if (parseRedirectUris(values.redirect_uris).length === 0) {
      errors.redirect_uris = formLabels.redirectUrisRequired;
    }
    const logoUri = values.logo_uri.trim();
    if (logoUri) {
      try {
        new URL(logoUri);
      } catch {
        errors.logo_uri = formLabels.logoUriInvalid;
      }
    }
    return Object.keys(errors).length > 0 ? errors : null;
  };

  const loadApps = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_CLIENTS, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to load applications');
      }
      const data = await readAppApiJson<OAuthClientListItem[]>(response);
      setApps(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load apps error:', error);
      dialogHandler.error(
        tt.toastError || 'Operation failed, please try again later'
      );
    } finally {
      setLoading(false);
    }
  }, [dialogHandler, tt.toastError]);

  useEffect(() => {
    void loadApps();
  }, [loadApps]);

  const showCredentialsModal = (next: OAuthCredentials) => {
    setCredentials(next);
    setCredentialsModalVisible(true);
  };

  const handleCopyClientId = async (clientId: string) => {
    try {
      await copyText(clientId);
      dialogHandler.success(tt.copyClientIdSuccess || 'Client ID copied');
    } catch {
      dialogHandler.error(
        tt.toastError || 'Operation failed, please try again later'
      );
    }
  };

  const handleCopyFromCredentialsModal = async (field: 'id' | 'secret') => {
    if (!credentials) return;
    try {
      if (field === 'id') {
        await copyText(credentials.clientId);
        dialogHandler.success(tt.copyClientIdSuccess || 'Client ID copied');
      } else if (credentials.clientSecret) {
        await copyText(credentials.clientSecret);
        dialogHandler.success(tt.copySecretSuccess || 'Client Secret copied');
      }
    } catch {
      dialogHandler.error(
        tt.toastError || 'Operation failed, please try again later'
      );
    }
  };

  const closeCredentialsModal = () => {
    setCredentialsModalVisible(false);
    setCredentials(null);
  };

  const handleCreateApp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createSubmitting) return;
    const validationErrors = validateFormValues(createValues);
    if (validationErrors) {
      setCreateFieldErrors(validationErrors);
      return;
    }
    setCreateFieldErrors({});
    setCreateSubmitting(true);

    try {
      const redirectUris = parseRedirectUris(createValues.redirect_uris);
      const logoUri = createValues.logo_uri.trim();
      const payload = {
        client_name: createValues.client_name.trim(),
        client_uri: createValues.client_uri.trim() || undefined,
        logo_uri: logoUri || undefined,
        redirect_uris: redirectUris,
        confidential: createValues.confidential
      } satisfies OAuthClientCreate & { logo_uri?: string };

      const response = await fetch(API_CLIENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to create application');
      }

      const data = await readAppApiJson<OAuthClientCreateResponse>(response);

      const newApp: OAuthClientListItem = {
        client_id: data.client_id,
        client_name: data.client_name,
        client_uri: data.client_uri,
        logo_uri: logoUri || null,
        redirect_uris: data.redirect_uris,
        confidential: data.confidential,
        created_at: data.created_at,
        updated_at: data.created_at
      };

      setApps((prev) => [...prev, newApp]);
      setCreateModalVisible(false);
      resetCreateForm();

      showCredentialsModal({
        clientId: data.client_id,
        clientSecret: data.client_secret,
        confidential: data.confidential
      });
    } catch (error) {
      console.error('Create app error:', error);
      dialogHandler.error(
        tt.toastError || 'Operation failed, please try again later'
      );
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleEditApp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingApp || editSubmitting || editDetailLoading) return;

    const validationErrors = validateFormValues(editValues);
    if (validationErrors) {
      setEditFieldErrors(validationErrors);
      return;
    }
    setEditFieldErrors({});
    setEditSubmitting(true);

    try {
      const redirectUris = parseRedirectUris(editValues.redirect_uris);
      const logoUri = editValues.logo_uri.trim();
      const payload = {
        client_name: editValues.client_name.trim(),
        client_uri: editValues.client_uri.trim() || undefined,
        logo_uri: logoUri || '',
        redirect_uris: redirectUris
      } satisfies OAuthClientUpdate & { logo_uri?: string };

      const response = await fetch(apiClientDetail(editingApp.client_id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update application');
      }

      const updatedApp = await readAppApiJson<OAuthClientDetail>(response);

      setApps((prev) =>
        prev.map((app) =>
          app.client_id === editingApp.client_id
            ? {
                ...app,
                client_name: updatedApp.client_name,
                client_uri: updatedApp.client_uri,
                logo_uri: (updatedApp.logo_uri ?? logoUri) || null,
                redirect_uris: updatedApp.redirect_uris,
                updated_at: updatedApp.updated_at
              }
            : app
        )
      );

      setEditModalVisible(false);
      setEditingApp(null);
      resetEditForm();

      dialogHandler.success(
        tt.toastUpdateSuccess || 'Application updated successfully'
      );
    } catch (error) {
      console.error('Update app error:', error);
      dialogHandler.error(
        tt.toastError || 'Operation failed, please try again later'
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleRotateSecret = (clientId: string, confidential = true) => {
    if (!confidential) {
      dialogHandler.warn(
        tt.publicClientNote ||
          'Public clients do not have a client_secret to rotate.'
      );
      return;
    }
    setConfirmOptions({
      title: tt.rotateSecretConfirmTitle || 'Rotate Secret',
      content:
        tt.rotateSecretConfirmContent ||
        'Rotating the secret will immediately invalidate the old one. Continue?',
      okText: tt.rotateSecretButton || 'Rotate Secret',
      cancelText: tt.cancelButton || 'Cancel',
      variant: 'default',
      onConfirm: async () => {
        try {
          const response = await fetch(apiClientRotateSecret(clientId), {
            method: 'POST',
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Failed to rotate secret');
          }

          const data =
            await readAppApiJson<OAuthClientSecretRotateResponse>(response);
          showCredentialsModal({
            clientId,
            clientSecret: data.client_secret,
            confidential: true
          });
        } catch (error) {
          console.error('Rotate secret error:', error);
          dialogHandler.error(
            tt.toastError || 'Operation failed, please try again later'
          );
          throw error;
        }
      }
    });
  };

  const handleDeleteApp = (clientId: string) => {
    setConfirmOptions({
      title: tt.deleteConfirmTitle || 'Delete Application',
      content:
        tt.deleteConfirmContent ||
        'Permanently delete this application? This action cannot be undone.',
      okText: tt.deleteButton || 'Delete',
      cancelText: tt.cancelButton || 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(apiClientDetail(clientId), {
            method: 'DELETE',
            credentials: 'include'
          });

          if (!response.ok && response.status !== 204) {
            throw new Error('Failed to delete application');
          }

          setApps((prev) => prev.filter((app) => app.client_id !== clientId));
          if (editingApp?.client_id === clientId) {
            editLoadSeqRef.current += 1;
            setEditModalVisible(false);
            setEditingApp(null);
            setEditDetailLoading(false);
            resetEditForm();
          }
          dialogHandler.success(tt.toastDeleteSuccess || 'Application deleted');
        } catch (error) {
          console.error('Delete app error:', error);
          dialogHandler.error(
            tt.toastError || 'Operation failed, please try again later'
          );
          throw error;
        }
      }
    });
  };

  const openEditModal = (app: OAuthClientListItem) => {
    const loadSeq = ++editLoadSeqRef.current;
    setEditingApp(app);
    setEditFieldErrors({});
    setEditSubmitting(false);
    setEditDetailLoading(true);
    setEditValues({
      client_name: app.client_name,
      client_uri: app.client_uri || '',
      logo_uri: app.logo_uri || '',
      redirect_uris: app.redirect_uris.join('\n'),
      confidential: app.confidential ?? true
    });
    setEditModalVisible(true);

    void (async () => {
      try {
        const detailResponse = await fetch(apiClientDetail(app.client_id), {
          credentials: 'include'
        });
        if (!detailResponse.ok) {
          throw new Error('Failed to load application detail');
        }
        const detail = await readAppApiJson<OAuthClientDetail>(detailResponse);
        if (loadSeq !== editLoadSeqRef.current) return;
        setEditValues({
          client_name: detail.client_name,
          client_uri: detail.client_uri || '',
          logo_uri: detail.logo_uri || '',
          redirect_uris: detail.redirect_uris.join('\n'),
          confidential: detail.confidential
        });
      } catch (error) {
        if (loadSeq !== editLoadSeqRef.current) return;
        console.error('Load edit detail error:', error);
        dialogHandler.error(
          tt.toastError || 'Operation failed, please try again later'
        );
      } finally {
        if (loadSeq === editLoadSeqRef.current) {
          setEditDetailLoading(false);
        }
      }
    })();
  };

  const closeCreateModal = () => {
    if (createSubmitting) return;
    setCreateModalVisible(false);
    resetCreateForm();
  };

  const closeEditModal = () => {
    if (editSubmitting) return;
    editLoadSeqRef.current += 1;
    setEditModalVisible(false);
    setEditingApp(null);
    setEditDetailLoading(false);
    resetEditForm();
  };

  const openCreateModal = () => {
    resetCreateForm();
    setCreateSubmitting(false);
    setCreateModalVisible(true);
  };

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="max-w-5xl mx-auto w-full px-4 py-8 sm:py-10">
          <div className={oauthCardClass} data-testid="DeveloperAppsPage">
            <div className="p-6 sm:p-8 border-b border-primary-border">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-secondary-text mb-1">
                    {tt.consoleSubtitle || 'Developer Console'}
                  </p>
                  <h1 className="text-xl sm:text-2xl font-semibold text-primary-text">
                    {tt.title || 'My OAuth Applications'}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <LocaleLink
                    href={ROUTE_OAUTH_PLAYGROUND}
                    locale={locale}
                    title={tt.playgroundLink || 'OAuth playground'}
                    className={buttonClassName({ variant: 'secondary' })}
                  >
                    <BeakerIcon className="h-4 w-4" />
                    {tt.playgroundLink || 'OAuth playground'}
                  </LocaleLink>
                  <Button variant="primary" onClick={openCreateModal}>
                    <PlusIcon className="h-4 w-4" />
                    {tt.createButton || 'Create New App'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-secondary-text">
                  <ArrowPathIcon className="h-8 w-8 text-brand animate-spin" />
                  <span className="text-sm">
                    {tt.loading || 'Loading applications'}
                  </span>
                </div>
              ) : apps.length === 0 ? (
                <div
                  className={clsx(
                    oauthElevatedPanelClass,
                    'text-center py-12 px-4 border-dashed'
                  )}
                >
                  <p className="text-secondary-text text-sm leading-relaxed">
                    {tt.emptyState ||
                      'No applications yet. Click "Create New App" to get started.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apps.map((app) => (
                    <article
                      data-testid="DeveloperAppsPageComponent"
                      key={app.client_id}
                      className={clsx(
                        oauthElevatedPanelClass,
                        'p-5 transition-colors hover:border-brand/30'
                      )}
                    >
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <AppListLogo
                              name={app.client_name}
                              logoUri={app.logo_uri}
                            />
                            <h2 className="text-lg font-semibold text-primary-text">
                              {app.client_name}
                            </h2>
                            <span
                              className={clsx(
                                'text-xs px-2 py-0.5 rounded-full font-medium',
                                app.confidential
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300'
                              )}
                            >
                              {app.confidential
                                ? tt.statusConfidential || 'Confidential'
                                : tt.statusPublic || 'Public'}
                            </span>
                          </div>
                          {app.client_uri ? (
                            <p className="text-sm">
                              <a
                                href={app.client_uri}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand hover:underline break-all"
                              >
                                {app.client_uri}
                              </a>
                            </p>
                          ) : null}
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <code className="text-sm bg-secondary text-primary-text px-2 py-1 rounded-lg font-mono border border-primary-border/40 break-all">
                              {tt.clientIdLabel || 'Client ID'}: {app.client_id}
                            </code>
                            <Button
                              variant="ghost"
                              onClick={() =>
                                void handleCopyClientId(app.client_id)
                              }
                              aria-label={
                                tt.copyClientIdSuccess || 'Copy Client ID'
                              }
                            >
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-secondary-text wrap-break-word">
                            {tt.redirectUrisLabel || 'Redirect URIs'}:{' '}
                            <code className="bg-secondary text-primary-text px-1.5 py-0.5 rounded text-xs font-mono">
                              {app.redirect_uris.join(', ')}
                            </code>
                          </p>
                          <p className="text-xs text-secondary-text">
                            {tt.createdAtLabel || 'Created at'}{' '}
                            {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            onClick={() => openEditModal(app)}
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                            {tt.editButton || 'Edit'}
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                            onClick={() =>
                              handleRotateSecret(
                                app.client_id,
                                app.confidential
                              )
                            }
                            disabled={!app.confidential}
                            title={
                              !app.confidential
                                ? tt.publicClientNote
                                : undefined
                            }
                          >
                            <KeyIcon className="h-4 w-4" />
                            {tt.rotateSecretButton || 'Rotate Secret'}
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-red-600 dark:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDeleteApp(app.client_id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                            {tt.deleteButton || 'Delete'}
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <OAuthClientCredentialsModal
        open={credentialsModalVisible}
        credentials={credentials}
        title={tt.credentialsModalTitle || 'New Application Credentials'}
        clientIdLabel={tt.clientIdLabel || 'Client ID'}
        clientSecretLabel={tt.clientSecretLabel || 'Client Secret'}
        secretWarning={
          tt.secretWarning ||
          'This secret is shown only once. Save it securely now.'
        }
        publicClientNote={tt.publicClientNote}
        confirmLabel={tt.credentialsConfirm || 'I have saved it, close'}
        onCopyClientId={() => void handleCopyFromCredentialsModal('id')}
        onCopySecret={() => void handleCopyFromCredentialsModal('secret')}
        onClose={closeCredentialsModal}
      />

      <DeveloperConfirmDialog
        open={confirmOptions != null}
        options={confirmOptions}
        onClose={() => setConfirmOptions(null)}
      />

      <DeveloperOverlayModal
        open={createModalVisible}
        title={tt.createModalTitle || 'Create OAuth Application'}
        onClose={closeCreateModal}
        closeOnBackdrop={!createSubmitting}
        maxWidthClass="max-w-xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={closeCreateModal}
              disabled={createSubmitting}
            >
              {tt.cancelButton || 'Cancel'}
            </Button>
            <Button
              type="submit"
              form="create-oauth-client"
              variant="primary"
              disabled={createSubmitting}
            >
              {createSubmitting ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : null}
              {createSubmitting
                ? tt.saving || 'Saving...'
                : tt.createSubmitButton || 'Create Application'}
            </Button>
          </div>
        }
      >
        <OAuthClientAppForm
          formId="create-oauth-client"
          values={createValues}
          fieldErrors={createFieldErrors}
          labels={formLabels}
          disabled={createSubmitting}
          onChange={(patch) => {
            setCreateValues((prev) => ({ ...prev, ...patch }));
            setCreateFieldErrors((prev) => {
              const next = { ...prev };
              for (const key of Object.keys(
                patch
              ) as (keyof OAuthClientFormValues)[]) {
                delete next[key];
              }
              return next;
            });
          }}
          onSubmit={handleCreateApp}
          footer={null}
        />
      </DeveloperOverlayModal>

      <DeveloperOverlayModal
        open={editModalVisible}
        title={tt.editModalTitle || 'Edit Application'}
        onClose={closeEditModal}
        closeOnBackdrop={!editSubmitting && !editDetailLoading}
        maxWidthClass="max-w-xl"
        footer={
          <div className="flex items-center gap-2">
            {editingApp ? (
              <div className="flex shrink-0 gap-1.5">
                <Button
                  variant="warning"
                  className="h-9 px-2.5"
                  onClick={() =>
                    handleRotateSecret(
                      editingApp.client_id,
                      editValues.confidential
                    )
                  }
                  disabled={
                    !editValues.confidential ||
                    editDetailLoading ||
                    editSubmitting
                  }
                  title={tt.rotateSecretButton || 'Rotate Secret'}
                  aria-label={tt.rotateSecretButton || 'Rotate Secret'}
                >
                  <KeyIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {tt.rotateSecretButton || 'Rotate Secret'}
                  </span>
                </Button>
                <Button
                  variant="danger"
                  className="h-9 px-2.5"
                  onClick={() => handleDeleteApp(editingApp.client_id)}
                  disabled={editDetailLoading || editSubmitting}
                  title={tt.deleteButton || 'Delete'}
                  aria-label={tt.deleteButton || 'Delete'}
                >
                  <TrashIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {tt.deleteButton || 'Delete'}
                  </span>
                </Button>
              </div>
            ) : null}
            <div className="ml-auto flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={closeEditModal}
                disabled={editSubmitting}
              >
                {tt.cancelButton || 'Cancel'}
              </Button>
              <Button
                type="submit"
                form="edit-oauth-client"
                variant="primary"
                disabled={editDetailLoading || editSubmitting}
              >
                {editSubmitting || editDetailLoading ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : null}
                {editSubmitting
                  ? tt.saving || 'Saving...'
                  : editDetailLoading
                    ? tt.loading || 'Loading...'
                    : tt.saveSubmitButton || 'Save Changes'}
              </Button>
            </div>
          </div>
        }
      >
        {editDetailLoading ? (
          <div
            data-testid="DeveloperAppsEditLoading"
            className="flex flex-col items-center justify-center gap-3 py-10 text-secondary-text"
          >
            <ArrowPathIcon className="h-8 w-8 animate-spin text-brand" />
            <span className="text-sm">{tt.loading || 'Loading...'}</span>
          </div>
        ) : (
          <OAuthClientAppForm
            formId="edit-oauth-client"
            values={editValues}
            fieldErrors={editFieldErrors}
            labels={formLabels}
            lockClientType
            disabled={editSubmitting}
            onChange={(patch) => {
              setEditValues((prev) => ({ ...prev, ...patch }));
              setEditFieldErrors((prev) => {
                const next = { ...prev };
                for (const key of Object.keys(
                  patch
                ) as (keyof OAuthClientFormValues)[]) {
                  delete next[key];
                }
                return next;
              });
            }}
            onSubmit={handleEditApp}
            footer={null}
          />
        )}
      </DeveloperOverlayModal>
    </>
  );
}
