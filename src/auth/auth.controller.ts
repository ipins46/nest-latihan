import { BadRequestException, Body, Controller, NotFoundException, Post, Res } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './models/register.dto';
import { NotFoundError } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { PassThrough } from 'stream';

@Controller()
export class AuthController {

  constructor(
      private userService: UserService,
      private jwtService: JwtService
    
    ) {

  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    if(body.password !== body.password_confirm) {
      throw new BadRequestException('Password do not match!');
    }

    const hashed = await bcrypt.hash(body.password, 12);

    return this.userService.create({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      password: hashed,
    });
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({passthrough: true}) response: Response
  ) {
    const user = await this.userService.findOne({email});

    if(!user) {
      throw new NotFoundException('User not found');
    }

    if(!await bcrypt.compare(password, (await user).password)) {
      throw new BadRequestException('Invalid credentials');
    }

    const jwt = await this.jwtService.signAsync({id: user.id});

    response.cookie('jwt', jwt, {httpOnly: true});

    return user;
  }

}
