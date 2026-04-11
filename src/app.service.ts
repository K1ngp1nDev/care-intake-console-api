import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      name: 'Care Intake Console API',
      docsUrl: '/api/docs',
      demoCredentials: {
        email: 'demo@careintake.test',
        password: 'password',
      },
    };
  }
}
