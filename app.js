var http = require('http'),
    server = http.createServer(handler),
    io = require('socket.io')(server),
    fs = require('fs'),
    path = require('path'),
    host = '127.0.0.1',
    port = '9000';

var mimes = {
    ".html" : "text/html",
    ".css" : "text/css",
    ".js" : "text/javascript",
    "gif" : "image/gif",
    ".jpg" : "image/jpeg",
    ".png" : "image/png"
};

var default_response = require('./example.json');

server.listen(port, host, function() {
    console.log('Server Running on http://' + host + ':' + port);
});

var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var tone_analyzer = new ToneAnalyzerV3({
    username: 'c27d21d1-5fe7-4df8-8982-7c48402afb4f',
    password: 'rM27eng8EKLq',
    version_date: '2016-05-19'
});

var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var natural_language_understanding = new NaturalLanguageUnderstandingV1({
    'username': 'd2af5244-f852-4eac-90a4-9ce15051f7b3',
    'password': 'ESqWCUfthsSU',
    'version_date': '2017-02-27'
});

function handler(req, res) {
    var filepath = (req.url === '/') ? ('./index.html') : ('.' + req.url);
    var contentType = mimes[path.extname(filepath)];
    //Check to see if the file exists
    fs.exists(filepath, function(file_exists) {
        if(file_exists) {
            res.writeHead(200, {'Content-Type' : contentType});
            var streamFile = fs.createReadStream(filepath).pipe(res);

            streamFile.on('error', function(){
                res.writeHead(500);
                res.end();
            })
        } else {
            res.writeHead(404);
            res.end("Sorry we could not find the file you asked for");
        }
    })
}

io.on('connection', function (socket) {

    socket.emit('default_json',default_response);

    socket.on('analyzetone', function (text_object) {
        // Tone Analyzer
        var params = {
            // Get the text from the JSON file.
            text: text_object.text,
            tones: ['emotion', 'language', 'social']
        };

        tone_analyzer.tone(params, function(error, response) {
                if (error)
                    console.log('error:', error);
                else{
                    console.log(JSON.stringify(response, null, 2));
                    socket.emit('tone_analyze',default_response);
                }
            }
        );
    });

    socket.on('nlp', function (text_object) {
        // Natural Language Understanding
        var parameters = {
            'text': text_object.text,
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
        };

        natural_language_understanding.analyze(parameters, function(err, response) {
            if (err)
                console.log('error:', err);
            else
                socket.emit('nlp', response);
                console.log(JSON.stringify(response, null, 2));
        });
    });
});


