exports.slugify = function (str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();
  
  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to   = "aaaaeeeeiiiioooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}


/**
 * return true if the two arrays have one common value
 */
exports.haveOneCommonValue = function (array1, array2) {
	
	var a1, a2;
	
	if (array1.length < array2.length) {
		a1 = array1;
		a2 = array2;
	} else {
		a1 = array2;
		a2 = array1;
	}
	
	
	for (var i = 0, l = a1.length; i<l; i++) {
		if (a2.indexOf(a1[i]) !== -1) {
			return true;
		}
	}
	
	return false;
}
