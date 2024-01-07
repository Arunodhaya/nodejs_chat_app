'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
 queryInterface.createTable('users', { id: Sequelize.INTEGER });
 await queryInterface.createTable('group_members', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER,
  },
  group_id: {
    allowNull: false,
    type: Sequelize.INTEGER,
    references: {
      model: 'groups',
      key: 'id',
    },
  },
  user_id: {
    allowNull: false,
    type: Sequelize.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
  deletedAt:{
    type: Sequelize.DATE,
  }
});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('group_members');
  }
};
