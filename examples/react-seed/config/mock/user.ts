import { prefixEndpoint } from '@config/endpoints/_endpoint';
import { EP_USER_INFO, EP_USER_LOGIN } from '@config/endpoints/user';

export default [
  {
    ...prefixEndpoint(EP_USER_INFO),
    response() {
      return {
        id: 1,
        role: 1,
        email: 'test@example.com',
        credential_token: 'mock-credential-token-123456',
        email_confirmed_at: 1717702400,
        created_at: new Date(),
        updated_at: new Date()
      };
    }
  },
  {
    ...prefixEndpoint(EP_USER_LOGIN),
    timeout: 500,
    response() {
      return {
        data: { token: 'mock-token-123456' }
      };
    }
  }
];
