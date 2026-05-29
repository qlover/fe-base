'use client';

import {
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  KeyOutlined,
  LoadingOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { message } from 'antd';
import { clsx } from 'clsx';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent
} from 'react';
import { Link } from '@/i18n/routing';
import {
  DeveloperConfirmDialog,
  type DeveloperConfirmOptions
} from '@/uikit/components-app/developer/DeveloperConfirmDialog';
import { DeveloperOverlayModal } from '@/uikit/components-app/developer/DeveloperOverlayModal';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import {
  oauthCardClass,
  oauthDangerButtonClass,
  oauthElevatedPanelClass,
  oauthGhostActionClass,
  oauthPrimaryButtonClass,
  oauthSecondaryButtonClass,
  oauthWarningButtonClass
} from '@/uikit/styles/oauthUiStyles';
import type {
  OAuthClientListItem,
  OAuthClientCreate,
  OAuthClientCreateResponse,
  OAuthClientDetail,
  OAuthClientSecretRotateResponse,
  OAuthClientUpdate
} from '@shared/oauth-wrapper/schema/OAuthAuthorizeSchema';
import { developerAppsI18n } from '@config/i18n-mapping/developerAppsI18n';
import { ROUTE_OAUTH_PLAYGROUND } from '@config/route';
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

function parseRedirectUris(raw: string): string[] {
  return raw
    .split('\n')
    .map((uri) => uri.trim())
    .filter((uri) => uri.length > 0);
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
  const tt = useI18nMapping(developerAppsI18n);
  const [apps, setApps] = useState<OAuthClientListItem[]>(initialApps);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
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

  const formLabels = useMemo(
    () => ({
      appNameLabel: tt.appNameLabel || 'Application Name',
      appNameRequired: tt.appNameRequired || 'Please enter application name',
      redirectUrisLabel: tt.redirectUrisLabel || 'Redirect URIs (one per line)',
      redirectUrisPlaceholder:
        tt.redirectUrisPlaceholder ||
        'https://your-app.com/callback\nhttps://localhost:3000/callback',
      redirectUrisHint:
        tt.redirectUrisHint ||
        'Multiple callback URLs supported, one per line. Must use HTTPS (http://localhost allowed for local development).',
      clientUriLabel:
        tt.clientUriLabel || 'Application Homepage URL (Optional)',
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
      errors.redirect_uris = formLabels.appNameRequired;
    }
    return Object.keys(errors).length > 0 ? errors : null;
  };

  const loadApps = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/clients', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to load applications');
      }
      const data = await readAppApiJson<OAuthClientListItem[]>(response);
      setApps(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load apps error:', error);
      message.error(
        tt.toastError || 'Operation failed, please try again later'
      );
    } finally {
      setLoading(false);
    }
  }, [tt.toastError]);

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
      message.success(tt.copyClientIdSuccess || 'Client ID copied');
    } catch {
      message.error(
        tt.toastError || 'Operation failed, please try again later'
      );
    }
  };

  const handleCopyFromCredentialsModal = async (field: 'id' | 'secret') => {
    if (!credentials) return;
    try {
      if (field === 'id') {
        await copyText(credentials.clientId);
        message.success(tt.copyClientIdSuccess || 'Client ID copied');
      } else if (credentials.clientSecret) {
        await copyText(credentials.clientSecret);
        message.success(tt.copySecretSuccess || 'Client Secret copied');
      }
    } catch {
      message.error(
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
    const validationErrors = validateFormValues(createValues);
    if (validationErrors) {
      setCreateFieldErrors(validationErrors);
      return;
    }
    setCreateFieldErrors({});

    try {
      const redirectUris = parseRedirectUris(createValues.redirect_uris);
      const payload: OAuthClientCreate = {
        client_name: createValues.client_name.trim(),
        client_uri: createValues.client_uri.trim() || undefined,
        redirect_uris: redirectUris,
        confidential: createValues.confidential
      };

      const response = await fetch('/api/clients', {
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
      message.error(
        tt.toastError || 'Operation failed, please try again later'
      );
    }
  };

  const handleEditApp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingApp) return;

    const validationErrors = validateFormValues(editValues);
    if (validationErrors) {
      setEditFieldErrors(validationErrors);
      return;
    }
    setEditFieldErrors({});

    try {
      const redirectUris = parseRedirectUris(editValues.redirect_uris);
      const payload: OAuthClientUpdate = {
        client_name: editValues.client_name.trim(),
        client_uri: editValues.client_uri.trim() || undefined,
        redirect_uris: redirectUris
      };

      const response = await fetch(
        `/api/clients/${encodeURIComponent(editingApp.client_id)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        }
      );

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
                redirect_uris: updatedApp.redirect_uris,
                updated_at: updatedApp.updated_at
              }
            : app
        )
      );

      setEditModalVisible(false);
      setEditingApp(null);
      resetEditForm();

      message.success(
        tt.toastUpdateSuccess || 'Application updated successfully'
      );
    } catch (error) {
      console.error('Update app error:', error);
      message.error(
        tt.toastError || 'Operation failed, please try again later'
      );
    }
  };

  const handleRotateSecret = (clientId: string, confidential = true) => {
    if (!confidential) {
      message.warning(
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
          const response = await fetch(
            `/api/clients/${encodeURIComponent(clientId)}/rotate-secret`,
            { method: 'POST', credentials: 'include' }
          );

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
          message.error(
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
          const response = await fetch(
            `/api/clients/${encodeURIComponent(clientId)}`,
            {
              method: 'DELETE',
              credentials: 'include'
            }
          );

          if (!response.ok && response.status !== 204) {
            throw new Error('Failed to delete application');
          }

          setApps((prev) => prev.filter((app) => app.client_id !== clientId));
          message.success(tt.toastDeleteSuccess || 'Application deleted');
        } catch (error) {
          console.error('Delete app error:', error);
          message.error(
            tt.toastError || 'Operation failed, please try again later'
          );
          throw error;
        }
      }
    });
  };

  const openEditModal = (app: OAuthClientListItem) => {
    setEditingApp(app);
    void (async () => {
      try {
        const detail = await readAppApiJson<OAuthClientDetail>(
          await fetch(`/api/clients/${encodeURIComponent(app.client_id)}`, {
            credentials: 'include'
          })
        );
        setEditValues({
          client_name: detail.client_name,
          client_uri: detail.client_uri || '',
          redirect_uris: detail.redirect_uris.join('\n'),
          confidential: detail.confidential
        });
      } catch {
        setEditValues({
          client_name: app.client_name,
          client_uri: app.client_uri || '',
          redirect_uris: app.redirect_uris.join('\n'),
          confidential: app.confidential ?? true
        });
      }
    })();
    setEditFieldErrors({});
    setEditModalVisible(true);
  };

  const openCreateModal = () => {
    resetCreateForm();
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
                  <Link
                    href={ROUTE_OAUTH_PLAYGROUND}
                    className={oauthSecondaryButtonClass}
                  >
                    <ExperimentOutlined />
                    {tt.playgroundLink || 'OAuth playground'}
                  </Link>
                  <button
                    type="button"
                    className={oauthPrimaryButtonClass}
                    onClick={openCreateModal}
                  >
                    <PlusOutlined />
                    {tt.createButton || 'Create New App'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-secondary-text">
                  <LoadingOutlined spin className="text-2xl text-brand" />
                  <span className="text-sm">
                    {tt.loading || 'Loading applications…'}
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
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <code className="text-sm bg-secondary text-primary-text px-2 py-1 rounded-lg font-mono border border-primary-border/40 break-all">
                              {tt.clientIdLabel || 'Client ID'}: {app.client_id}
                            </code>
                            <button
                              type="button"
                              onClick={() =>
                                void handleCopyClientId(app.client_id)
                              }
                              className={oauthGhostActionClass}
                              aria-label={
                                tt.copyClientIdSuccess || 'Copy Client ID'
                              }
                            >
                              <CopyOutlined />
                            </button>
                          </div>
                          <p className="text-sm text-secondary-text break-words">
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
                          <button
                            type="button"
                            className={oauthGhostActionClass}
                            onClick={() => openEditModal(app)}
                          >
                            <EditOutlined />
                            {tt.editButton || 'Edit'}
                          </button>
                          <button
                            type="button"
                            className={clsx(
                              oauthGhostActionClass,
                              'text-amber-700 dark:text-amber-300 hover:bg-amber-500/10'
                            )}
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
                            <KeyOutlined />
                            {tt.rotateSecretButton || 'Rotate Secret'}
                          </button>
                          <button
                            type="button"
                            className={clsx(
                              oauthGhostActionClass,
                              'text-red-600 dark:text-red-400 hover:bg-red-500/10'
                            )}
                            onClick={() => handleDeleteApp(app.client_id)}
                          >
                            <DeleteOutlined />
                            {tt.deleteButton || 'Delete'}
                          </button>
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
        onClose={() => {
          setCreateModalVisible(false);
          resetCreateForm();
        }}
        maxWidthClass="max-w-xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className={oauthSecondaryButtonClass}
              onClick={() => {
                setCreateModalVisible(false);
                resetCreateForm();
              }}
            >
              {tt.cancelButton || 'Cancel'}
            </button>
            <button
              type="submit"
              form="create-oauth-client"
              className={oauthPrimaryButtonClass}
            >
              {tt.createSubmitButton || 'Create Application'}
            </button>
          </div>
        }
      >
        <OAuthClientAppForm
          formId="create-oauth-client"
          values={createValues}
          fieldErrors={createFieldErrors}
          labels={formLabels}
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
        onClose={() => {
          setEditModalVisible(false);
          setEditingApp(null);
          resetEditForm();
        }}
        maxWidthClass="max-w-xl"
        footer={
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {editingApp && (
                <>
                  <button
                    type="button"
                    className={oauthWarningButtonClass}
                    onClick={() =>
                      void handleRotateSecret(
                        editingApp.client_id,
                        editValues.confidential
                      )
                    }
                    disabled={!editValues.confidential}
                  >
                    <KeyOutlined />
                    {tt.rotateSecretButton || 'Rotate Secret'}
                  </button>
                  <button
                    type="button"
                    className={oauthDangerButtonClass}
                    onClick={() => {
                      const clientId = editingApp.client_id;
                      setEditModalVisible(false);
                      setEditingApp(null);
                      resetEditForm();
                      handleDeleteApp(clientId);
                    }}
                  >
                    <DeleteOutlined />
                    {tt.deleteButton || 'Delete'}
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className={oauthSecondaryButtonClass}
                onClick={() => {
                  setEditModalVisible(false);
                  setEditingApp(null);
                  resetEditForm();
                }}
              >
                {tt.cancelButton || 'Cancel'}
              </button>
              <button
                type="submit"
                form="edit-oauth-client"
                className={oauthPrimaryButtonClass}
              >
                {tt.saveSubmitButton || 'Save Changes'}
              </button>
            </div>
          </div>
        }
      >
        <OAuthClientAppForm
          formId="edit-oauth-client"
          values={editValues}
          fieldErrors={editFieldErrors}
          labels={formLabels}
          lockClientType
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
      </DeveloperOverlayModal>
    </>
  );
}
