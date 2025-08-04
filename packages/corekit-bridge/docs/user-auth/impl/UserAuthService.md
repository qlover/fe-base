## `src/core/user-auth/impl/UserAuthService` (Module)

**Type:** `unknown`

---

### `UserAuthService` (Class)

**Type:** `unknown`

User authentication service implementation

Significance: Core orchestration service for complete authentication lifecycle management
Core idea: Unified service layer that coordinates API calls, state management, and persistent storage
Main function: Provide high-level authentication operations with consistent error handling and state synchronization
Main purpose: Simplify authentication integration with pluggable architecture supporting various backends and storage options

**Example:** Basic setup with minimal configuration

```ts
const authService = new UserAuthService(new UserAuthApi(), {});
```

**Example:** Advanced setup with custom storage and OAuth support

```ts
const authService = new UserAuthService(new UserAuthApi(), {
  userStorage: {
    key: 'user_profile',
    storage: localStorage,
    expiresIn: 'week'
  },
  credentialStorage: {
    key: 'auth_token',
    storage: sessionStorage,
    expiresIn: 'day'
  },
  href: window.location.href,
  tokenKey: 'access_token'
});
```

**Example:** OAuth integration setup

```ts
const oauthService = new UserAuthService(new OAuthApi(), {
  userStorage: {
    key: 'oauth_user',
    storage: localStorage,
    expiresIn: 'month'
  },
  credentialStorage: {
    key: 'oauth_token',
    storage: localStorage,
    expiresIn: 'week'
  },
  href: 'https://app.example.com/oauth/callback?access_token=oauth_123&user_id=456',
  tokenKey: 'access_token'
});
```

**Example:** Session-only setup (no persistence)

```ts
const sessionService = new UserAuthService(new SessionApi(), {
  userStorage: false,
  credentialStorage: false
});
```

**Example:** Enterprise setup with encrypted storage

```ts
const enterpriseService = new UserAuthService(new EnterpriseApi(), {
  userStorage: {
    key: 'enterprise_user',
    storage: new EncryptedStorage(),
    expiresIn: 'day'
  },
  credentialStorage: {
    key: 'enterprise_token',
    storage: new SecureStorage(),
    expiresIn: 'hour'
  }
});
```

**Example:** Complete authentication flow

```ts
try {
  await authService.login({ email: 'user@example.com', password: 'password' });
  if (authService.isAuthenticated()) {
    const user = await authService.userInfo();
    console.log('Logged in as:', user.name);
  }
} catch (error) {
  console.error('Authentication failed:', error);
}
```

---

#### `new UserAuthService` (Constructor)

**Type:** `(api: UserAuthApiInterface<PickUser<InferState<T>>>, options: UserAuthOptions<InferState<T>, string>) => UserAuthService<T>`

#### Parameters

| Name      | Type                                            | Optional | Default | Since | Deprecated | Description                                                                      |
| --------- | ----------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `api`     | `UserAuthApiInterface<PickUser<InferState<T>>>` | ❌       | -       | -     | -          | Authentication API service implementing UserAuthApiInterface for HTTP operations |
| `options` | `UserAuthOptions<InferState<T>, string>`        | ❌       | -       | -     | -          | Configuration options for storage, URL token extraction, and service behavior    |

---

#### `_store` (Property)

**Type:** `UserAuthStoreInterface<PickUser<InferState<T>>>`

---

#### `api` (Property)

**Type:** `UserAuthApiInterface<PickUser<InferState<T>>>`

Authentication API service implementing UserAuthApiInterface for HTTP operations

---

#### `store` (Accessor)

**Type:** `unknown`

---

#### `isAuthenticated` (Method)

**Type:** `() => boolean`

---

##### `isAuthenticated` (CallSignature)

**Type:** `boolean`

Check if user is currently authenticated

Significance: Critical method for authentication state verification and access control
Core idea: Comprehensive authentication check combining login status and user data presence
Main function: Verify both successful login status and valid user information existence
Main purpose: Provide reliable authentication state check for routing, UI rendering, and API access decisions

**Returns:**

True if user is fully authenticated with valid session, false otherwise

**Example:**

```ts
// Basic authentication check
if (authService.isAuthenticated()) {
  // User is logged in, show authenticated UI
  const user = await authService.userInfo();
  console.log('Welcome back,', user.name);
} else {
  // User needs to log in
  console.log('Please log in to continue');
  window.location.href = '/login';
}

// Route protection
const protectedRoute = () => {
  if (!authService.isAuthenticated()) {
    throw new Error('Authentication required');
  }
  return renderDashboard();
};

// API call protection
const makeApiCall = async () => {
  if (!authService.isAuthenticated()) {
    await authService.login(savedCredentials);
  }
  return api.getData();
};
```

---

#### `login` (Method)

**Type:** `(params: unknown) => Promise<LoginResponseData>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                                            |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------------- |
| `params` | `unknown` | ❌       | -       | -     | -          | Login credentials including email/password, OAuth tokens, or other authentication data |

---

##### `login` (CallSignature)

**Type:** `Promise<LoginResponseData>`

Authenticate user with credentials

Significance: Primary authentication method for user login operations
Core idea: Complete login flow with comprehensive state management and error handling
Main function: Orchestrate API login call, user info retrieval, and state updates
Main purpose: Provide secure, reliable user authentication with proper state synchronization

**Returns:**

Promise resolving to login response data containing authentication tokens and metadata

**Throws:**

When login fails due to invalid credentials, network issues, or user info retrieval errors

**Example:**

```ts
// Email/password login
try {
  const response = await authService.login({
    email: 'user@example.com',
    password: 'securePassword123'
  });
  console.log('Login successful, token:', response.token);
} catch (error) {
  console.error('Login failed:', error.message);
}

// OAuth token login
try {
  const response = await authService.login({
    oauthToken: 'oauth-token-from-provider',
    provider: 'google'
  });
  console.log('OAuth login successful');
} catch (error) {
  console.error('OAuth login failed:', error.message);
}

// Username/password login
try {
  const response = await authService.login({
    username: 'johndoe',
    password: 'mypassword123'
  });
} catch (error) {
  console.error('Username login failed:', error.message);
}

// Phone number login with OTP
try {
  const response = await authService.login({
    phoneNumber: '+1234567890',
    otp: '123456'
  });
} catch (error) {
  console.error('Phone login failed:', error.message);
}

// Magic link login
try {
  const response = await authService.login({
    magicToken: 'magic-link-token-from-email'
  });
} catch (error) {
  console.error('Magic link login failed:', error.message);
}

// Social login with additional data
try {
  const response = await authService.login({
    socialToken: 'facebook-access-token',
    provider: 'facebook',
    grantedScopes: ['email', 'public_profile']
  });
} catch (error) {
  console.error('Social login failed:', error.message);
}

// Enterprise SSO login
try {
  const response = await authService.login({
    samlResponse: 'base64-encoded-saml-response',
    relayState: 'original-url'
  });
} catch (error) {
  console.error('SSO login failed:', error.message);
}

// API key login
try {
  const response = await authService.login({
    apiKey: 'api-key-123',
    apiSecret: 'api-secret-456'
  });
} catch (error) {
  console.error('API key login failed:', error.message);
}

// Two-factor authentication login
try {
  const response = await authService.login({
    email: 'user@example.com',
    password: 'password123',
    totpCode: '123456'
  });
} catch (error) {
  console.error('2FA login failed:', error.message);
}
```

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                                            |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------------- |
| `params` | `unknown` | ❌       | -       | -     | -          | Login credentials including email/password, OAuth tokens, or other authentication data |

---

#### `logout` (Method)

**Type:** `() => Promise<void>`

---

##### `logout` (CallSignature)

**Type:** `Promise<void>`

Logout current user

Significance: Critical security operation for terminating user sessions
Core idea: Complete logout flow ensuring both server-side and client-side session termination
Main function: Call API logout endpoint and comprehensively clear all local authentication state
Main purpose: Provide secure logout that invalidates sessions and removes sensitive data from storage

**Returns:**

Promise that resolves when logout process is complete

**Throws:**

When logout API call fails (note: local state is still cleared for security)

**Example:**

```ts
// Standard logout
try {
  await authService.logout();
  console.log('Successfully logged out');
  // Redirect to login page
} catch (error) {
  console.error('Logout API error:', error.message);
  // User is still logged out locally for security
}

// Logout with cleanup
await authService.logout();
localStorage.removeItem('user-preferences');
sessionStorage.clear();
window.location.href = '/login';

// Logout with error handling
try {
  await authService.logout();
  // Successful logout
  showSuccessMessage('Logged out successfully');
} catch (error) {
  // API error, but user is still logged out locally
  console.warn('Logout API failed, but user logged out locally');
} finally {
  // Always redirect after logout attempt
  router.push('/login');
}

// Logout from all devices (if API supports it)
try {
  await authService.logout();
  // API call to invalidate all user sessions
  await api.logoutAllDevices();
} catch (error) {
  console.error('Failed to logout from all devices:', error.message);
}
```

---

#### `register` (Method)

**Type:** `(params: unknown) => Promise<LoginResponseData>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                                           |
| -------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------------------------- |
| `params` | `unknown` | ❌       | -       | -     | -          | Registration data including email, password, profile information, and validation data |

---

##### `register` (CallSignature)

**Type:** `Promise<LoginResponseData>`

Register a new user account

Significance: Essential method for user onboarding and account creation
Core idea: Complete registration flow with automatic authentication upon successful account creation
Main function: Call API register endpoint, fetch user info, and establish authenticated session
Main purpose: Streamline user registration by combining account creation with immediate authentication

**Returns:**

Promise resolving to registration response data with same structure as login response

**Throws:**

When registration fails due to validation errors, conflicts, or user info retrieval issues

**Example:**

```ts
// Basic user registration
try {
  const response = await authService.register({
    email: 'newuser@example.com',
    password: 'securePassword123',
    name: 'John Doe',
    acceptTerms: true
  });
  console.log('Registration successful, token:', response.token);
} catch (error) {
  console.error('Registration failed:', error.message);
}

// Registration with profile data
try {
  const response = await authService.register({
    email: 'user@example.com',
    password: 'password123',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      company: 'Acme Corp',
      phone: '+1234567890'
    },
    preferences: {
      newsletter: true,
      notifications: false
    }
  });
} catch (error) {
  if (error.message.includes('email already exists')) {
    console.error('Email already registered');
  }
}

// Registration with username
try {
  const response = await authService.register({
    username: 'johndoe123',
    email: 'john@example.com',
    password: 'mypassword123',
    displayName: 'John Doe'
  });
} catch (error) {
  console.error('Username registration failed:', error.message);
}

// Registration with phone number
try {
  const response = await authService.register({
    phoneNumber: '+1234567890',
    password: 'password123',
    name: 'John Doe',
    countryCode: 'US'
  });
} catch (error) {
  console.error('Phone registration failed:', error.message);
}

// Social registration
try {
  const response = await authService.register({
    socialToken: 'google-oauth-token',
    provider: 'google',
    additionalInfo: {
      referralCode: 'FRIEND123',
      source: 'social_media'
    }
  });
} catch (error) {
  console.error('Social registration failed:', error.message);
}

// Registration with validation
try {
  const response = await authService.register({
    email: 'user@example.com',
    password: 'password123',
    passwordConfirmation: 'password123',
    name: 'John Doe',
    birthDate: '1990-01-01',
    acceptTerms: true,
    acceptPrivacy: true,
    emailVerificationRequired: true
  });
} catch (error) {
  console.error('Registration validation failed:', error.message);
}

// Enterprise registration
try {
  const response = await authService.register({
    email: 'admin@company.com',
    password: 'enterprisePassword123',
    organizationName: 'Acme Corporation',
    organizationDomain: 'acme.com',
    role: 'admin',
    inviteCode: 'ENTERPRISE_INVITE_123'
  });
} catch (error) {
  console.error('Enterprise registration failed:', error.message);
}

// Registration with custom fields
try {
  const response = await authService.register({
    email: 'user@example.com',
    password: 'password123',
    customFields: {
      department: 'Engineering',
      jobTitle: 'Software Developer',
      experience: '5-10 years',
      skills: ['JavaScript', 'React', 'Node.js']
    }
  });
} catch (error) {
  console.error('Custom field registration failed:', error.message);
}
```

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                                           |
| -------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------------------------- |
| `params` | `unknown` | ❌       | -       | -     | -          | Registration data including email, password, profile information, and validation data |

---

#### `userInfo` (Method)

**Type:** `(loginData: LoginResponseData) => Promise<PickUser<InferState<T>>>`

#### Parameters

| Name        | Type                | Optional | Default | Since | Deprecated | Description                                                           |
| ----------- | ------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------- |
| `loginData` | `LoginResponseData` | ✅       | -       | -     | -          | Optional login response data containing tokens for API authentication |

---

##### `userInfo` (CallSignature)

**Type:** `Promise<PickUser<InferState<T>>>`

Get current user information

Significance: Essential method for retrieving and synchronizing user profile data
Core idea: Fetch fresh user data from API and intelligently merge with stored information
Main function: Call API for latest user info and merge with local data using API data precedence
Main purpose: Ensure user information is current while preserving local modifications and handling data conflicts

**Returns:**

Promise resolving to complete user information object with merged data

**Throws:**

When user info fetch fails due to network issues, authentication errors, or API failures

**Example:**

```ts
// Get current user info
try {
  const user = await authService.userInfo();
  console.log('User profile:', {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles
  });
} catch (error) {
  console.error('Failed to fetch user info:', error.message);
}

// Get user info with specific login data
const loginResponse = await authService.login(credentials);
const user = await authService.userInfo(loginResponse);

// Get user info with custom login data
const customLoginData = {
  token: 'custom-jwt-token',
  refreshToken: 'custom-refresh-token',
  expiresIn: 3600
};
const user = await authService.userInfo(customLoginData);

// Get user info with OAuth response
const oauthResponse = {
  token: 'oauth-access-token',
  refreshToken: 'oauth-refresh-token',
  expiresIn: 7200,
  scope: 'read write'
};
const user = await authService.userInfo(oauthResponse);

// Get user info after token refresh
const refreshedData = await tokenService.refreshToken();
const user = await authService.userInfo(refreshedData);
```

#### Parameters

| Name        | Type                | Optional | Default | Since | Deprecated | Description                                                           |
| ----------- | ------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------- |
| `loginData` | `LoginResponseData` | ✅       | -       | -     | -          | Optional login response data containing tokens for API authentication |

---

### `UserAuthOptions` (Interface)

**Type:** `unknown`

User authentication service configuration options

Significance: Central configuration interface for authentication system setup
Core idea: Comprehensive options for customizing authentication behavior
Main function: Configure API, storage, and URL token handling
Main purpose: Provide flexible authentication service initialization

**Example:**

```ts
// Basic configuration
const basicOptions: UserAuthOptions<User> = {};

// Complete configuration with all options
const completeOptions: UserAuthOptions<User> = {
  store: customStore,
  userStorage: {
    key: 'user_profile',
    storage: localStorage,
    expiresIn: 'week'
  },
  credentialStorage: {
    key: 'auth_token',
    storage: sessionStorage,
    expiresIn: 'day'
  },
  href: 'https://app.example.com/callback?access_token=abc123&user_id=456',
  tokenKey: 'access_token'
};

// OAuth configuration
const oauthOptions: UserAuthOptions<User> = {
  userStorage: {
    key: 'oauth_user',
    storage: localStorage,
    expiresIn: 'month'
  },
  credentialStorage: {
    key: 'oauth_token',
    storage: localStorage,
    expiresIn: 'week'
  },
  href: window.location.href,
  tokenKey: 'access_token'
};

// Session-only configuration (no persistence)
const sessionOptions: UserAuthOptions<User> = {
  userStorage: false,
  credentialStorage: false
};

// Custom storage backends
const customStorageOptions: UserAuthOptions<User> = {
  userStorage: {
    key: 'encrypted_user',
    storage: new EncryptedStorage(),
    expiresIn: 'week'
  },
  credentialStorage: {
    key: 'secure_token',
    storage: new SecureStorage(),
    expiresIn: 'day'
  }
};
```

---

#### `credentialStorage` (Property)

**Type:** `false \| TokenStorageValueType<string, string>`

**Default:** `ts
TokenStorage with memory backend
`

Authentication credential storage configuration

Configures persistent storage for authentication tokens:

- Stores authentication tokens securely
- Handles token expiration
- Supports various storage backends
- Only stores string values (tokens, not user objects)

Set to
`false`
to disable credential persistence.

**Param:** credentialStorage

Storage configuration or false to disable

**Example:**

```ts
// Secure token storage with sessionStorage
credentialStorage: {
  key: 'auth_token',
  storage: sessionStorage,
  expiresIn: 'day'
}

// Long-term token storage
credentialStorage: {
  key: 'refresh_token',
  storage: localStorage,
  expiresIn: 'month'
}

// Short-term token storage (15 minutes)
credentialStorage: {
  key: 'access_token',
  storage: sessionStorage,
  expiresIn: 15 * 60 * 1000 // 15 minutes in ms
}

// Disable credential storage (memory only)
credentialStorage: false

// Custom secure storage
credentialStorage: {
  key: 'jwt_token',
  storage: new EncryptedStorage(),
  expiresIn: 'week'
}
```

---

#### `href` (Property)

**Type:** `string`

URL for token extraction

Used for extracting authentication tokens from URL parameters,
typically after OAuth redirects or magic link authentication:

- Parses query parameters from the provided URL
- Extracts token based on tokenKey parameter
- Automatically stores extracted token in credential storage

**Param:** href

Complete URL string containing token parameters

**Example:**

```ts
// OAuth callback URL
href: 'https://app.example.com/callback?access_token=abc123&state=xyz';

// Magic link URL
href: 'https://app.example.com/verify?token=magic_token_456&email=user@example.com';

// Current page URL (for SPA routing)
href: window.location.href;

// URL with multiple parameters
href: 'https://app.example.com/auth?access_token=jwt_token&refresh_token=refresh_jwt&expires_in=3600';

// URL with fragment (hash-based routing)
href: 'https://app.example.com/#/callback?access_token=hash_token';
```

---

#### `store` (Property)

**Type:** `UserAuthStoreOptions<State> \| UserAuthStoreInterface<PickUser<State>>`

Authentication state store implementation

Manages in-memory authentication state including:

- User information storage
- Authentication token management
- Login status tracking
- Error state handling

**Param:** store

Store implementation, defaults to UserAuthStore if not provided

**Example:**

```ts
// Use default store
const options1: UserAuthOptions<User> = {};

// Use custom store
const customStore = new CustomUserAuthStore();
const options2: UserAuthOptions<User> = {
  store: customStore
};
```

---

#### `tokenKey` (Property)

**Type:** `string`

**Default:** `ts
credentialStorage.key || 'auth_token'
`

Token parameter name in URL

Specifies the query parameter name to extract from the URL:

- Used in conjunction with href parameter
- Defaults to credentialStorage.key if available
- Falls back to 'auth_token' if not specified

**Param:** tokenKey

Parameter name in URL query string

**Example:**

```ts
// Standard OAuth token parameter
tokenKey: 'access_token';
// URL: https://example.com?access_token=123

// Custom token parameter
tokenKey: 'jwt';
// URL: https://example.com?jwt=eyJhbGciOiJIUzI1NiJ9...

// Magic link token
tokenKey: 'verification_token';
// URL: https://example.com?verification_token=magic_123

// API key parameter
tokenKey: 'api_key';
// URL: https://example.com?api_key=key_123

// Session token
tokenKey: 'session_id';
// URL: https://example.com?session_id=sess_456
```

---

#### `userStorage` (Property)

**Type:** `false \| TokenStorageValueType<Key, PickUser<State>>`

**Default:** `ts
TokenStorage with memory backend
`

User information storage configuration

Configures persistent storage for user profile data:

- Supports various storage backends (localStorage, sessionStorage, etc.)
- Handles serialization/deserialization of user objects
- Manages storage expiration and cleanup

Set to
`false`
to disable user information persistence.

**Param:** userStorage

Storage configuration or false to disable

**Example:**

```ts
// localStorage with 1 week expiration
userStorage: {
  key: 'user_profile',
  storage: localStorage,
  expiresIn: 'week'
}

// sessionStorage (expires when tab closes)
userStorage: {
  key: 'session_user',
  storage: sessionStorage
}

// Custom storage with numeric expiration (milliseconds)
userStorage: {
  key: 'app_user',
  storage: customStorage,
  expiresIn: 7 * 24 * 60 * 60 * 1000 // 1 week in ms
}

// Disable user storage (memory only)
userStorage: false

// Memory storage with expiration
userStorage: {
  key: 'temp_user',
  expiresIn: 'day'
}
```

---

### `InferState` (TypeAlias)

**Type:** `unknown`

---
