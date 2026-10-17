import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

const scrypt = promisify(scryptCallback);

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  private async hashPassword(passwordPlain: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derived = (await scrypt(passwordPlain, salt, 64)) as Buffer;
    return `${salt}:${derived.toString('hex')}`;
  }

  private async verifyPassword(
    passwordPlain: string,
    storedHash: string,
  ): Promise<boolean> {
    const [salt, keyHex] = storedHash.split(':');
    if (!salt || !keyHex) return false;
    const keyBuffer = Buffer.from(keyHex, 'hex');
    const derivedBuffer = (await scrypt(passwordPlain, salt, 64)) as Buffer;
    return (
      keyBuffer.length === derivedBuffer.length &&
      timingSafeEqual(keyBuffer, derivedBuffer)
    );
  }

  async register(username: string, passwordPlain: string) {
    const password = await this.hashPassword(passwordPlain);
    const user = new this.userModel({ username, password });
    const saved = await user.save();
    return {
      user: {
        _id: saved._id,
        username: saved.username,
      },
    };
  }

  async validateUser(username: string, passwordPlain: string) {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user || !(await this.verifyPassword(passwordPlain, user.password))) {
      throw new UnauthorizedException('Invalid user data');
    }
    return {
      authorized: true,
      user: {
        _id: user._id,
        username: user.username,
      },
    };
  }
}
