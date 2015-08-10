// Definición del modelo de comment con validación

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Comment',
    { texto: {
      type: DataTypes.STRING,
      validate: { notEmpty: {msg: "-> Falta Comentario"}}
    },
    publicado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }},
    { classMethods: {
      countUnpublishedComments: function() {
      return this.count({where: ["publicado = ?", false]});
    },
    countPublishedComments: function(){
      return this.count({where: ["publicado = ?", true]});
    }
    }}
  );
};
