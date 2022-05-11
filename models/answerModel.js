var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var answerSchema = new Schema({
	'content': {
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
	'question': {
		type: Schema.Types.ObjectId,
		ref: 'questions'
	},
	'upvotes': Array,
	'downvotes': Array,
	'accepted': Boolean,
	'comments': [{
		type: Schema.Types.ObjectId,
		ref: 'comment'
	}],

});

module.exports = mongoose.model('answer', answerSchema);
