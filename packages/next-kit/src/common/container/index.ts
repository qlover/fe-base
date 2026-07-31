/**
 * IOC helpers that stay framework-agnostic.
 *
 * Decorator choice (`inject` / `injectable` from corekit-bridge, inversify,
 * etc.) belongs in each app — this package does not re-export them.
 *
 * Apps must import `reflect-metadata` once at their entrypoint before using
 * decorator-based IOC / {@link InversifyContainer}.
 */

export { assertReflectMetadata } from './assertReflectMetadata';
