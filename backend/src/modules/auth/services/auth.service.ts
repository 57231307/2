import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../../system/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

/**
 * 认证服务
 * 处理用户登录、注册、Token验证
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: Partial<User> }> {
    const { username, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 更新最后登录时间
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`用户 ${username} 登录成功`);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto): Promise<Partial<User>> {
    const { username, password, email, fullName } = registerDto;

    // 检查用户名是否存在
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new UnauthorizedException('用户名已存在');
    }

    // 检查邮箱是否存在
    if (email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email },
      });

      if (existingEmail) {
        throw new UnauthorizedException('邮箱已被注册');
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      email,
      fullName,
      status: UserStatus.ACTIVE,
    });

    await this.userRepository.save(user);

    this.logger.log(`新用户 ${username} 注册成功`);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
    };
  }

  /**
   * 验证Token并获取用户信息
   */
  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token无效或已过期');
    }
  }
}
