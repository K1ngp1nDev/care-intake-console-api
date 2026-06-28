import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    if (process.env.DEMO_AUTH_DISABLED === 'true') {
      const request = context.switchToHttp().getRequest();
      request.user = {
        sub: 1,
        id: 1,
        email: 'demo@example.com',
        name: 'Demo Coordinator',
      };
      return true;
    }

    return super.canActivate(context);
  }
}
