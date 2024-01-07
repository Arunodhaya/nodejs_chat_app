import { Table, Column, Model, ForeignKey, BelongsTo, CreatedAt, UpdatedAt, HasMany } from 'sequelize-typescript';
import { GroupModel } from './GroupModel';
import { UserModel } from './UserModel';
import { sequelize } from './db-config';
import { LikedMessagesModel } from './LikedMessagesModel';

@Table({
  tableName: 'group_messages',
})
export class GroupMessagesModel extends Model {
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

  @Column({
    type: 'TEXT',
    allowNull: false,
  })
  message: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  // Associations
  @BelongsTo(() => GroupModel)
  group: GroupModel;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @HasMany(() => LikedMessagesModel,'message_id')
  likes:LikedMessagesModel
}

sequelize.addModels([GroupMessagesModel])
