
var fs = require('fs');
var now = require('performance-now');

var totalLines = 0;
var lines = [];
var names = [];
var firstNames = [];
var dupeNames = {};
var dateDonationCount = [];
var dateDonations = {};
var male_total = 0;
var female_total = 0;
var freq = {}
var freq_total = 0

fs.readFile('charfreq.csv', 'utf8', (err, contents) => {
  console.time('line count');
  let t0 = now();
  if (contents !== undefined) {
    totalLines = contents.split('\n').length - 1;
  }
  console.log(totalLines);
  let t1 = now();
  console.timeEnd('line count');
  console.log(
    `Performance now line count timing: ` + (t1 - t0).toFixed(3) + `ms`,
  );

  console.time('names');
  t0 = now();
  if (contents !== undefined) {
    lines = contents.split('\n');
    lines.forEach(line => {
      var name = line.split(',');
	  male_total += name[1];
	  female_total += name[2];
      freq[name[0]] = [name[2], name[1]];
    });
	freq_total = male_total + female_total;
	for(let namestr of freq){
            female = freq[namestr][0];
            male = freq[namestr][1];
            freq[namestr] = [1. * female / female_total,
                               1. * male / male_total]
	}
  }

});

const guess = (name) =>  {
	var firstname = name;
	for(let namestr of freq){
       var pf = prob_for_gender(firstname, 0);
       var pm = prob_for_gender(firstname, 1);
		if pm > pf:
            return {'male': pm / (pm + pf)};
        elif pm < pf:
            return {'female': pf / (pm + pf)};
        else:
			return {'unknown':0};
	}
}

function prob_for_gender(name,gender) {
	  var p =  female_total / freq_total \
            if gender == 0 \
            else male_total / freq_total
        for(let namestr of freq){
            p = p * freq.namestr[gender]
		}

        return p
}

export default {
  guess,
};
			
