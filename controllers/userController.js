var UserModel = require('../models/userModel.js');
var QuestionsModel = require('../models/questionsModel.js');
var AnswerModel = require('../models/answerModel.js');


/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

    /**
     * userController.list()
     */
    list: function (req, res) {
        UserModel.find(function (err, users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            return res.json(users);
        });
    },

    /**
     * userController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({ _id: id }, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }


            return res.json(user);
        });
    },

    /**
     * userController.create()
     */
    create: function (req, res) {
        var user = new UserModel({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            imgPath: "/images/default.jpg"
        });

        user.save(function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating user',
                    error: err
                });
            }

            return res.redirect('/');;
        });
    },

    /**
     * userController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({ _id: id }, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            user.username = req.body.username ? req.body.username : user.username;
            user.email = req.body.email ? req.body.email : user.email;
            user.password = req.body.password ? req.body.password : user.password;

            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating user.',
                        error: err
                    });
                }

                return res.json(user);
            });
        });
    },

    /**
     * userController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        UserModel.findByIdAndRemove(id, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the user.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    },

    showRegister: function (req, res) {
        res.render('user/register');
    },

    showLogin: function (req, res) {
        res.render('user/login');
    },

    login: function (req, res, next) {

        UserModel.authenticate(req.body.username, req.body.password, function (err, user) {
            if (err || !user) {
                var err = new Error('Wrong username or password');
                err.status = 401;
                return next(err);
            }
            req.session.userId = user._id;
            res.redirect('/users/profile');
        });
    },

    profile: function (req, res, next) {
        UserModel.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    if (user === null) {
                        var err = new Error('Not authorized, go back!');
                        err.status = 400;
                        return next(err);
                    } else {
                        //counting number of questions posted
                        var questionsNum = 0;
                        QuestionsModel.find({ 'postedBy': req.session.userId }).exec(function (err, questions) {
                            if (error) {
                                return next(error);
                            } else {
                                if (questions === null) {
                                    var err = new Error('Not authorized, go back!');
                                    err.status = 400;
                                    return next(err);
                                }
                            }
                            questionsNum = questions.length;
                            //counting  number of answers posted
                            var answersNum = 0;

                            AnswerModel.find({ 'postedBy': req.session.userId }).exec(function (err, answers) {
                                if (error) {
                                    return next(error);
                                } else {
                                    if (answers === null) {
                                        var err = new Error('Not authorized, go back!');
                                        err.status = 400;
                                        return next(err);
                                    }
                                }
                                acceptedNum = 0;
                                //mnumber of accepted answers
                                answers.forEach(function (answer) {
                                    if (answer.accepted) {
                                        acceptedNum += 1;
                                    }
                                })
                                answersNum = answers.length;
                                user.questions = questionsNum;
                                user.answers = answersNum;
                                user.accepted = acceptedNum;
                                return res.render('user/profile', user);
                            });
                        })
                    }
                }
            });
    },

    logout: function (req, res, next) {
        if (req.session) {
            req.session.destroy(function (err) {
                if (err) {
                    return next(err);
                } else {
                    return res.redirect('/');
                }
            });
        }
    },

    profileImage: function (req, res) {
        var id = req.session.userId;
        console.log(id)

        UserModel.findOne({ _id: id }, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }
            console.log(req.file)
            user.imgPath = "/images/" + req.file.filename;

            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating user.',
                        error: err
                    });
                }

                return res.render('user/profile', user);
            });
        });
    },
};
