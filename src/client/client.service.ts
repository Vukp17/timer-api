import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client, Prisma } from '@prisma/client';
@Injectable()
export class ClientService {
    constructor(private prisma: PrismaService) { }
    async getClientsForUser(
      page: number,
      pageSize: number,
      userId: number,
      searchQuery?: string,
      sortField?: string,
      sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<Client[]> {
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
        orderBy: sortField ? { [sortField]: sortOrder } : undefined,
        skip: (page - 1) * pageSize,
        take: pageSize,
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

    async getAllClients(userId): Promise<Client[]> {
        return this.prisma.client.findMany(
            {
                where: {
                    userId
                }
            }
        );
    }


}
