import type {
  RouteCategory,
  RouteConfigValue
} from '@/interfaces/RouteLoaderInterface';

/**
 * Normalizes category arg to a Set for membership check.
 * Routes without `category` are treated as 'general'.
 */
function toAllowedCategories(
  category: RouteCategory | RouteCategory[]
): Set<RouteCategory> {
  const list = Array.isArray(category) ? category : [category];
  return new Set(list);
}

/**
 * Filters routes by category (single or multiple). Routes without `category` are treated as 'general'.
 * Nested `children` are filtered recursively with the same allowed categories.
 */
export function filterRouteByCategorys(
  routes: RouteConfigValue[],
  category: RouteCategory | RouteCategory[]
): RouteConfigValue[] {
  const allowed = toAllowedCategories(category);
  const resolveCategory = (c?: RouteCategory) => c ?? 'general';

  return routes
    .filter((route) => allowed.has(resolveCategory(route.category)))
    .map((route) => ({
      ...route,
      children: route.children?.length
        ? filterRouteByCategorys(route.children, category)
        : undefined
    }));
}
