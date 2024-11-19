import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { GenerateMd5HashParams } from 'src/click/interfaces/generate-prepare-hash.interface';

@Injectable()
export class HashingService {
  private readonly saltOrRounds: number = 10;

  constructor() {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltOrRounds);
    return await bcrypt.hash(password, salt);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public generateMD5(params: GenerateMd5HashParams, algo = 'md5'): string {
    const content = `${params.clickTransId}${params.serviceId}${params.secretKey}${params.merchantTransId}${params.amount}${params.action}${params.signTime}`;
    const hashFunc = createHash(algo);
    hashFunc.update(content);
    return hashFunc.digest('hex');
  }
}
