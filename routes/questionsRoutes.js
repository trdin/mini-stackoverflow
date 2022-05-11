var express = require('express');
var router = express.Router();
var questionsController = require('../controllers/questionsController.js');

function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        return next(err);
    }
}


/*
 * GET
 */
router.get('/', questionsController.list);
router.get('/publish', requiresLogin, questionsController.showAdd)
router.get('/myQuestions', requiresLogin, questionsController.myQuestions)
router.get('/search', questionsController.search)
router.get('/hotQuestions', questionsController.hot)




/*
 * GET
 */
router.get('/:id', questionsController.show);

/*
 * POST
 */
router.post('/', requiresLogin, questionsController.create);

/*
 * PUT
 */
router.put('/:id', questionsController.update);
router.put('/accept/:id', requiresLogin, questionsController.acceptCorrect);


/*
 * DELETE
 */
router.delete('/:id', questionsController.remove);

module.exports = router;
