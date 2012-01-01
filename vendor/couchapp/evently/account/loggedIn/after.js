function(e, r) {
  // old
  $$(this).userCtx = r.userCtx;
  $$(this).info = r.info;
 
  // new
  var userCtx = r.userCtx;
  var widget = $(this);
  // load the profile from the user doc
  var db = $.couch.db(r.info.authentication_db);
  var userDocId = "org.couchdb.user:"+userCtx.name;
  db.openDoc(userDocId, {
    success : function(userDoc) {
      var werdmawb = userDoc["werdmawb"];
      if (werdmawb) {
        // we copy the name to the profile so it can be used later
        // without publishing the entire userdoc (roles, pass, etc)
        werdmawb.name = userDoc.name;
        $$(widget).werdmawb = werdmawb;
        widget.trigger("profileReady", [profile]);
      } else {
        widget.trigger("noProfile", [userCtx]);
      }
    }
  });
};
