import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.userService.findUnique(username);
        if (user && (await this.userService.validatePassword(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(dto: LoginDto) {
        const user = await this.userService.findUnique(dto.email);
        console.log(user);
        this.userService.validatePassword(dto.password, user.password);
        const payload = { username: user.username, sub: user.id };


        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(dto: RegisterDto) {
        console.log(dto);
        await this.userService.create(dto.username, dto.email, dto.password);
        return { message: 'User registered successfully' };
    }
}