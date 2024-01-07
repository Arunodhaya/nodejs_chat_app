
import { Table, Column, Model, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { UserModel } from './UserModel';
import { GroupMessagesModel } from './GroupMessagesModel';
import { sequelize } from './db-config';

@Table({
  tableName: 'liked_messages',
})
export class LikedMessagesModel extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  id: number;

  @ForeignKey(() => UserModel)
  @Column({
    allowNull: false,
  })
  user_id: number;

  @ForeignKey(() => GroupMessagesModel)
  @Column({
    allowNull: false,
  })
  message_id: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  // Associations
  @BelongsTo(() => UserModel)
  user: UserModel;

}

sequelize.addModels([LikedMessagesModel])
