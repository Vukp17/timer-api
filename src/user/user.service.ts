import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async create(username: string,email:string ,password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
  }

  async findUnique(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
  async findUniqueById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }
    async findAll() {
        return this.prisma.user.findMany();
    }
    async update(id: number, data: any) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }
}
