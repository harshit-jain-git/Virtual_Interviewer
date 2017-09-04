$(function() {
    var socket = io();

    var $textInput = $('#textInput'),
        $submit_button = $('.submit_button'),
        text_object = {"text":""},
        text = "";


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
    
    $submit_button.click(function (e) {
        e.preventDefault();
        text = cleanInput($textInput.val().trim());
        console.log(text);
        console.log($submit_button);
        text_object['text'] = text;
        socket.emit('analyzetone', text_object);
        socket.emit('nlp', text_object);
    });
    
    
    socket.on('tone_analyze',function (output) {
        console.log(JSON.stringify(output));
    });
    
    socket.on('nlp', function (output)  {
        
    });

    socket.on('default_json', function (res) {
        var json = res.document_tone;

        var emotion_graph = $('.summary-emotion-graph');



        for(var j = 0; j < 3; j++){
            graphs = $('.bar-graph')[j];
            var emotions = json.tone_categories[j].tones;

            console.log(graphs);

            for( var i = 0; i < emotions.length; i++){

                var emotion = emotions[i].tone_id;
                var score = emotions[i].score;
                emotion = emotion.charAt(0).toUpperCase() + emotion.slice(1);  // capitalize first letter

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
    });

    function round(value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }

});

