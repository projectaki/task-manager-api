import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthConfig } from 'src/config/configuration';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService, private userService: UsersService) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: config.get<AuthConfig>('auth').jwksUri,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: config.get<AuthConfig>('auth').audience,
      issuer: config.get<AuthConfig>('auth').authority,
      algorithms: ['RS256'],
    });
  }

  /**
   * Custom logic to enrich user object.
   * @param payload Access token decoded.
   * @returns Enriched user object, which will get attached to request object.
   */
  async validate(payload: any): Promise<unknown> {
    const transformedPayload = await this.claimsTransform(payload);

    return transformedPayload;
  }

  private async claimsTransform(payload: any) {
    const emailClaim = this.config.get<string>('EMAIL_CLAIM');

    const user = await this.userService.findOneByQuery({ email: payload.email });
    if (!user) await this.userService.create({ _id: payload.sub, email: payload[emailClaim], name: payload.name });

    const transformedPayload = this.transformUserClaims(payload);

    return transformedPayload;
  }

  private async transformUserClaims(payload: any) {
    const roles = await this.userService.getUserRoles(payload.sub);
    const permissions = await this.userService.getUserPermissions(payload.sub);

    payload.roles = roles;
    payload.permissions = permissions;

    return payload;
  }
}
