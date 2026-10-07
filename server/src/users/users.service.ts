import { Injectable, NotFoundException } from '@nestjs/common';
import { UserDocument } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
import { Role, getFlowFromRole, getRolesForFlow, isAdminRole } from '../common/utils/roles.util';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(requesterRoles: Role[], username?: string, roles?: Role[], sort?: 'asc' | 'desc'): Promise<UserDocument[]> {
    const filter: Record<string, unknown> = {};
    if (username) filter.username = { $regex: username, $options: 'i' };
    if (requesterRoles.includes(Role.ANOMALY_ADMIN)) {
      if (roles?.length) filter['roles.role'] = { $in: roles };
    } else {
      const scopedRoles = this.getRolesInAdminScope(requesterRoles);
      const effectiveRoles = roles?.length ? roles.filter((role) => scopedRoles.includes(role)) : scopedRoles;
      if (effectiveRoles.length === 0) return [];
      filter['roles.role'] = { $in: effectiveRoles };
    }
    return this.usersRepository.find(filter, sort === 'asc' ? 1 : -1);
  }

  async findByUsername(username: string, requesterRoles?: Role[]): Promise<UserDocument> {
    const user = await this.usersRepository.findByUsername(username);
    if (!user) throw new NotFoundException(`User "${username}" not found`);
    if (requesterRoles && !requesterRoles.includes(Role.ANOMALY_ADMIN)) {
      const scopedRoles = this.getRolesInAdminScope(requesterRoles);
      if (!user.roles.some((entry) => scopedRoles.includes(entry.role))) {
        throw new NotFoundException(`User "${username}" not found`);
      }
    }
    return user;
  }

  private getRolesInAdminScope(requesterRoles: Role[]): Role[] {
    return requesterRoles
      .filter((role) => isAdminRole(role) && role !== Role.ANOMALY_ADMIN)
      .flatMap((role) => {
        const flow = getFlowFromRole(role);
        return flow ? getRolesForFlow(flow) : [];
      });
  }
}
