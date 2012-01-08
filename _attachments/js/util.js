function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function () {
    return 'AssertException: ' + this.message;
}
function assert(exp, message) {
    if (!exp) {
        throw new AssertException(message);
    }
}

/* Make an asynchronous HTTP request to the browser. */
function http_request(path, args, ok_responder, error_responder) {
  var client = new XMLHttpRequest();
  client.onreadystatechange = function() {
    if(this.readyState == 4)
      ok_responder(this.responseText);
    else if (error_responder)
      error_responder(this.responseText);
  }
  a='';
  n=0;
  for (i in args) {
    if (n==0)
      a+='?';
    else
      a+='&';
    a += i + '=' + args[i];
    n++;
  }
  client.open("GET", path+a);
  client.send("");
}

/* A simple object class to represent a bucket of things that can be
 * put in or taken out. */
function Bucket() {
    this.contents = [];
    this.put = function(a) {
        this.contents.push(a);
    }
    this.take = function(a) {
        for (i in this.contents) {
            if (this.contents[i]==a) {
                this.contents.splice(i,1);
                return;
            }
        }
    }
}

/* Class to wrap an association list. */
function Assoc() {
    this.contents = {};
    this.add = function(key, value) {
        this.contents[key] = value;
    },
    this.remove = function(name) {
        delete this.contents[name];
    },
    this.get = function(name) {
        return this.contents[name];
    },
    this.keys = function() {
        var keys = [];
        for (k in this.contents)
            keys.push(k);
        return keys;
    }
    this.length = function() {
        return this.keys().length;
    }
}

/* Get the full offset and size of an element. */
function fullOffset(e)
{
    var o = {left:0,top:0,width:0,height:0};
    if (e.offsetParent)
        o = fullOffset(e.offsetParent);
    return {left:e.offsetLeft - e.scrollLeft + o.left,
            top:e.offsetTop - e.scrollTop + o.top,
            width:e.offsetWidth,
            height:e.offsetHeight};
}

// Return new array with duplicate values removed
/*
Array.prototype.uniquePairs =
function() {
    var a = [];
    var l = this.length;
    for(var i=0; i<l; i++) {
        for(var j=i+1; j<l; j++) {
            // If this[i] is found later in the array
            if (this[i][0] === this[j][0] && this[i][1] === this[j][1])
                j = ++i;
        }
        a.push(this[i]);
    }
    return a;
};
*/
/*
Object.prototype.clone = function() {
    var newObj = (this instanceof Array) ? [] : {};
    for (i in this) {
        if (i == 'clone') continue;
        if (this[i] && typeof this[i] == "object") {
            newObj[i] = this[i].clone();
        } else newObj[i] = this[i]
    } 
    return newObj;
};
*/
/*
Object.prototype.nodeCount = function() {
    var count = 0;
    for (i in this) {
        if (this.hasOwnProperty(i)) {
            count++;
        }
    } 
    return count;
};
*/

function reinitializePersonalIndex() {
    $('#textarea1').data('numStrokes',0);
    $('#textarea1').data('wordIndex',['',0,[]]);
    $('#textarea1').data('phraseIndex',['',0,[],[]]);
    $('#textarea1').data('paragraphIndex',['',0,[],[]]);
}

/*
Paragraphs
*/

function indexParagraph(paragraph,index) {
    for (var i=0;i<paragraph.length;i++) {
        indexParagraphHelper(paragraph.slice(i),index,paragraph.slice(0,i));
    }
}
function indexParagraphHelper(paragraph,index,buffer) {
    if (paragraph !== '') {
        var foundIndex = index.indexOf(paragraph[0]);
        if (foundIndex === -1) {
            index.push(paragraph[0]);
            index.push(0);
            index.push(['',0,[],[]]);
            index.push([buffer.slice()]);
            foundIndex = index.indexOf(paragraph[0]);
        } else {
            index[foundIndex+1]++;

/*
            console.log('key')
            console.log(paragraph[0]);
            console.log('buffer');
            console.log(buffer);
            console.log('prefix index');
            console.log(index[foundIndex+3]);
            */

            var isNew = true;
            var candidates = [];
            for (var i=0;i<index[foundIndex+3].length;i++) {
                if (buffer.length == index[foundIndex+3][i].length) {
                    //console.log('new candidate');
                    //console.log(index[foundIndex+3][i]);
                    candidates.push(index[foundIndex+3][i].slice());
                }
            }

            //console.log('candidates');
            //console.log(candidates);

            var hitCount = 0;
            for (var i=0;i<candidates.length;i++) {
                hitCount = 0;
                for (var j=0;j<candidates[i].length;j++) {
                    if (candidates[i][j] == buffer[j]) {
                        hitCount++;
                    }
                }
                if (hitCount == buffer.length) {
                    isNew = false;
                    break;
                }
            }

            if (isNew && buffer.length > 0) {
                //console.log('new prefix found');
                //console.log(buffer);
                index[foundIndex+3].push(buffer.slice());
            }
        }

        if (paragraph[1] !== undefined) {
            buffer.push(paragraph[0]);
            indexParagraphHelper(paragraph.slice(1),index[foundIndex+2],buffer.slice());
        } else {
            var terminalIndex = index[foundIndex+2].indexOf('');
            index[foundIndex+2][terminalIndex+1]++;
        }
    }
}

/*
Phrases
*/

// indexing
function indexPhrase(phrase,index) {
    //console.log('indexPhrase');
    //console.log(phrase);
    for (var i=0;i<phrase.length;i++) {
        //console.log(phrase.slice(i));
        indexPhraseHelper(phrase.slice(i),index,phrase.slice(0,i)); 
    }
}
function indexPhraseHelper(phrase,index,buffer) {
    if (phrase !== '') {
        var foundIndex = index.indexOf(phrase[0]);
        if (foundIndex === -1) {
            index.push(phrase[0]);
            index.push(0);
            index.push(['',0,[],[]]);
            index.push([buffer.slice()]);
            foundIndex = index.indexOf(phrase[0]);
        } else {
            index[foundIndex+1]++;

            var isNew = true;
            var candidates = [];
            for (var i=0;i<index[foundIndex+3].length;i++) {
                if (buffer.length == index[foundIndex+3][i].length) {
                    candidates.push(index[foundIndex+3][i].slice());
                }
            }

            var hitCount = 0;
            for (var i=0;i<candidates.length;i++) {
                hitCount = 0;
                for (var j=0;j<candidates[i].length;j++) {
                    if (candidates[i][j] == buffer[j]) {
                        hitCount++;
                    }
                }
                if (hitCount == buffer.length) {
                    isNew = false;
                    break;
                }
            }

            if (isNew && buffer.length > 0) {
                index[foundIndex+3].push(buffer.slice());
            }
        }

        if (phrase[1] !== undefined) {
            //console.log(buffer);
            buffer.push(phrase[0]);
            indexPhraseHelper(phrase.slice(1),index[foundIndex+2],buffer.slice());
        } else {
            var terminalIndex = index[foundIndex+2].indexOf('');
            index[foundIndex+2][terminalIndex+1]++;
        }
    }
}
// retrieval
function retrievePhraseQueryTree(phrase,index,result,buffer) {
    if (phrase[0] !== '') {
        var foundIndex = index.indexOf(phrase[0]);
        //console.log(phrase);
        //console.log('phrase: '+phrase[0]);
        //console.log('foundIndex: '+foundIndex);
        //console.log('result: '+result);
        //console.log('buffer: '+buffer);
        // if the letter is not found return nothing
        if (foundIndex === -1) {
            return '';     
        }

        //buffer += phrase[0] + ' ';
        buffer.push(phrase[0]);

        if (phrase[1] !== undefined) {
            result = retrievePhraseQueryTree(phrase.slice(1),index[foundIndex+2],result,buffer.slice());
        } else {
            //console.log(index[foundIndex+2]);
            //console.log(' index[foundIndex+2] - retrievePhraseQueryTree(...)');
            //result = phraseSubTreeToText(retrievePhraseSubTree(index[foundIndex+2],[]),'',buffer);
            result = phraseSubTreeToText(retrievePhraseSubTree(index[foundIndex+2],[]),[],buffer.slice());
            //result = retrievePhraseSubTree(index[foundIndex+2],[]);
        }
    }
    return result;
}
function retrievePhraseSubTree(index,result) {
    console.log('subindex');
    console.log(index);
    if (index[0] == null) {
        return result;
    }
    for (var i=0;i<index.length;i+=4) {
        result.push(index[i]); 
        result.push(retrievePhraseSubTree(index[i+2],[])); 
        result.push(index[i+3]); 
    }
    //console.log('subresult');
    //console.log(result);
    return result;
}
function phraseSubTreeToText(subTree,result,buffer) {
    //console.log('subTree.length: '+subTree.length);
    for (var i=0;i<subTree.length;i+=3) {
        if (subTree[i] !== '') {
            //buffer += subTree[i];
            buffer.push(subTree[i]);
            //console.log('subTree[i]: '+subTree[i]);
            /*
            if (subTree[i+1].length > 3) {
                buffer += ' ';
            }
            */
            //console.log('subbuffer');
            //console.log(buffer);
            result = phraseSubTreeToText(subTree[i+1],result,buffer.slice());
            buffer.pop(); 
            //buffer = buffer.substring(0,buffer.length);
        }
    }
    //result += '<br/>'+buffer; 
    result.push(buffer);
    return result;
}

/*
Words
*/

// indexing
// concatenated triplets
// key
// strength
// down
function indexWord(word,newTime,oldTime,index) {
    if (word !== '') {
        var foundIndex = index.indexOf(word[0]);
        if (foundIndex === -1) {
            index.push(word[0]);
            index.push(0);
            index.push(['',0,[]]);
            foundIndex = index.indexOf(word[0]);
        } else {
            index[foundIndex+1]++;
        }

        if (word[1] !== undefined) {
            indexWord(word.slice(1),newTime,oldTime,index[foundIndex+2]);
        } else {
            var terminalIndex = index[foundIndex+2].indexOf('');
            index[foundIndex+2][terminalIndex+1]++;
        }
    }
}
// retrieval
function retrieveWordQueryTree(word,index,result,buffer) {
    if (word !== '') {
        var foundIndex = index.indexOf(word[0]);
        // if the letter is not found return nothing
        if (foundIndex === -1) {
            return '';     
        }

        buffer += word[0];
        if (word[1] !== undefined) {
            result = retrieveWordQueryTree(word.slice(1),index[foundIndex+2],result,buffer);
        } else {
            result = wordSubTreeToText(retrieveWordSubTree(index[foundIndex+2],[]),[],buffer);
        }
    } 

    return result;
}
function retrieveWordSubTree(index,result) {
    for (var i=0;i<index.length;i+=3) {
        result.push(index[i]); 
        result.push(retrieveWordSubTree(index[i+2],[])); 
    }
    return result;
}
function wordSubTreeToText(subTree,result,buffer) {
    for (var i=0;i<subTree.length;i+=2) {
        if (subTree[i] !== '') {
            buffer += subTree[i];
            result = wordSubTreeToText(subTree[i+1],result,buffer);
            buffer = buffer.substring(0,buffer.length-1);
        }
    }
    result.push(buffer); 
    return result;
}

/*
String functions
*/
function calcLevenshteinDistance(firstWord,secondWord) {
    var matrixWidth = firstWord.length+1;
    var matrixHeight = secondWord.length+1;
    var distMatrix = new Array(matrixWidth);
    for(var j=0;j<matrixWidth;j++) {
        distMatrix[j] = new Array(matrixHeight);
    }

    for (var i=0;i<matrixWidth;i++) {
        distMatrix[i][0] = i;
    }
    for (var j=0;j<matrixHeight;j++) {
        distMatrix[0][j] = j;
    }

    for (var j=1;j<matrixHeight;j++) {
        for (var i=1;i<matrixWidth;i++) {
            var firstWordIndex = i-1;
            var secondWordIndex = j-1;

            if (firstWord[firstWordIndex] == secondWord[secondWordIndex]) {
                distMatrix[i][j] = distMatrix[i-1][j-1];
            } else {
                // find best operation
                var minValue = distMatrix[i-1][j]+1; // deletion
                if (distMatrix[i][j-1]+1 < minValue) {
                    minValue = distMatrix[i][j-1]+1; // insertion
                }
                if (distMatrix[i-1][j-1] < minValue) {
                    minValue = distMatrix[i-1][j-1]+1; // substitution 
                }

                distMatrix[i][j] = minValue;
            }
        }
    }

    return distMatrix[matrixWidth-1][matrixHeight-1];
}

/*
Data saving
*/
function startAutoSaver() {
    $('#profile1').data('autosave',true);
    autoSaver();
}
function stopAutoSaver() {
    $('#profile1').data('autosave',false);
}
function autoSaver() {
    var d = new Date();
    var t1 = $('#profile1').data('lastSaveTime');
    var t2 = d.getTime();
    var minDelta = 10000;
    console.log('t1 '+t1+' t2 '+t2);

    if ($('#profile1').data('autosave') && $('#profile1').data('profile') && t1 + minDelta < t2) {
        console.log('autosaving');
        $('#profile1').html('<p>Saving...<p>');
        var mainDb = $.couch.db('werdmawb');
        var newDoc = $('#profile1').data('mainDoc');
        newDoc['wordIndex'] = $('#textarea1').data('wordIndex');
        newDoc['phraseIndex'] = $('#textarea1').data('phraseIndex');
        newDoc['numStrokes'] = $('#textarea1').data('numStrokes');
        mainDb.saveDoc(newDoc,
            {
                success: function(data) {
                    $('#profile1').html('<p>Saved!<p>');

                    var t = d.getTime();
                    $('#profile1').data('lastSaveTime',t);

                    stopAutoSaver();
                    $.mobile.fixedToolbars.show();
                    //var t = setTimeout('autoSaver()',10000);
                }
            }
        );
    }
}
