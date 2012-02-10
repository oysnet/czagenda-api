function Token(value, next) {
	this.value = value
	if (value == 'or' || value == 'and') {
		if (next == '(' || next == ')'
				|| (next !== null && next.charAt(next.length - 1) == ':')) {
			this.isInternal = false;
			if (value == 'or') {
				this.precedence = 0
			} else {
				this.precedence = 1
			}
		} else {
			this.isInternal = true;
			if (value == 'or') {
				this.precedence = 20
			} else {
				this.precedence = 21
			}
		}
		this.type = 'operator'

	} else if (value == '(') {
		this.type = 'lp'
	} else if (value.charAt(value.length - 1) == ':') {
		this.type = 'operator'
		this.precedence = 10
	} else if (value == ')') {
		this.type = 'rp'
	} else {
		this.type = 'value'
	}
}

function isValue(value) {
	if (value == 'or' || value == 'and' || value == '(' || value == ')'
			|| value.charAt(value.length - 1) == ':') {
		return false
	} else {
		return true;
	}
}

function isKey(value) {

	return value.charAt(value.length - 1) === ':'

}

function isOpenSquareBracket(value) {
	return value === '['
}

function isCloseSquareBracket(value) {
	return value === ']'
}

function isOpenParenthesis(value) {
	return value === '('
}

function isCloseParenthesis(value) {
	return value === ')'
}

function isDoubleQuote(value) {
	return value === '"'
}

function parseSearchString(s) {

	// split searchString
	var t = []
	var inSquareBrackets = false;
	var inDoubleQuote = false;
	var tmp = '';
	for (var i = 0, l = s.length; i < l; i++) {
		var c = s.charAt(i);

		if (isDoubleQuote(c)) {

			if (inDoubleQuote === false) {

				if (tmp !== '') {

					if (t.length === 0 && isValue(tmp)) {
						t.push('fulltext:');
					}
					t.push(tmp);
				}
				inDoubleQuote = true;
				tmp = '';
			} else {
				
				if (t.length === 0 && isValue(tmp)) {
						t.push('fulltext:');
					}
				
				t.push('"' + tmp + '"');
				tmp = '';
				inDoubleQuote = false;
			}
		} else if (isOpenSquareBracket(c)) {
			if (tmp !== '') {

				if (t.length === 0 && isValue(tmp)) {
					t.push('fulltext:');
				}
				t.push(tmp);
			}
			inSquareBrackets = true;
			tmp = '';
		} else if (isCloseSquareBracket(c)) {
			t.push('[' + tmp + ']');
			tmp = '';
			inSquareBrackets = false;
		} else if (inSquareBrackets === true || inDoubleQuote === true) {
			tmp += c;
		} else if (c === ':') {
			t.push(tmp + ':');
			tmp = ''
		} else if (c === ' ' && i > 1 && s.charAt(i - 1) === ' ') {
			continue;
		} else if (c === ' ' && i > 1 && s.charAt(i - 1) !== ':') {

			if (tmp !== '') {

				if (t.length === 0 && isValue(tmp)) {
					t.push('fulltext:');
				}

				t.push(tmp);
			}

			tmp = ''
		} else if (isOpenParenthesis(c) || isCloseParenthesis(c)) {
			if (tmp !== '') {

				if (t.length === 0 && isValue(tmp)) {
					t.push('fulltext:');
				}

				t.push(tmp);
			}
			tmp = ''
			t.push(c);
		} else {
			tmp += c;
		}
	}
	if (tmp !== '') {

		if (t.length === 0 && isValue(tmp)) {
			t.push('fulltext:');
		}

		t.push(tmp);
	}

	var qString = []
	for (var i = 0, l = t.length; i < l; i++) {
		if (i > 1 && isValue(t[i - 1]) && isValue(t[i])) {
			qString.push('or')
		}
		if (i > 1 && (isCloseParenthesis(t[i - 1]) || isValue(t[i - 1]))
				&& !isValue(t[i]) && t[i] !== 'and' && t[i] !== 'or'
				&& (isKey(t[i]) || isOpenParenthesis(t[i]))) {
			qString.push('and')
		}
		qString.push(t[i])
	}
	// generate tokens
	var output = []

	var ostack = []
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
	
	
	// apply shunting yard
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
				if (token.isInternal) {
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
				if (token.isInternal) {
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
				r[token.value.substring(0, token.value.length - 1)] = stack
						.pop();
			}
			stack.push(r)
		}
	}

	if (stack.length > 1) {
		console.log(stack)
		throw new Error("shuntingYard has a stack length greater than 1")
	}

	return stack.length === 1 ? stack[0] : {};
}

exports.parseSearchString = parseSearchString;

/*
 var s = 'toto titi tata and crit1:va2  l1 or ((crit6:val6 and crit9:val9 and (crit10:val10 or crit11:val11)) and crit7:val7 ooo and crit8: val8)';
 //var s = '(crit1:val1) (crit1:val1)';
 console.log(JSON.stringify(parseSearchString(s), null, 2));
 */