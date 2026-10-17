import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService (built-in node:crypto scrypt)', () => {
  it('registers a user with a salted scrypt password hash and validates login', async () => {
    let savedUserDoc: { _id: string; username: string; password: string } | null =
      null;

    class MockUserModel {
      username: string;
      password: string;
      constructor(dto: { username: string; password: string }) {
        this.username = dto.username;
        this.password = dto.password;
      }
      async save() {
        savedUserDoc = {
          _id: '507f1f77bcf86cd799439011',
          username: this.username,
          password: this.password,
        };
        return savedUserDoc;
      }
      static findOne({ username }: { username: string }) {
        return {
          exec: async () =>
            savedUserDoc && savedUserDoc.username === username
              ? savedUserDoc
              : null,
        };
      }
    }

    const service = new AuthService(MockUserModel as never);

    const regResult = await service.register('admin', 'Ea1234+');
    assert.equal(regResult.user.username, 'admin');
    assert.ok(savedUserDoc);
    assert.notEqual((savedUserDoc as { password: string }).password, 'Ea1234+');
    assert.ok((savedUserDoc as { password: string }).password.includes(':'));

    // Valid password
    const loginResult = await service.validateUser('admin', 'Ea1234+');
    assert.equal(loginResult.authorized, true);
    assert.equal(loginResult.user.username, 'admin');

    // Wrong password
    await assert.rejects(
      () => service.validateUser('admin', 'WrongPass'),
      UnauthorizedException,
    );

    // Non-existent user
    await assert.rejects(
      () => service.validateUser('unknown', 'Ea1234+'),
      UnauthorizedException,
    );
  });
});
