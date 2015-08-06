var path = require('path');

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite   DATABASE_STORAGE = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name   = (url[6] || null);
var user      = (url[2] || null);
var pwd       = (url[3] || null);
var protocol  = (url[1] || null);
var dialect   = (url[1] || null);
var port      = (url[5] || null);
var host      = (url[4] || null);
var storage = process.env.DATABASE_STORAGE;

// Cargamos el Modelo ORM
var Sequelize = require('sequelize');

//Usar BBDD SQLite o Postgres
var sequelize = new Sequelize(DB_name, user, pwd,
  { dialect:  protocol,
    protocol: protocol,
    port:     port,
    host:     host,
    storage:  storage, // solo SQLite (.env)
    omitNull: true     // solo postgres
    }
);

//Importar la definición de la tabla Quiz
var quiz_path = path.join(__dirname, 'quiz');
var Quiz = sequelize.import(quiz_path);
// Importar definición de la tabla Categoria
var Category = sequelize.import(path.join(__dirname, 'category'));
// Importar definición de la tabla Comment
var comment_path = path.join(__dirname, 'comment');
var Comment = sequelize.import(comment_path);

Quiz.belongsTo(Category);
Category.hasMany(Quiz);
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

exports.Quiz = Quiz; //exportar definición de tabla Quiz
exports.Category = Category; // Exportamos la definición de la tabla CATEGORIAS
exports.Comment = Comment; // Exportamos la definición de la tabla Commentarios

//sequelize.sync() inicializa tabla de pregunta en DB
sequelize.sync().then(function() {
  //then(..) ejecuta el manejador una vez creada la tabla
  // Creamos las categorías...
  Category.count().then(function(count){
		if(count === 0) { //la tabla se inicializa solo si está vacía
			Category.create({nombre: 'Humanidades'});
			Category.create({nombre: 'Ocio'});
			Category.create({nombre: 'Tecnología'});
			Category.create({nombre: 'Ciencias'});
			Category.create({nombre: 'Otros'})
      .then(function(){console.log('Base de datos CATEGORIAS inicializada')});
		};
	});
 // Creamos las preguntas...
  Quiz.count().then(function (count) {
    if (count === 0) { //la tabla se inicializa solo si está vacía
      Quiz.create({ pregunta: 'Capital de Italia',
                    respuesta: 'Roma',
                    CategoryId: 1
                 });
      Quiz.create({ pregunta: 'Capital de portugal',
                    respuesta: 'Lisboa',
                    CategoryId: 1
                 })
      .then(function(){console.log('Base de datos Preguntas inicializada')});
    };
  });
});
