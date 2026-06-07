import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../auth.service';
import { User, UserStatus } from '../../../../modules/system/entities/user.entity';

/**
 * 认证服务单元测试
 * 测试登录、注册、Token验证功能
 */
describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: any;
  let mockJwtService: any;

  // 测试用户数据
  const mockUser: Partial<User> = {
    id: 'test-user-id',
    username: 'testuser',
    password: '$2a$10$abcdefghijklmnopqrstuv', // 加密后的密码
    email: 'test@example.com',
    fullName: '测试用户',
    status: UserStatus.ACTIVE,
    lastLoginAt: null,
  };

  // 原始密码（用于bcrypt比较）
  const originalPassword = 'password123';

  beforeEach(async () => {
    // 创建模拟用户仓库
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    // 创建模拟JWT服务
    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login - 用户登录', () => {
    /**
     * 测试正常登录流程
     * 验证：用户存在、密码正确、状态正常，应返回token和用户信息
     */
    it('应该成功登录并返回token', async () => {
      // 模拟用户存在且密码匹配
      const hashedPassword = await bcrypt.hash(originalPassword, 10);
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      mockUserRepository.update.mockResolvedValue({});

      const result = await service.login({
        username: 'testuser',
        password: originalPassword,
      });

      // 验证返回结果
      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toHaveProperty('id');
      expect(result.user.username).toBe('testuser');
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalled();
    });

    /**
     * 测试用户不存在的情况
     * 验证：应抛出 UnauthorizedException
     */
    it('用户不存在时应抛出异常', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ username: 'nonexistent', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    /**
     * 测试密码错误的情况
     * 验证：应抛出 UnauthorizedException
     */
    it('密码错误时应抛出异常', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 10);
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      await expect(
        service.login({ username: 'testuser', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    /**
     * 测试账号被禁用的情况
     * 验证：状态为非ACTIVE时应抛出异常
     */
    it('账号被禁用时应抛出异常', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        status: UserStatus.INACTIVE,
      });

      await expect(
        service.login({ username: 'testuser', password: originalPassword }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register - 用户注册', () => {
    /**
     * 测试正常注册流程
     * 验证：用户名和邮箱都可用时，应成功创建用户
     */
    it('应该成功注册新用户', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation((data) => data);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve({ ...user, id: 'new-user-id' }),
      );

      const result = await service.register({
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        fullName: '新用户',
      });

      expect(result).toHaveProperty('id');
      expect(result.username).toBe('newuser');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    /**
     * 测试用户名已存在的情况
     * 验证：应抛出 UnauthorizedException
     */
    it('用户名已存在时应抛出异常', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({
          username: 'testuser',
          password: 'password123',
          email: 'test2@example.com',
          fullName: '测试',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    /**
     * 测试邮箱已被注册的情况
     * 验证：用户名可用但邮箱已被使用时，应抛出异常
     */
    it('邮箱已被注册时应抛出异常', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(null) // 第一次查询用户名 - 不存在
        .mockResolvedValueOnce(mockUser); // 第二次查询邮箱 - 已存在

      await expect(
        service.register({
          username: 'newuser',
          password: 'password123',
          email: 'test@example.com',
          fullName: '测试',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    /**
     * 测试密码加密
     * 验证：保存的用户密码应该是加密后的
     */
    it('注册时应该加密密码', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation((data) => data);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve({ ...user, id: 'new-user-id' }),
      );

      await service.register({
        username: 'newuser',
        password: 'plain-password',
        email: 'new@example.com',
        fullName: '新用户',
      });

      // 验证save被调用时，密码应该是加密的
      const savedUser = mockUserRepository.save.mock.calls[0][0];
      expect(savedUser.password).not.toBe('plain-password');
      expect(savedUser.password).toMatch(/^\$2a\$/); // bcrypt加密前缀
    });
  });

  describe('validateToken - Token验证', () => {
    /**
     * 测试有效Token验证
     * 验证：应返回解析后的payload
     */
    it('有效Token应返回用户信息', async () => {
      const mockPayload = { sub: 'user-id', username: 'testuser' };
      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = await service.validateToken('valid-token');

      expect(result).toEqual(mockPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
    });

    /**
     * 测试无效Token验证
     * 验证：应抛出 UnauthorizedException
     */
    it('无效Token应抛出异常', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    /**
     * 测试过期Token验证
     * 验证：应抛出 UnauthorizedException
     */
    it('过期Token应抛出异常', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.validateToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
