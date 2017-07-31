var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var natural_language_understanding = new NaturalLanguageUnderstandingV1({
  'username': '8f1e3629-0880-4d2c-81ae-789cd83bb80c',
  'password': 'QvDiZqvg6JxM',
  'version_date': '2017-02-27'
});

var parameters = {
  'text': 'hi my name is sankalp. i am 19 years old. i love physics. my main interest is java data structures',
  'features': {
    'entities': {
      'emotion': true,
      'sentiment': true,
      'limit': 2
    },
    'keywords': {
      'emotion': true,
      'sentiment': true,
      'limit': 2
    },
    'concepts': {
      'limit': 3
    }
  }
}

natural_language_understanding.analyze(parameters, function(err, response) {
  if (err)
    console.log('error:', err);
  else
    console.log(JSON.stringify(response, null, 2));
});