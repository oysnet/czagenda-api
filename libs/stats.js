var Stats = function () {
	
	for (var i = 0, l = 10; i<l;i++) {
		this.datas.push(0);		
	}

	
}

Stats.prototype.datas = [];
Stats.prototype.last_ts = [];

Stats.prototype.add = function () {
	var current_ts = parseInt((new Date()).getTime() / 1000);
	var pos =  current_ts % 10;
	
	if (current_ts !== this.last_ts) {
		this.last_ts = current_ts;
		this.datas[pos] = 1;
	} else {
		this.datas[pos]++;
	}
	
}


Stats.prototype.read = function () {
	
	var ts = parseInt((new Date()).getTime() / 1000) -1;
	
	var sum = 0;
	var i = 10;
	while (ts - i < this.last_ts && i >=0) {
		sum+=this.datas[(ts-i)%10];
		i--;
	}
	
	return sum / 9;	
}

exports.readStats = new Stats();
exports.writeStats = new Stats();
exports.updateStats = new Stats();
exports.deleteStats = new Stats();