module.exports = function (sequelize, DataTypes) {
  const Peer = sequelize.define('Peer', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true
    },
    state: {
      type: DataTypes.INTEGER
    },
    ip: {
      type: DataTypes.STRING
    },
    port: {
      type: DataTypes.INTEGER
    }
  },
  {
    timestamps: false
  }
  )

  return Peer
}
