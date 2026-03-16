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

  create(userData: Partial<User>) {
    const user = this.repo.create(userData);
    return this.repo.save(user);
  }
}
