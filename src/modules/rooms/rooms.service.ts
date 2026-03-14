import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create.room.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { UpdateRoomDto } from './dto/update.room.dto';

@Injectable()
export class RoomsService {
    constructor(private readonly prisma: PrismaService) { }
    async createRoom(payload: CreateRoomDto) {
        const existRoom = await this.prisma.room.findUnique({
            where: {
                name: payload.name
            }
        })
        if (existRoom) throw new ConflictException("Room name is already used")

        await this.prisma.room.create({ data: payload })

        return {
            success: true,
            message: "Room successfully created"
        }

    }
    async getALlRooms() {
        return {
            success: true,
            data: await this.prisma.room.findMany({
                where: {
                    status: "active"
                }
            })
        }
    }
    async getALlInActivesRooms() {
        return {
            success: true,
            data: await this.prisma.room.findMany({
                where: {
                    status:"inactive"
                }
            })
        }
    }
    async deleteRoom(roomId: number) {
        const existRoom = await this.prisma.room.findUnique({
            where: {
                id: roomId
            }
        })
        if (!existRoom) throw new NotFoundException("Room is not found with this id")

        await this.prisma.room.update({
            where: {
                id: roomId
            },
            data: {
                status: "inactive"
            }
        })

        return {
            success: true,
            message: "Room is successfully deleted"
        }
    }
    async updateRoom(payload: UpdateRoomDto, roomId: number) {
        const existRoom = await this.prisma.room.findUnique({
            where: {
                id: roomId
            }
        })
        if (!existRoom) throw new NotFoundException("Room is not found with this id")

        await this.prisma.room.update({
            where: {
                id: roomId
            },
            data: payload
        })
        return {
            success: true,
            message: "Room successfully updated"
        }
    }
}
