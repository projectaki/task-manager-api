export interface LogMetaData {
  reqUrl: string;
  reqMethod: string;
  protocol: string;
  host: string;
  userAgent: string;
  ip: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}
