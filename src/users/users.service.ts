// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findByGoogleId(googleId: string) {
    return this.repo.findOne({ where: { googleId } });
  }

  findById(id: string | number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.repo.findOne({ where: { id } as any });
  }

  create(userData: Partial<User>) {
    const user = this.repo.create(userData);
    return this.repo.save(user);
  }

  async updatePassword(
    userId: string | number,
    hashedPassword: string,
  ): Promise<void> {
    await this.repo.update(userId, { password: hashedPassword });
  }

  async updateGoogleProfile(
    userId: string | number,
    data: { googleId: string; profileImageUrl?: string },
  ): Promise<void> {
    await this.repo.update(userId, data);
  }
}
