import { Request } from 'express';

export const getUserFromRequest = (req: Request) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;

  const tokenTokens = authHeader.split(' ');

  if (tokenTokens.length === 2) {
    const [type, token] = tokenTokens;
    if (type === 'Bearer') {
      const [_, tokenPayload] = token.split('.');

      const buffer = Buffer.from(tokenPayload, 'base64');
      const payload = JSON.parse(buffer.toString());

      return payload;
    }
  }

  return null;
};

export const createLogFromRequest = (req: Request, emailClaim: string) => {
  const user = getUserFromRequest(req);
  return {
    message: `[${req.method}] ${decodeURIComponent(req.originalUrl)} [${user?.[emailClaim] || 'anonymous'}]`,
    meta: {
      ip: req.socket?.remoteAddress,
      reqUrl: req.originalUrl,
      reqMethod: `[${req.method}]`,
      host: req.hostname,
      userAgent: req.headers['user-agent'],
      userEmail: user?.[emailClaim],
      userId: decodeURIComponent(user?.sub),
      userName: user?.name,
      userRole: user?.roles ? user.roles[0] : 'anonymous',
      body: JSON.stringify(req.body),
    },
  };
};
