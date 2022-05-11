var AnswerModel = require('../models/answerModel.js');
var CommentModel = require('../models/commentModel.js');


/**
 * answerController.js
 *
 * @description :: Server-side logic for managing answers.
 */
module.exports = {

    /**
     * answerController.list()
     */
    list: function (req, res) {
        AnswerModel.find(function (err, answers) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting answer.',
                    error: err
                });
            }

            return res.json(answers);
        });
    },

    /**
     * answerController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        AnswerModel.findOne({ _id: id }, function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting answer.',
                    error: err
                });
            }

            if (!answer) {
                return res.status(404).json({
                    message: 'No such answer'
                });
            }

            return res.json(answer);
        });
    },

    /**
     * answerController.create()
     */
    create: function (req, res) {
        var answer = new AnswerModel({
            content: req.body.content,
            timeCreated: Date.now(),
            postedBy: req.session.userId,
            question: req.body.question,
            upvotes: [],
            downvotes: [],
            comments: [],
        });

        answer.save(function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating answer',
                    error: err
                });
            }

            return res.status(201).json(answer);
        });
    },

    /**
     * answerController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        AnswerModel.findOne({ _id: id }, function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting answer',
                    error: err
                });
            }

            if (!answer) {
                return res.status(404).json({
                    message: 'No such answer'
                });
            }

            answer.content = req.body.content ? req.body.content : answer.content;
            answer.timeCreated = req.body.timeCreated ? req.body.timeCreated : answer.timeCreated;
            answer.postedBy = req.body.postedBy ? req.body.postedBy : answer.postedBy;
            answer.question = req.body.question ? req.body.question : answer.question;

            answer.save(function (err, answer) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating answer.',
                        error: err
                    });
                }

                return res.json(answer);
            });
        });
    },

    /**
     * answerController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        AnswerModel.findOne({ _id: id }).populate('postedBy').exec(function (err, answers) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting questions',
                    error: err
                });
            }
            if (req.session.userId != answers.postedBy.id) {
                return res.status(500).json({
                    message: 'Not signed in',
                    error: err
                });
            }
        });

        AnswerModel.findByIdAndRemove(id, function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the answer.',
                    error: err
                });
            }
            CommentModel.remove({ answer: answer.id }).exec(function (err, answer) {
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
    vote: function (req, res) {
        var id = req.params.id;
        var action = req.body.action

        AnswerModel.findOne({ _id: id }, function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting answer',
                    error: err
                });
            }

            if (!answer) {
                return res.status(404).json({
                    message: 'No such answer'
                });
            }
            if (action != undefined) {
                if (answer.upvotes.indexOf(req.session.userId) != -1)
                    answer.upvotes.splice(answer.upvotes.indexOf(req.session.userId), 1);
                if (answer.downvotes.indexOf(req.session.userId) != -1)
                    answer.downvotes.splice(answer.downvotes.indexOf(req.session.userId), 1);
            }



            if (action == "upvote") {
                answer.upvotes.push(req.session.userId)
            }
            if (action == "downvote") {
                answer.downvotes.push(req.session.userId)
            }

            answer.save(function (err, answer) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating answer.',
                        error: err
                    });
                }
                answer.vote = action;
                return res.json(answer);
            });
        });
    }

};
