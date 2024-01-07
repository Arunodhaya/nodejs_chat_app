'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [{
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@riktam.com',
      password: '$2b$10$6gbToSC9rplY2t.SjOpQUe13j2v1ZM9vZnO5BTn3c3drVHuh4LLMO', 
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@riktam.com' }, {});
  }
};
