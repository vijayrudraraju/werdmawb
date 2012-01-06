// vijay rudraraju
var gP;
$(document).bind('mobileinit', function() {
    console.log('document.bind"mobileinit"');
});
$(document).ready(function() {
    console.log('$document.ready');
    $.couch.app(function(app) {
        $("#account1").evently("account", app);
        //$("#account2").evently("account", app);
        $("#profile1").evently("profile", app);
        //$("#profile2").evently("profile", app);
        $.evently.connect("#account1","#profile1", ["loggedIn","loggedOut"]);
        //$.evently.connect("#account2","#profile2", ["loggedIn","loggedOut"]);
        //$('#account').trigger('create');
    });

    //$db = $.couch.db('toiweb');
    //$.couch.urlPrefix = "http://localhost:5984/toiweb/_design/toiweb";
    $.couch.info({
        success: function(data) {
            console.log('couch.info ->');
            console.log(data);
        }
    });
    $.couch.allDbs({
        success: function(data) {
            console.log('couch.allDbs ->');
            console.log(data);
        }
    });
    /*
    $.couch.login({
    name: 'vijay',
    password: 'vijay',
    success: function(data) {
    console.log('login');
    console.log(data);
    },
    error: function(status) {
    console.log(status);
    }
    });
    */
    $.couch.db('werdmawb').allDocs({
        success: function(data) {
            console.log('couch.db"werdmawb".allDocs ->');
            console.log(data);
        }
    });

    $(document).evently({
        _init: function() {
        },
        pageinit: function() {
        },
        keypress: function(e) {
            //e.preventDefault();
        },
        keydown: function(e) {
            if(e.which=='9') {
                //e.preventDefault();
            } else if(e.which=='13') {
                //e.preventDefault();
            }
        },
        keyup: function(e) {
            if(e.which=='9') {
                //e.preventDefault();
            } else if(e.which=='13') {
                //e.preventDefault();
                //$('#canvas').trigger("enter");
            }
        }
    });

    $('#loginsubmit').evently({
        _init: function() {
        },
        click: function() {
            console.log('submit login');
            var name = $('input[name=userid]').val();
            var pass = $('input[name=userpass]').val();              
            console.log(name, pass);
            $('#account1').trigger('doLogin', [name, pass]);
            return false;
        }
    });
    $('#signupsubmit').evently({
        _init: function() {
        },
        click: function() {
            console.log('submit signup');
            var name = $('input[name=newuserid]').val();
            var pass = $('input[name=newuserpass]').val();              
            console.log(name, pass);
            $('#account1').trigger('doSignup', [name, pass]);
            return false;
        }
    });

    $('#profile1').evently({
        _init: function() {
            $(this).data('lastSaveTime',0);
        }
    });

    $('#textarea1').evently({
        _init: function() {
            $(this).data('lines',[]);
            $(this).data('oldLines',[]);
            $(this).data('numStrokes',0);
            $(this).data('wordIndex',['',0,[]]);
            $(this).data('phraseIndex',['',0,[],[]]);

            $(this).data('oldTime','');
            $(this).data('paragraphIndex',{});
            $(this).data('timeIndex',{});
            $(this).data('assocIndex',{});

            //$(this).html('apple apartment application apart\nhello');
            //$(this).trigger('keyup');
        },
        keydown: function(e) {
            console.log('keydown');
        },
        keyup: function(e) {
            console.log('keyup');

            var newTime = $.now();
            var oldTime = $(this).data('oldTime');

            // start word index
            var lines = $(this).val().split('\n');
            $(this).data('lines',lines);
            oldLines = $(this).data('oldLines');

            var words = [];
            var allWords = [];
            console.log('lines');
            console.log(lines);

            // consolidation checking, redundancy checking
            /*
            var distances = [];
            var modifications = 0;
            if (oldLines.length == lines.length) {

                for (var i=0;i<lines.length;i++) {
                    distances.push(calcLevenshteinDistance(oldLines[i],lines[i])); 
                    if (distances[distances.length-1] > 0 && distances[distances.length-1] < 5) {
                        modifications++; 
                    }
                }
                console.log('distances');
                console.log(distances);
                console.log(modifications);

            }// else {
            */

            for (var i=0;i<lines.length;i++) {
                //indexParagraph(lines.slice(i),time,$(this).data('paragraphIndex'));
                words = lines[i].split(/ +/);
                //console.log('words');
                //console.log(words);
                indexPhrase(words,$(this).data('phraseIndex'));
                allWords = allWords.concat(lines[i].split(/ +/)); 
            }

            //}
            //console.log('allWords');
            //console.log(allWords);
            for (var i=0;i<allWords.length;i++) {
                //for (var j=0;j<words[i].length;j++) {
                    //console.log('indexing...'+words[i]);
                    indexWord(allWords[i],newTime,oldTime,$(this).data('wordIndex'));
                    //}
                    //indexPhrase(words.slice(i),time,$(this).data('phraseIndex'));
            }
            //console.log($(this).data('wordIndex'));
            // end word index

            var numStrokes = $(this).data('numStrokes');
            numStrokes++;
            $(this).data('numStrokes',numStrokes);

            $(this).data('oldLines',lines);

            $(this).data('oldTime',newTime);

            startAutoSaver();
        }
    });

    $('#textarea2').evently({
        _init: function() {

        },
        keyup: function(e) {
            var text = $(this).val();
            var lines = text.split('\n');
            var allWords = [];
            for (var i=0;i<lines.length;i++) {
                allWords = allWords.concat(lines[i].split(/ +/)); 
            }

            var wordRetrievalResult = retrieveWordQueryTree(text,$('#textarea1').data('wordIndex'),[],'');
            var phraseRetrievalResult = retrievePhraseQueryTree(allWords,$('#textarea1').data('phraseIndex'),'',[]);
            console.log('wordRetrievalResult');
            console.log(wordRetrievalResult);
            console.log('phraseRetrievalResult');
            console.log(phraseRetrievalResult);

            $('#querygrid').html('');
            var length = 0;
            if (wordRetrievalResult.length > phraseRetrievalResult.length) {
                length = wordRetrievalResult.length; 
            } else {
                length = phraseRetrievalResult.length; 
            }

            for (var i=0;i<length;i++) {
                if (i < wordRetrievalResult.length) {
                    $('#querygrid').append('<div class="ui-block-a"><div class="ui-bar ui-bar-b">'+wordRetrievalResult[i]+'</div></div>');
                } else {
                    $('#querygrid').append('<div class="ui-block-a"><div></div></div>');
                }

                if (i < phraseRetrievalResult.length) {
                    var pointer = phraseRetrievalResult[i];
                    var thisString = pointer.join(' ');
                    $('#querygrid').append('<div class="ui-block-b"><div class="ui-bar ui-bar-b">'+thisString+'</div></div>');
                } else {
                    $('#querygrid').append('<div class="ui-block-b"><div></div></div>');
                }
            }
/*
            for (var i=0;i<wordRetrievalResult.length;i++) {
                $('#querygrid').append('<div class="ui-block-a"><div class="ui-bar ui-bar-b">'+wordRetrievalResult[i]+'</div></div>');
            }
            for (var i=0;i<phraseRetrievalResult.length;i++) {
                var pointer = phraseRetrievalResult[i];
                var thisString = pointer.join(' ');
                $('#querygrid').append('<div class="ui-block-b"><div class="ui-bar ui-bar-b">'+thisString+'</div></div>');
            }
            */
            //$('#feedback2').html(retrievalResult);

            $(document).trigger('updatelayout');
            $.mobile.fixedToolbars.show();
        }
    });

    $(document).trigger('updatelayout');
    $.mobile.fixedToolbars.show();
});
