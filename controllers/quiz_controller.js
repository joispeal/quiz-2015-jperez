var models = require('../models/models.js');

function CleanSearch(search) {
		search = search.trim();
		search = search.replace(/\s+/,'%');
		search = '%' + search + '%';
		return search;
}

// Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.findById(quizId,
		{include: [models.Category, models.Comment]})
	  .then(
    function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else { next(new Error('No existe quizId=' + quizId)); }
    }
  ).catch(function(error) { next(error);});
};

// GET /quizes
exports.index = function(req, res, next) {
 if (req.query.search) {

		models.Quiz.findAll({where: ["pregunta like ?", CleanSearch(req.query.search)], include: [models.Category]}).then(function(quizes){
			res.render('quizes/index', {quizes: quizes, errors: []});
		}).catch(function(error){
			next(error);
		});
	} else {
		models.Quiz.findAll({include: [models.Category]}).then(function(quizes){
			res.render('quizes/index', {quizes: quizes, errors: []});
		}).catch(function(error){
			next(error);
		});
	}
};

// GET /quizes/:quizId(\\d+)
exports.show = function(req, res) {
	res.render('quizes/show', {quiz: req.quiz, errors: []});
};

//GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
    if (req.query.respuesta === req.quiz.respuesta) {
      resultado = 'Correcto';
    }
    res.render('quizes/answer',
		{ quiz: req.quiz,
			respuesta: resultado,
			errors: []
		});
};

// Get /quizes/new
exports.new = function(req, res, next) {
	var quiz = models.Quiz.build( // crea objeto quiz
		{pregunta: "Pregunta", respuesta: "Respuesta"}
	);

	models.Category.findAll().then(function(categorias) {
		res.render('quizes/new', {quiz: quiz, categorias: categorias, action: '/quizes/create', header: 'Nueva Pregunta', errors: []});
	}).catch(function(error) {
		next(error);
	});
};

// Post /quizes/create
exports.create = function(req, res, next) {
	var quiz = models.Quiz.build( req.body.quiz );
	quiz.validate().then(function(err) {
			if (err) {
				models.Category.findAll().then(function(categorias){
					res.render('quizes/new', {quiz: quiz, categorias: categorias, action: '/quizes/create', header: 'Nueva Pregunta', errors: err.errors});
				}).catch(function(error){
					next(error);
				});
			} else {
				// guarda en BD los campos pregunta y respuesta de quiz
				quiz.save({fields: ["pregunta", "respuesta", "CategoryId"]}).then( function(){
					res.redirect('/quizes');
				});
			} // res.redirect: Redireccion HTTP (URL relativo) lista de preguntas
    }
	);
};

//GET /quizes/ :id/edit
exports.edit = function(req, res, next) {
	var quiz = req.quiz; // Autoload de instancia de quiz
	models.Category.findAll().then(function(categorias){
		res.render('quizes/edit', {quiz: quiz, categorias: categorias, action: '/quizes/' + quiz.id + '?_method=put', header: 'Edite la pregunta', errors: []});
	}).catch(function(error){
			next(error);
	});
};

// PUT /quizes/ :id
exports.update = function(req, res) {
	req.quiz.pregunta  = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;

	req.quiz
	.validate()
	.then(
		function(err) {
			if (err) {
				res.render('quizes/edit', {quiz: req.quiz, errors: []});
			} else {
				req.quiz // save: guarda campos pregunta y respuesta en DB
				.save( {fields: ["pregunta", "respuesta", "CategoryId"]})
				.then( function() { res.redirect('/quizes');});
			}  // Redireccion HTTP a lista de preguntas (URL relativo)
		}
	);
};

// DELETE /quizes/ :Id
exports.destroy = function(req, res, next) {
	req.quiz.destroy().then( function() {
		res.redirect('/quizes');
	}).catch(function(error){next(error)});
};
