import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { username: data.username } });
    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    if (data.email) {
      const existingEmail = await this.userRepository.findOne({ where: { email: data.email } });
      if (existingEmail) {
        throw new ConflictException('邮箱已存在');
      }
    }

    const hashedPassword = await bcrypt.hash(data.password || '123456', 10);
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: UserStatus,
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const where: any = {};
    if (search) {
      where.username = Like(`%${search}%`);
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.userRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    
    if (data.username && data.username !== user.username) {
      const existing = await this.userRepository.findOne({ 
        where: { username: data.username },
      });
      if (existing) {
        throw new ConflictException('用户名已存在');
      }
    }

    if (data.email && data.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({ 
        where: { email: data.email },
      });
      if (existingEmail) {
        throw new ConflictException('邮箱已存在');
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.status = UserStatus.INACTIVE;
    await this.userRepository.save(user);
  }
}
