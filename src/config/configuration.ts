export interface DBConfig {
  uri: string;
}

export default () => ({
  database: {
    uri: process.env['MONGODB_URI'],
  } as DBConfig,
});
