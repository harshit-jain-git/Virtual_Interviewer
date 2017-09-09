$(function() {
    var socket = io();

    var $textInput = $('#textInput'),
        $submit_button = $('.submit_button'),
	    $start_button = $('#start_button'),
	    $stop_button = $('#stop_button'),
        text_object = {"text":""},
        text = "",
        index = 0,
        $question = $('.question');
        questions = [
            'Tell me about yourself',
            'Why should we hire you?',
            'What are your strengths and weaknesses?',
            'Why do you want to work at our company?',
            'How do you see yourself in five years?',
            'Explain how would you be an asset to this organization?',
            'What is the difference between confidence and overconfidence?',
            'How do you define success and how do you measure up to your own definition?',
            'How much salary do you expect?',
            'On a scale of one to ten, rate me as an interviewer?'];

        // Initiate the first question ...
        $question.html(questions[index++]);     

    // Applied globally on all textareas with the "autoExpand" class
    $(document)
        .one('focus.autoExpand', 'textarea.autoExpand', function(){
            var savedValue = this.value;
            this.value = '';
            this.baseScrollHeight = this.scrollHeight;
            this.value = savedValue;
        })
        .on('input.autoExpand', 'textarea.autoExpand', function(){
            var minRows = this.getAttribute('data-min-rows')|0, rows;
            this.rows = minRows;
            rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 17);
            this.rows = minRows + rows;
        });

    // Prevents input from having injected markups
    function cleanInput(input) {
        return $('<div/>').text(input).text();
    }

    socket.emit('Initialize');

    
    $submit_button.click(function (e) {
        e.preventDefault();
        text = cleanInput($textInput.val().trim());
        // console.log(text);
        // console.log($submit_button);
        text_object['text'] = text;
        $textInput.val('');
        socket.emit('analyzetone', text_object);
        // socket.emit('nlp', text_object);
    });
    
    $start_button.click(function (e) {
	    e.preventDefault();
        $start_button.disabled = true;
        $stop_button.disabled = false;
        $textInput.val('');
	    socket.emit('start');
    });  

    $stop_button.click(function (e) {
	    e.preventDefault();
        $start_button.disabled = false;
        $stop_button.disabled = true;    	
	    socket.emit('stop');
	
    });  

    socket.on('update_text', function (json) {
    	$textInput.innerHTML = json.DisplayText;
    });
    
    socket.on('OnSpeechEndDetected', function(){
        $stop_button.disabled = true; 
    });

    socket.on('OnComplete', function() {
        $start_button.disabled = false;
        $stop_button.disabled = true;
    });

    socket.on('tone_analyze',function (res) {
        var json = res.document_tone;
        // console.log(json);
        var emotion_graph = $('.summary-emotion-graph');

        for(var j = 0; j < 3; j++){
            graphs = $('.bar-graph')[j];
            graphs.innerHTML = '';
            var emotions = json.tone_categories[j].tones;

            // console.log(graphs);

            for( var i = 0; i < emotions.length; i++){

                var emotion = emotions[i].tone_name;
                var score = emotions[i].score;

                var likeliness = "UNLIKELY";

                if (score >= 0.75){
                    likeliness = " VERY LIKELY";
                }
                else if (score >= 0.5 && score <0.75){
                    likeliness = "LIKELY";
                }

                var innerHTML = '';
                innerHTML += '<div class="bar-graph--row summary-emotion-graph--row dim">';
                innerHTML += '<div class="bar-graph--label-container summary-emotion-graph--label-container">';
                innerHTML += '<div class="bar-graph--label"><p class="base--p">'+emotion+'</p></div>';
                innerHTML += '</div>';
                innerHTML += '<div class="bar-graph--bar-container summary-emotion-graph--bar-container">';
                innerHTML += '<div class="bar-graph--bar">';
                innerHTML += '<div class="bar-graph--bar-value summary-emotion-graph--bar-value summary-emotion-graph--bar-value_'+emotion+'" style="width:'+ score*100 +'% ;">';
                innerHTML += '</div></div></div>';
                innerHTML += '<span class="summary-emotion-graph--percentage-label">'+ round(score,2) +'<br>';
                innerHTML += likeliness + '</span></div>';

                // emotion_graph.html(emotion_graph.html() + innerHTML);
                graphs.innerHTML += innerHTML;
            }
        }
        $question.html(questions[index++]);
    });

    

    function round(value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }

});

