module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define('User', {
 /*   id: {
      type: DataTypes.INTEGER
    } */
    firstName: {
      type: DataTypes.STRING
    },
    lastName: {
      type: DataTypes.STRING
    }
  }
  )

  return User
}
