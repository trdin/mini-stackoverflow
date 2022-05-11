var CommentModel = require('../models/commentModel.js');
var QuestionsModel = require('../models/questionsModel.js');
var AnswerModel = require('../models/answerModel.js');

/**
 * commentController.js
 *
 * @description :: Server-side logic for managing comments.
 */
module.exports = {

    /**
     * commentController.list()
     */
    list: function (req, res) {
        CommentModel.find(function (err, comments) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting comment.',
                    error: err
                });
            }

            return res.json(comments);
        });
    },

    /**
     * commentController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        CommentModel.findOne({ _id: id }, function (err, comment) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting comment.',
                    error: err
                });
            }

            if (!comment) {
                return res.status(404).json({
                    message: 'No such comment'
                });
            }

            return res.json(comment);
        });
    },

    /**
     * commentController.create()
     */
    create: function (req, res) {
        var comment = new CommentModel({
            content: req.body.content,
            timeCreated: Date.now(),
            postedBy: req.session.userId,
            answer: req.body.answer,
            question: req.body.question
        });


        comment.save(function (err, comment) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating comment',
                    error: err
                });
            }

            if (comment.answer != undefined) {
                AnswerModel.findOne({ _id: comment.answer }, function (err, answer) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when getting answer',
                            error: err
                        });
                    }

                    answer.comments.push(comment.id);

                    answer.save(function (err, answer) {
                        if (err) {
                            return res.status(500).json({
                                message: 'Error when updating answer.',
                                error: err
                            });
                        }

                        return res.status(201).json(comment);
                    });
                });
            } else {
                QuestionsModel.findOne({ _id: comment.question }, function (err, question) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when getting answer',
                            error: err
                        });
                    }

                    question.comments.push(comment.id);

                    question.save(function (err, question) {
                        if (err) {
                            return res.status(500).json({
                                message: 'Error when updating answer.',
                                error: err
                            });
                        }
                        return res.status(201).json(comment);
                    });
                });
            }


        });
    },

    /**
     * commentController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        CommentModel.findOne({ _id: id }, function (err, comment) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting comment',
                    error: err
                });
            }

            if (!comment) {
                return res.status(404).json({
                    message: 'No such comment'
                });
            }

            comment.content = req.body.content ? req.body.content : comment.content;
            comment.timeCreated = req.body.timeCreated ? req.body.timeCreated : comment.timeCreated;
            comment.postedBy = req.body.postedBy ? req.body.postedBy : comment.postedBy;
            comment.answer = req.body.answer ? req.body.answer : comment.answer;
            comment.question = req.body.question ? req.body.question : comment.question;

            comment.save(function (err, comment) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating comment.',
                        error: err
                    });
                }

                return res.json(comment);
            });
        });
    },

    /**
     * commentController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        CommentModel.findByIdAndRemove(id, function (err, comment) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the comment.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
