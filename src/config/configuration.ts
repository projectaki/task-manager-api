export interface DBConfig {
  uri: string;
}

export interface AuthConfig {
  authority: string;
  audience: string;
  jwksUri: string;
}

export default () => ({
  database: {
    uri: process.env['MONGODB_URI'],
  } as DBConfig,
  auth: {
    authority: process.env.AUTHORITY,
    audience: process.env.AUDIENCE,
    jwksUri: process.env.JWKS_URI,
  } as AuthConfig,
});
