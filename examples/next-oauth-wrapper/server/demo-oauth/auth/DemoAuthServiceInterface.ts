export type DemoVerifyLoginParams = {
  email: string;
  password: string;
};

export type DemoVerifyLoginResult = {
  userId: number;
  email: string;
  name: string;
};

export interface DemoAuthServiceInterface {
  verifyLogin(params: DemoVerifyLoginParams): Promise<DemoVerifyLoginResult>;
}
