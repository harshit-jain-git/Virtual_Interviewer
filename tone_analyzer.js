var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var tone_analyzer = new ToneAnalyzerV3({
  username: 'c27d21d1-5fe7-4df8-8982-7c48402afb4f',
  password: 'rM27eng8EKLq',
  version_date: '2016-05-19'
});

var params = {
  // Get the text from the JSON file.
  text: require('./tone.json').text,
  tones: ['emotion', 'language', 'social']
};

tone_analyzer.tone(params, function(error, response) {
  if (error)
    console.log('error:', error);
  else
    console.log(JSON.stringify(response, null, 2));
  }
);
