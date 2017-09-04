$(function() {
    var $textInput = $('#textInput'),
        $submit_button = $('submit_button'),
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

    $submit_button.onclick(function () {
        text = cleanInput($textInput.val().trim());
        text_object = JSON.parse(text);
        socket.emit('analyzetone', text_object);
        socket.emit('nlp', text_object);
    });
});

