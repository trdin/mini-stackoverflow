var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var questionsSchema = new Schema({
	'question': {
		type: String,
		required: true
	},
	'description': {
		type: String,
		required: true
	},
	'timeCreated': {
		type: Date,
		required: true
	},
	'postedBy': {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	'tags': Array,
	'correctAnswer': {
		type: Schema.Types.ObjectId,
		ref: 'answer'
	},
	'views': Array,
	'comments': [{
		type: Schema.Types.ObjectId,
		ref: 'comment'
	}],

});

module.exports = mongoose.model('questions', questionsSchema);
