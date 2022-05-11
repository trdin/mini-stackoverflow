var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var commentSchema = new Schema({
	'content' : String,
	'timeCreated' : Date,
	'postedBy' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'user'
	},
	'answer' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'answer'
	},
	'question' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'questions'
	}
});

module.exports = mongoose.model('comment', commentSchema);
