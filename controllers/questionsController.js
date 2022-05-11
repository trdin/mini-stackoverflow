const { render } = require('express/lib/response');
var QuestionsModel = require('../models/questionsModel.js');
var answerModel = require('../models/answerModel.js');
var CommentModel = require('../models/commentModel.js');


var moment = require('moment');


/**
 * questionsController.js
 *
 * @description :: Server-side logic for managing questionss.
 */
module.exports = {

    /**
     * questionsController.list()
     */
    list: function (req, res) {
        QuestionsModel.find()
            .populate('postedBy')
            .sort({ timeCreated: -1 }).exec(function (err, questions) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting questions.',
                        error: err
                    });
                }
                var data = [];
                data.questions = questions;
                return res.render('questions/list', data);
            });
    },

    /**
     * questionsController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        QuestionsModel.findOne({ _id: id }).populate('postedBy').populate({
            path: 'comments',
            populate: {
                path: 'postedBy',
                model: 'user'
            },
            options: { sort: { 'timeCreated': 'descending' } }
        })
            .exec(function (err, questions) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting questions.',
                        error: err
                    });
                }

                if (!questions) {
                    return res.status(404).json({
                        message: 'No such questions'
                    });
                }
                questions.views.push(Date.now());

                for (var i = questions.views.length - 1; i >= 0; i--) {
                    if (questions.views[i] < new Date(Date.now() - 5000 * 60)) {
                        questions.views.splice(i, 1);
                    }
                }
                questions.save(function (err, questions) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when updating questions.',
                            error: err
                        });
                    }
                });

                answerModel.find({ question: questions.id }).populate('postedBy').populate({
                    path: 'comments',
                    populate: {
                        path: 'postedBy',
                        model: 'user'
                    },
                    options: { sort: { 'timeCreated': 'descending' } }
                })
                    .sort({ timeCreated: -1 }).exec(function (err, answers) {
                        if (err) {
                            return res.status(500).json({
                                message: 'Error when getting answer.',
                                error: err
                            });
                        }
                        var admin = false;
                        if (req.session.userId == (questions.postedBy && questions.postedBy._id)) {
                            questions.edit = true;
                            admin = true;
                        }
                        var indexOfCorrectAnswer = null;
                        answers.forEach(function (answer, i) {
                            if (answer.id == questions.correctAnswer) {
                                questions.correctAnswer = answer
                                indexOfCorrectAnswer = i;

                            }

                            if (req.session.userId == (answer.postedBy && answer.postedBy._id)) {
                                answer.edit = true;
                            }
                            if (admin)
                                answer.admin = true;

                            answer.upNum = answer.upvotes.length;
                            answer.downNum = answer.downvotes.length;
                        })
                        if (indexOfCorrectAnswer != null) {
                            answers.splice(indexOfCorrectAnswer, 1);
                        }
                        questions.answers = answers;
                        return res.render('questions/question', questions);
                    })
                return
            });
    },

    /**
     * questionsController.create()
     */
    create: function (req, res) {
        var questions = new QuestionsModel({
            question: req.body.question,
            description: req.body.description,
            timeCreated: Date.now(),
            postedBy: req.session.userId,
            tags: req.body.tags,
            correctAnswer: req.body.correctAnswer,
            views: [],
            comments: []
        });

        questions.save(function (err, questions) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating questions',
                    error: err
                });
            }

            return res.redirect('/questions');
        });
    },

    /**
     * questionsController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        QuestionsModel.findOne({ _id: id }, function (err, questions) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting questions',
                    error: err
                });
            }

            if (!questions) {
                return res.status(404).json({
                    message: 'No such questions'
                });
            }

            questions.question = req.body.question ? req.body.question : questions.question;
            questions.description = req.body.description ? req.body.description : questions.description;
            questions.timeCreated = req.body.timeCreated ? req.body.timeCreated : questions.timeCreated;
            questions.postedBy = req.body.postedBy ? req.body.postedBy : questions.postedBy;
            questions.tags = req.body.tags ? req.body.tags : questions.tags;

            questions.save(function (err, questions) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating questions.',
                        error: err
                    });
                }

                return res.json(questions);
            });
        });
    },

    /**
     * questionsController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        QuestionsModel.findOne({ _id: id }).populate('postedBy').exec(function (err, questions) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting questions',
                    error: err
                });
            }
            if (req.session.userId != questions.postedBy.id) {
                return res.status(500).json({
                    message: 'Not allowed',
                    error: err
                });
            }
        });

        QuestionsModel.findByIdAndRemove(id, function (err, questions) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the questions.',
                    error: err
                });
            }
            answerModel.remove({ question: id }).exec(function (err, answer) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when deleting the Answers.',
                        error: err
                    });
                }



            })
            CommentModel.remove({ question: id }).exec(function (err, answer) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when deleting the Answers.',
                        error: err
                    });
                }
            })

            return res.status(204).json();
        });
    },

    showAdd: function (req, res) {
        res.render('questions/publish')
    },

    myQuestions: function (req, res) {
        QuestionsModel.find({ 'postedBy': req.session.userId }).populate('postedBy')
            .sort({ timeCreated: -1 }).exec(function (err, questions) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting questions.',
                        error: err
                    });
                }
                var data = [];
                data.questions = questions;
                return res.render('questions/myquestions', data);
            });
    },

    acceptCorrect: function (req, res) {
        var id = req.params.id;

        QuestionsModel.findOne({ _id: id }, function (err, questions) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting questions',
                    error: err
                });
            }

            if (!questions) {
                return res.status(404).json({
                    message: 'No such questions'
                });
            }

            if (req.session.userId != questions.postedBy) {
                return res.status(500).json({
                    message: 'Not allowed',
                    error: err
                });
            }
            questions.correctAnswer = req.body.correctAnswer ? req.body.correctAnswer : questions.correctAnswer;

            answerModel.findById(questions.correctAnswer).exec(function (err, answer) {
                if (err && !answer) {
                    return res.status(500).json({
                        message: 'Error when getting questions',
                        error: err
                    });
                }
                answer.accepted = true;
                answer.save(function (err, answer) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when updating answer.',
                            error: err
                        });
                    }
                });
            })

            questions.save(function (err, questions) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating questions.',
                        error: err
                    });
                }

                return res.status(204).json();
            });
        });
    },

    search: function (req, res) {
        var tag = req.query.search;

        QuestionsModel.find({ tags: { $regex: tag } }).populate('postedBy')
            .sort({ timeCreated: -1 }).exec(function (err, questions) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting questions.',
                        error: err
                    });
                }
                var data = [];
                data.questions = questions;
                data.searchParams = tag;
                return res.render('questions/list', data);
            });
    },

    hot: function (req, res) {
        QuestionsModel.find()
            .populate('postedBy')
            .sort({ timeCreated: -1 }).exec(function (err, questions) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting questions.',
                        error: err
                    });
                }

                questions.forEach(question => {
                    for (var i = question.views.length - 1; i >= 0; i--) {
                        if (question.views[i] < new Date(Date.now() - 5000 * 60)) {
                            question.views.splice(i, 1);
                        }
                    }
                    question.hotViews = question.views.length;
                });

                for (var i = questions.length - 1; i >= 0; i--) {
                    if (questions[i].views.length == 0) {
                        questions.splice(i, 1)
                    }
                }

                questions.sort(function (first, second) {
                    if (first.views.length > second.views.length)
                        return -1
                    if (first.views.length < second.views.length)
                        return 1
                    return 0
                })
                var data = [];
                data.questions = questions;
                return res.render('questions/hotQuestions', data);

            });
    },

};
