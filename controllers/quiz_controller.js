var models = require('../models/models.js');

function CleanSearch(search) {
		search = search.trim();
		search = search.replace(/\s+/,'%');
		search = '%' + search + '%';
		return search;
}

// Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.find(quizId).then(
    function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else { next(new Error('No existe quizId=' + quizId)); }
    }
  ).catch(function(error) { next(error);});
};

// GET /quizes
exports.index = function(req, res) {
	if (req.query.search) {

		models.Quiz.findAll({where: ["pregunta like ?", CleanSearch(req.query.search)]}).then(function(quizes){
			res.render('quizes/index', {quizes: quizes});
		}).catch(function(error){
			next(error);
		});
	}
	else
	{
		models.Quiz.findAll().then(function(quizes){
			res.render('quizes/index', {quizes: quizes});
		}).catch(function(error){
			next(error);
		});
	}
};

// GET /quizes/:quizId(\\d+)
exports.show = function(req, res) {
	res.render('quizes/show', {quiz: req.quiz});
};

//GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
    if (req.query.respuesta === req.quiz.respuesta) {
      resultado = 'Correcto';
    }
    res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado});
};

// Get /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build( // crea objeto quiz
		{pregunta: "Pregunta", respuesta: "respuesta"}
	);
	res.render('quizes/new', {quiz: quiz});
};

// Get /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build( req.body.quiz );
	// guarda en BD los campos pregunta y respuesta de quiz
	quiz.save({fields: ["pregunta", "respuesta"]}).then(function(){
		res.redirect('/quizes');
	}) // Redireccion HTTP (URL relativo) lista de preguntas
};
