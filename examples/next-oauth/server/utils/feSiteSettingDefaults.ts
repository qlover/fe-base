import type {
  FeSiteSettingDefinition,
  FeSiteSettingPrimitive
} from '@config/feSiteSettings';
import { FE_SITE_SETTING_DEFINITIONS } from '@config/feSiteSettings';
import type { FeSiteSettingUpsertInput } from '@server/repositorys/SiteSettingsRepo';

export function resolveFeSiteSettingDefaultValue(
  definition: FeSiteSettingDefinition
): FeSiteSettingPrimitive {
  if (definition.defaultValue !== undefined) {
    return definition.defaultValue;
  }
  return '';
}

export function buildFeSiteSettingSeedRows(): FeSiteSettingUpsertInput[] {
  return FE_SITE_SETTING_DEFINITIONS.map((definition) => ({
    key: definition.key,
    value: resolveFeSiteSettingDefaultValue(definition),
    description: definition.description,
    isSensitive: definition.isSensitive
  }));
}
