import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BcryptUtilsService } from './bcrypt.service';
import { JwtUtilsService } from './jwt.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ??
          configService.get<string>('JWT_SECRET_KEY') ??
          'academy-secret',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ??
            '7d') as any,
        },
      }),
    }),
  ],
  providers: [BcryptUtilsService, JwtUtilsService],
  exports: [BcryptUtilsService, JwtUtilsService],
})
export class SecurityModule {}
