export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_PORT: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DATABASE: string;
      DB_HOST: string;
      ENV: 'test' | 'dev' | 'prod';
    }
  }
}