import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClinicStoreService } from '../common/store/clinic-store.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly store: ClinicStoreService,
    private readonly jwtService: JwtService,
  ) {}

  register(dto: RegisterDto) {
    const existing = this.store
      .listUsers()
      .find((user) => user.email.toLowerCase() === dto.email.toLowerCase());

    if (existing) {
      throw new ConflictException('User already exists.');
    }

    const user = this.store.createUser({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });

    return this.issueToken(user.id, user.email, user.name);
  }

  login(dto: LoginDto) {
    const user = this.store
      .listUsers()
      .find(
        (record) =>
          record.email.toLowerCase() === dto.email.toLowerCase() &&
          record.password === dto.password,
      );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.issueToken(user.id, user.email, user.name);
  }

  private issueToken(id: number, email: string, name: string) {
    return {
      accessToken: this.jwtService.sign({
        sub: id,
        email,
        name,
      }),
      user: { id, email, name },
      demoHints: {
        email: 'demo@careintake.test',
        password: 'password',
      },
    };
  }
}
