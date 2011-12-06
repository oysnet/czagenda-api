var re = new RegExp(/[a-z0-9\.]+:/gi);
var reBool = /[)( ]*or[)( ]*$/

var qFields = [];
var qValues = []

// a or b and c == (a or b) and c
// 				== a or (b and c)
var qString = ['crit1:h', 'and','(','crit6:val6','crit7:val7','crit8:val8', ')']
var qString = ['crit1:val1', 'or','(','crit6:val6','and','crit7:val7','and','crit8:val8', ')']
var qString = ['crit1:','va','and','l1', 'or','(','crit6:','val6','and','crit7:','val7','and','crit8:','val8', ')']

var output =[]
var ostack=[]

for (var i= 0;i<qString.length;i++){
	var token = qString[i];
	if(token == 'or' || token == 'and') {
		ostack.push(token);
	}else if (token == '(') {
		ostack.push(token);
	} else if(token.charAt(token.length-1) == ':') {
		ostack.push(token);
	}
	else if (token == ')') {
		var o = ''
		o = ostack.pop()
		while(o != '(') {
			output.push(o)
			o = ostack.pop()
		}
	} else {
		output.push(token)	
	}
}
for(var i=ostack.length-1;i>=0;i--) {
	output.push(ostack[i]);
}

console.log(output)

var o = { or: [{and : [{crit6:val6, crit7:val7}]}, {crit1:val1}]}

qString.match(re).forEach(function(v) {
	qFields.push(v.substr(0, v.length - 1))
});
var qValues = qString.split(re);

// first element is fulltext query
if(qString.search(re) !== 0) {
	//q.fulltext = qValues[0].trim();
	qValues = qValues.splice(1);
} else {
	qValues = qValues.splice(1);
}

var query = [];
var currentGroup = null;

for(var i = 0, l = qFields.length; i < l; i++) {

	if(currentGroup === null) {
		currentGroup = {};
	}

	var value = qValues[i].trim();
	
	var bool = null;
	if(( bool = value.match(reBool)) !== null) {
		bool = bool[0];
		bool = bool.toLowerCase();
		value = value.replace(bool, '');

		if(bool.indexOf(')') !== -1) {
			// stop group
		}

		if(bool.indexOf('(') !== -1) {
			// start group
		}

		var operator = 'and';
		if(bool.indexOf('or') !== -1) {
			operator = 'or';
		}
		
		
	} else {
		currentGroup[qFields[i]] = value;
	}

}

console.log('qFields');
console.log(qFields);
console.log('qValues');
console.log(qValues);
