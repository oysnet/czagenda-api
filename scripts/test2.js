function Token(value, next) {
	this.value = value
	if (value == 'or' || value == 'and') {
		if (next == '(' || next == ')' || next.charAt(next.length - 1) == ':') {
			this.precedence = 0
		} else {
			this.precedence = 2
		}
		this.type = 'operator'

	} else if (value == '(') {
		this.type = 'lp'
	} else if (value.charAt(value.length - 1) == ':') {
		this.type = 'operator'
		this.precedence = 1
	} else if (value == ')') {
		this.type = 'rp'
	} else {
		this.type = 'value'
	}
}

var s = 'crit1:           va and l1 or ((crit6:val6 and crit9:val9 and (crit10:val10 or crit11:val11)) and crit7:val7 ooo and crit8: val8)';

var t = []
var tmp = '';
for (var i = 0, l = s.length; i < l; i++) {
	var c = s.charAt(i);
	if (c === ':') {
		t.push(tmp + ':');
		tmp = ''
	} else if (c === ' ' && i > 1 && s.charAt(i - 1) === ' ') {
		continue;
	} else if (c === ' ' && i > 1 && s.charAt(i - 1) !== ':') {
		t.push(tmp);
		tmp = ''
	} else if (c === '(' || c === ')') {
		if (tmp !== '') {
			t.push(tmp);
		}
		tmp = ''
		t.push(c);
	} else {
		tmp += c;
	}
}
if (tmp !== '') {
	t.push(tmp);
}

function isValue(value) {
	if (value == 'or' || value == 'and' || value == '(' || value == ')'
			|| value.charAt(value.length - 1) == ':') {
		return false
	} else {
		return true;
	}
}
var qString = []
for (var i = 0, l = t.length; i < l; i++) {
	if (i > 1 && isValue(t[i - 1]) && isValue(t[i])) {
		qString.push('or')
	}
	qString.push(t[i])
}

var output = []

var ostack = []
console.log(qString);
for (var i = 0; i < qString.length; i++) {
	if (i < qString.length - 2) {
		var next = qString[i + 1]
	} else {
		var next = null;
	}

	var token = new Token(qString[i], next);

	if (token.type == 'operator') {
		while (ostack.length > 0
				&& token.precedence <= ostack[ostack.length - 1].precedence) {
			output.push(ostack.pop());
		}
		ostack.push(token);

	} else if (token.type == 'lp') {
		ostack.push(token);
	}

	else if (token.type == 'rp') {
		var o = ''

		o = ostack.pop()

		while (o.type != 'lp') {

			output.push(o)

			o = ostack.pop()

		}

	} else {

		output.push(token)

	}

}

for (var i = ostack.length - 1; i >= 0; i--) {
	output.push(ostack[i]);
}

var stack = [];
for (var i = 0, l = output.length; i < l; i++) {
	token = output[i];
	if (token.type == 'value') {
		stack.push(token.value);
	} else {
		if (token.value == 'or') {
			if (token.precedence == 2) {
				r = stack.pop() + ' or ' + stack.pop()
			} else {
				var t0 = stack.pop();
				var t1 = stack.pop();
				if (typeof(t1) == 'object' && typeof(t1.or) != 'undefined') {
					t1.or.push(t0);
					r = t1;
				} else {
					r = {
						or : [t0, t1]
					};
				}
			}
		} else if (token.value == 'and') {
			if (token.precedence == 2) {
				r = stack.pop() + ' and ' + stack.pop()
			} else {
				var t0 = stack.pop();
				var t1 = stack.pop();
				if (typeof(t1) == 'object' && typeof(t1.and) != 'undefined') {
					t1.and.push(t0);
					r = t1;
				} else {
					r = {
						and : [t0, t1]
					};
				}
			}
		}

		else {
			r = {}
			r[token.value.substring(0, token.value.length - 1)] = stack.pop();
		}
		stack.push(r)
	}
}

console.log(output)
console.log(JSON.stringify(stack, null, "  "))