// Definición del modelo de CATEGORIAS
module.exports = function(sequelize, DataTypes)
{
	return sequelize.define('Category', {nombre: {type: DataTypes.STRING,
												  validate: {notEmpty: {msg: '¡Falta Nombre Categoria.!'}}}});
};
