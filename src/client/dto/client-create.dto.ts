import { Client } from "@prisma/client";
export interface ClientCreateDto {
    name: string;
    email: string;
    phone: string;
    address: string;
}
