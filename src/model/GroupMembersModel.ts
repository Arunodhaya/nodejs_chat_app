// GroupMembersModel.ts

import { Table, Column, Model, ForeignKey, CreatedAt, UpdatedAt, BelongsTo } from 'sequelize-typescript';
import { GroupModel } from './GroupModel';
import { UserModel } from './UserModel';
import { sequelize } from './db-config';

@Table({
  tableName: 'group_members',
})
export class GroupMembersModel extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  id: number;

  @ForeignKey(() => GroupModel)
  @Column({
    allowNull: false,
  })
  group_id: number;

  @ForeignKey(() => UserModel)
  @Column({
    allowNull: false,
  })
  user_id: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => UserModel, 'user_id')
  user: UserModel;

  static async getMember(group_id: number, user_id: number): Promise<GroupMembersModel> {
    const result = await this.findOne({
      where: { group_id,user_id },
    });
    return result;
  }
}

sequelize.addModels([GroupMembersModel])
