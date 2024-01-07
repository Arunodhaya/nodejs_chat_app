// GroupModel.ts

import { Table, Column, Model, ForeignKey, CreatedAt, UpdatedAt, DeletedAt, DataType, BelongsTo, HasMany } from 'sequelize-typescript';
import { UserModel } from './user_model'; // Update the path accordingly
import { sequelize } from './db-config';
import { GroupMembersModel } from './GroupMembersModel';

@Table({
  tableName: 'groups',
})
export class GroupModel extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  creator_user_id: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @HasMany(() => GroupMembersModel)
  members: GroupMembersModel[];
}

sequelize.addModels([GroupModel])
