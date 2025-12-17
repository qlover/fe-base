# @qlover/fe-standard

Frontend development standards and specifications for consistent code quality.

## Installation

```bash
npm install --save-dev @qlover/fe-standard
# or
pnpm add -D @qlover/fe-standard
```

## Contents

This package includes:

1. **ESLint Configuration**
   - base.json - Base ESLint configuration
   - base.ts.json - TypeScript ESLint configuration

2. **Code Style Guidelines**
   - Naming conventions
   - File organization
   - Best practices

## Usage

### ESLint Configuration

Extend the configuration in your `.eslintrc`:

```json
{
  "extends": ["@qlover/fe-standard/config/base.json"]
}
```

For TypeScript projects:

```json
{
  "extends": ["@qlover/fe-standard/config/base.ts.json"]
}
```

## Features

- Consistent code style across projects
- TypeScript support
- Modern JavaScript standards
- Best practices enforcement

## License

ISC

