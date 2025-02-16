import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client, Prisma } from '@prisma/client';
import { CommonService } from '../common/common.service';
@Injectable()
export class ClientService {
    constructor(private prisma: PrismaService,private commonService:CommonService) { }
    async getClientsForUser(
      page: number,
      pageSize: number,
      userId: number,
      searchQuery?: string,
      sortField?: string,
      sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<{ items: Client[], total: number, page: number, pageSize: number }> {
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

      const whereClause = {
        userId,
        ...searchConditions,
      };
    
      // Get total count of matching records
      const total = await this.prisma.client.count({
        where: whereClause,
      });

      const clients = await this.prisma.client.findMany({
        where: whereClause,
        orderBy: this.commonService.getOrderBy(sortField, sortOrder),
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      
      return {
        items: clients,
        total,
        page,
        pageSize,
      }
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

    async getAllClients(
      userId: number,
      page: number = 1,
      pageSize: number = 10,
      sortField?: string,
      sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<{ items: Client[], total: number, page: number, pageSize: number }> {
        const whereClause = {
            userId
        };

        // Get total count of matching records
        const total = await this.prisma.client.count({
            where: whereClause
        });

        const clients = await this.prisma.client.findMany({
            where: whereClause,
            orderBy: this.commonService.getOrderBy(sortField, sortOrder),
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        return {
            items: clients,
            total,
            page,
            pageSize,
        };
    }


}
