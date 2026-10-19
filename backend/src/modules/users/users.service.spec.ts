import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Argon2Service } from '../auth/services/argon2.service';
import { RedisService } from '../../common/services/redis.service';
import { UserRole } from '../../common/constants/enums';

describe('UsersService (Staff Governance & Immediate Access Revocation)', () => {
  let service: UsersService;

  const mockUserRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockArgon2Service = {
    hash: jest.fn().mockResolvedValue('$argon2id$v=19$m=65536,t=3,p=4$hashed'),
  };

  const mockRedisService = {
    delByPattern: jest.fn().mockResolvedValue(undefined),
    set: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: Argon2Service,
          useValue: mockArgon2Service,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('provisions a new hospital staff account with Argon2id password hash', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce(null);
    mockUserRepo.create.mockImplementation((dto) => ({ id: 'u-10', ...dto }));
    mockUserRepo.save.mockImplementation(async (u) => u);

    const created = await service.create({
      email: 'julian.bashir@caresync.org',
      password: 'StrongPassword#2026',
      role: UserRole.PHYSICIAN,
      firstName: 'Julian',
      lastName: 'Bashir',
      department: 'Outpatient Clinic',
    });

    expect(mockArgon2Service.hash).toHaveBeenCalledWith('StrongPassword#2026');
    expect(created.email).toBe('julian.bashir@caresync.org');
    expect(created.isActive).toBe(true);
    expect(created.sessionLocked).toBe(false);
  });

  it('rejects duplicate staff emails with ConflictException', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce({
      id: 'u-1',
      email: 'sarah.chen@caresync.org',
    });

    await expect(
      service.create({
        email: 'sarah.chen@caresync.org',
        password: 'StrongPassword#2026',
        role: UserRole.PHYSICIAN,
        firstName: 'Sarah',
        lastName: 'Chen',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('revokes staff access immediately by disabling account, locking session, and purging Redis tokens', async () => {
    const activeStaff = {
      id: 'u-7',
      email: 'david.miller@caresync.org',
      firstName: 'David',
      lastName: 'Miller',
      role: UserRole.RECEPTIONIST,
      isActive: true,
      sessionLocked: false,
    };

    mockUserRepo.findOne.mockResolvedValueOnce(activeStaff);
    mockUserRepo.save.mockImplementation(async (u) => u);

    const revoked = await service.revokeAccess('u-7');

    expect(revoked.isActive).toBe(false);
    expect(revoked.sessionLocked).toBe(true);
    expect(mockRedisService.delByPattern).toHaveBeenCalledWith('session:u-7:*');
    expect(mockRedisService.set).toHaveBeenCalledWith(
      'session:u-7:revoked',
      'true',
      86400,
    );
  });

  it('throws NotFoundException when revoking a non-existent user ID', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.revokeAccess('u-missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
