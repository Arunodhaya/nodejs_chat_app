import { Table, Column, Model, HasMany, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { sequelize } from './db-config';

@Table({
    tableName: 'users'
})
export class UserModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    firstName: String;

    @Column
    lastName: String;

    @Column
    email: String;

    @Column
    password: String;

    @Column
    isAdmin: Boolean

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

}

sequelize.addModels([UserModel])
