import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User, UserDocument, UserRoleEntry } from './schemas/user.schema';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly model: Model<UserDocument>,
  ) {}

  find(filter: FilterQuery<UserDocument>, sortOrder: 1 | -1) {
    return this.model.find(filter).sort({ createdAt: sortOrder }).limit(20).exec();
  }

  findByUsername(username: string) {
    return this.model.findOne({ username }).exec();
  }

  findUsernames(usernames: string[]) {
    return this.model.find({ username: { $in: usernames } }, { username: 1 }).exec();
  }

  create(username: string, roles: UserRoleEntry[]) {
    return new this.model({ username, roles }).save();
  }

  insertMany(users: { username: string; roles: UserRoleEntry[] }[]) {
    return this.model.insertMany(users);
  }

  upsertByUsername(username: string) {
    return this.model.findOneAndUpdate(
      { username },
      {},
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).exec();
  }

  save(user: UserDocument) {
    return user.save();
  }
}
