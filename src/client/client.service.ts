import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client,Prisma } from '@prisma/client';
@Injectable()
export class ClientService {
    constructor(private prisma: PrismaService) {}
    async getClientsForUser(userId: number, searchQuery?: string): Promise<Client[]> {
        const searchConditions = searchQuery
          ? {
              OR: [
                {
                  name: {
                    contains: searchQuery,
                  },
                },
                {
                  email: {
                    contains: searchQuery,
                  },
                },
              ],
            }
          : {};
    
        return this.prisma.client.findMany({
          where: {
            userId,
            ...searchConditions,
          },
        });
      }
    
    async createClient(data: Prisma.ClientCreateInput): Promise<Client> {
        return this.prisma.client.create({
            data,
        });
    }
    async deleteClient(id: number): Promise<Client> {
        return this.prisma.client.delete({
            where: {
                id,
            },
        });
    }
    async updateClient(id: number, data: Prisma.ClientUpdateInput): Promise<Client> {
        return this.prisma.client.update({
            where: {
                id,
            },
            data,
        });
    }


}
