"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Voter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Voter.belongsTo(models.Election, {
        foreignKey: "electionID",
      });
    }

    static async add(voterID, password, electionID) {
      const res = await Voter.create({
        voterID: voterID,
        password: password,
        electionID: electionID,
        voted: false,
      });
      return res;
    }
  }
  Voter.init(
    {
      voterID: DataTypes.STRING,
      password: DataTypes.STRING,
      voted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Voter",
    }
  );
  return Voter;
};
