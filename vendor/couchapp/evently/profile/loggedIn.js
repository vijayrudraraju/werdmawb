function(e, r) {
  var userCtx = r.userCtx;
  var widget = $(this);
  // load the profile from the user doc
  var userDb = $.couch.db(r.info.authentication_db);
  var mainDb = $.couch.db('werdmawb');
  var userDocId = "org.couchdb.user:"+userCtx.name;

  console.log(userCtx.name+' profile, loggedin');

  userDb.openDoc(userDocId, {
    success : function(userDoc) {
        console.log('open userdoc');
        var profile = userDoc['couch.app.profile'];
        if (profile['main']) {
            // we copy the name to the profile so it can be used later
            // without publishing the entire userdoc (roles, pass, etc)
            profile.name = userDoc.name;
            $('#profile1').data('profile', profile);
            mainDb.openDoc(profile.main, {
                success : function(mainDoc) {
                    $('#profile1').data('mainDoc',mainDoc);

                    $('#profile1').data('wordIndex',mainDoc.wordIndex);
                    $('#profile1').data('phraseIndex',mainDoc.phraseIndex);
                    $('#profile1').data('paragraphIndex',mainDoc.paragraphIndex);
                    $('#profile1').data('numStrokes',mainDoc.numStrokes);

                    $('#textarea1').data('wordIndex',mainDoc.wordIndex);
                    $('#textarea1').data('phraseIndex',mainDoc.phraseIndex);
                    $('#textarea1').data('paragraphIndex',mainDoc.paragraphIndex);
                    $('#textarea1').data('numStrokes',mainDoc.numStrokes);

                    startAutoSaver();
                }
            });
            //widget.trigger("profileReady", [profile]);
        } else {
            //widget.trigger("noProfile", [userCtx]);
            console.log('reinitializing user');
            var newProfile = {};
            var newId = '';
            mainDb.saveDoc(
                {
                    wordIndex:$('#textarea1').data('wordIndex'),
                    phraseIndex:$('#textarea1').data('phraseIndex'),
                    paragraphIndex:$('#textarea1').data('paragraphIndex'),
                    numStrokes:$('#textarea1').data('numStrokes')
                }, 
                {
                    success: function(data) {
                        console.log('maindoc saved');
                        console.log(data);
                        newId = data.id;
                        console.log('open maindoc');
                        newProfile.main = newId;
                        newProfile.name = userDoc.name;
                        userDoc['couch.app.profile'] = newProfile;
                        // store the user profile on the user account document
                        userDb.saveDoc(userDoc, {
                            success : function() {
                                console.log('save userdoc');
                                $('#profile1').data('profile', newProfile);
                                startAutoSaver();
                            }
                        });
                        mainDb.openDoc(newProfile.main, {
                            success : function(mainDoc) {
                                $('#profile1').data('mainDoc',mainDoc);

                                $('#profile1').data('wordIndex',mainDoc.wordIndex);
                                $('#profile1').data('phraseIndex',mainDoc.phraseIndex);
                                $('#profile1').data('paragraphIndex',mainDoc.paragraphIndex);
                                $('#profile1').data('numStrokes',mainDoc.numStrokes);

                                $('#textarea1').data('wordIndex',mainDoc.wordIndex);
                                $('#textarea1').data('phraseIndex',mainDoc.phraseIndex);
                                $('#textarea1').data('paragraphIndex',mainDoc.paragraphIndex);
                                $('#textarea1').data('numStrokes',mainDoc.numStrokes);

                                startAutoSaver();
                            }
                        });
                    }
                }
            );
        }
    }
  });
}
