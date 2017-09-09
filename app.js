var http = require('http'),
    server = http.createServer(handler),
    io = require('socket.io')(server),
    fs = require('fs'),
    path = require('path'),
    host = '127.0.0.1',
    port = '9000',
    recognizer,
    SDK;

var requirejs = require('requirejs');
var key = '84f6f3d93f0e47839ff0fb6e984968ab';

var mimes = {
    ".html" : "text/html",
    ".css" : "text/css",
    ".js" : "text/javascript",
    "gif" : "image/gif",
    ".jpg" : "image/jpeg",
    ".png" : "image/png"
};

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

// Speech to Text ..

function Initialize(onComplete) {
            require('./node_modules/microsoft-speech-browser-sdk/Speech.Browser.Sdk', function(SDK) {
                onComplete(SDK);
            });
        }

// require(["Speech.Browser.Sdk"], function(SDK) {
//     // Now start using the SDK
// });
// Setup the recongizer
function RecognizerSetup(SDK, recognitionMode, language, format, subscriptionKey) {
    var recognizerConfig = new SDK.RecognizerConfig(new SDK.SpeechConfig(new SDK.Context(new SDK.OS(navigator.userAgent, "Browser", null), new SDK.Device("SpeechSample", "SpeechSample", "1.0.00000"))), recognitionMode, // SDK.RecognitionMode.Interactive  (Options - Interactive/Conversation/Dictation)
    language, // Supported laguages are specific to each recognition mode. Refer to docs.
    format); // SDK.SpeechResultFormat.Simple (Options - Simple/Detailed)
    // Alternatively use SDK.CognitiveTokenAuthentication(fetchCallback, fetchOnExpiryCallback) for token auth
    var authentication = new SDK.CognitiveSubscriptionKeyAuthentication(subscriptionKey);
    return SDK.Recognizer.Create(recognizerConfig, authentication);
}
function RecognizerStart(SDK, recognizer) {
    recognizer.Recognize(function (event) {
        /*
         Alternative syntax for typescript devs.
         if (event instanceof SDK.RecognitionTriggeredEvent)
         */
        switch (event.Name) {
            case "RecognitionTriggeredEvent":
                UpdateStatus("Initializing");
                break;
            case "ListeningStartedEvent":
                UpdateStatus("Listening");
                break;
            case "RecognitionStartedEvent":
                UpdateStatus("Listening_Recognizing");
                break;
            case "SpeechStartDetectedEvent":
                UpdateStatus("Listening_DetectedSpeech_Recognizing");
                console.log(JSON.stringify(event.Result)); // check console for other information in result
                break;
            case "SpeechHypothesisEvent":
                UpdateRecognizedHypothesis(event.Result.Text);
                console.log(JSON.stringify(event.Result)); // check console for other information in result
                break;
            case "SpeechEndDetectedEvent":
                OnSpeechEndDetected();
                UpdateStatus("Processing_Adding_Final_Touches");
                console.log(JSON.stringify(event.Result)); // check console for other information in result
                break;
            case "SpeechSimplePhraseEvent":
                UpdateRecognizedPhrase(JSON.stringify(event.Result, null, 3));
                break;
            case "SpeechDetailedPhraseEvent":
                UpdateRecognizedPhrase(JSON.stringify(event.Result, null, 3));
                break;
            case "RecognitionEndedEvent":
                OnComplete();
                UpdateStatus("Idle");
                console.log(JSON.stringify(event)); // Debug information
                break;
        }
    })
        .On(function () {
        // The request succeeded. Nothing to do here.
    }, function (error) {
        console.error(error);
    });
}

function RecognizerStop(SDK, recognizer) {
    // recognizer.AudioSource.Detach(audioNodeId) can be also used here. (audioNodeId is part of ListeningStartedEvent)
    recognizer.AudioSource.TurnOff();
}

// request handler
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

function Setup() {
            recognizer = RecognizerSetup(SDK, SDK.RecognitionMode.Interactive, en-IN, SDK.SpeechResultFormat[Simple], key);
        }

function OnSpeechEndDetected() {
            socket.emit('OnSpeechEndDetected');
        }

function UpdateRecognizedPhrase(json) {
             socket.emit('update_text', json);
        }

function OnComplete() {
            socket.emit('OnComplete');
        }

io.on('connection', function (socket) {

    // socket.emit('default_json',default_response);

    socket.on('analyzetone', function (text_object) {
        // Tone Analyzer
        var params = {
            // Get the text from the JSON file.
            text: text_object.text,
        };

        tone_analyzer.tone(params, function(error, response) {
                if (error)
                    console.log('error:', error);
                else{
                    // console.log(JSON.stringify(response, null, 2));
                    socket.emit('tone_analyze',response);
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
                // console.log(JSON.stringify(response, null, 2));
                socket.emit('nlp', response);
        });
    });

    socket.on('start', function () {
        if(!recognizer) {
            Setup();
        }

        RecognizerStart(SDK, recognizer);
    });

    socket.on('stop', function() {
        RecognizerStop(SDK);
    });

    socket.on('Initialize', function() {
        Initialize(function (speechSdk) {
            console.log('Initializing');
            SDK = speechSdk;
            startBtn.disabled = false;
        });
    });

});


