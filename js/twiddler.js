var twiddles = streams.home;
var tags = streams.tags;
var mainLoaded = [];
var mainNew = [];
var filterLoaded = [];
var filterNew = [];
var filtered = false;
var live = false;
var filterProp = "";
var filterTarget = "";

$(document).ready(function() {
  $("#get-new").hide();
  $("#filter").hide();
  $("#username").hide();
  $("#label-username").hide();
  $("#input-username").hide();
  $("#submit-username").hide();
  $("#form-twiddle").hide();
  $("#logout").hide();
  var newTwiddles = twiddles.slice();
  displayTwiddles(newTwiddles);
  displayUsers();
  displayTags();
});

$("#get-new").click(getNewTwiddles);

$("#live").click(function() {
  if (!live) {
    getNewTwiddles();
    live = true;
    $("#live > p").text("Show Live Twiddles: On");
  } else if (live) {
    live = false;
    $("#live > p").text("Show Live Twiddles: Off");
  }
});

$("#home").click(function() {
  $("#filter").hide();
  filtered = false;
  detectNewTwiddles();
  $("#twiddles").html('<div id="twiddle-top"></div>');
  mainLoaded.forEach(function(twiddle) {
    var $twiddle = $(twiddle.html);
    var $timestamp = $(
      '<div id="' +
        twiddle.id +
        '-timestamp" class="grayed-sm float-right"></div>'
    );

    var secsOld = Math.floor((new Date() - twiddle.created_at) / 1000);
    var minsOld = Math.floor(secsOld / 60);
    var hrsOld = Math.floor(minsOld / 60);

    $timestamp.text(secsOld + " seconds ago");
    if (minsOld > 0) {
      $timestamp.text(minsOld + " minutes ago");
    }
    if (hrsOld > 0) {
      $timestamp.text(hrsOld + " hours ago");
    }

    $timestamp.appendTo($twiddle);
    $twiddle.insertAfter("#twiddle-top");
  });
});

$("#login").click(function() {
  $("#login").hide();
  $("#label-username").show();
  $("#input-username").show();
  $("#submit-username").show();
});

$("#logout").click(function() {
  $("#label-username").hide();
  $("#label-username").text("Enter your username:");
  $("#label-username").css("text-align", "left");
  $("#logout").hide();
  $("#form-twiddle").hide();
  $("#input-twiddle").val("");
  $("#login").show();
  $("#label-twiddle").show();
});

$("#submit-username").click(function() {
  $("#submit-username").hide();
  var username = $("#input-username").val();
  if (!streams.users[username]) {
    streams.users[username] = [];
  }
  $("#input-username").hide();
  $("#label-twiddle").hide();
  $("#user-twiddle").text("@" + username);
  $("#label-username").text("Hi " + username + "!");
  $("#label-username").css("text-align", "center");
  $("#logout").show();
  $("#form-twiddle").show();
});

$("#submit-twiddle").click(function() {
  var twiddle = {};
  var user = $("#user-twiddle").text();
  user = user.slice(1, user.length);

  twiddle.user = user;
  twiddle.message = $("#input-twiddle").val();
  twiddle.created_at = new Date();
  twiddle.id = randomId();
  twiddle.tag = "";

  var words = twiddle.message.split(" ");
  var last = words.length - 1;
  if (words[last].charAt(0) === "#") {
    twiddle.tag = words[last];
    words.pop();
    twiddle.message = words.join(" ");
  }

  twiddle.html = generateHTML(twiddle);

  streams.users[twiddle.user].push(twiddle);
  streams.home.push(twiddle);
  mainNew.push(twiddle);
  getNewTwiddles();
});

$(document).on("click", ".btn-block-author, a.author", function() {
  $("#get-new").hide();
  var author = $(this).text();
  author = author.slice(1, author.length);
  filteredTwiddles = filterTwiddles("user", author);
  filterLoaded = [];
  filtered = true;
  filterProp = "user";
  filterTarget = author;
  $("#filter").text("Twiddles by " + author);
  $("#filter").show();
  $("#twiddles").html('<div id="twiddle-top"></div>');
  displayTwiddles(filteredTwiddles);
});

$(document).on("click", ".btn-block-tag, a.hashtag", function() {
  $("#get-new").hide();
  var tag = $(this).text();
  filteredTwiddles = filterTwiddles("tag", tag);
  filterLoaded = [];
  filtered = true;
  filterProp = "tag";
  filterTarget = tag;
  $("#filter").text("Twiddles about " + tag);
  $("#filter").show();
  $("#twiddles").html('<div id="twiddle-top"></div>');
  displayTwiddles(filteredTwiddles);
});

function getNewTwiddles() {
  $("#get-new").hide();
  if (filtered) {
    displayTwiddles(filterNew);
    filterNew = [];
  } else {
    displayTwiddles(mainNew);
    mainNew = [];
  }
}

function filterTwiddles(prop, target) {
  var matches = [];
  twiddles.forEach(function(twiddle) {
    if (twiddle[prop] === target) {
      matches.push(twiddle);
    }
  });
  return matches;
}

function detectNewTwiddles() {
  if (!filtered) {
    var n = twiddles.length - (mainLoaded.length + mainNew.length);
    if (n > 0) {
      var newTwiddles = twiddles.slice(twiddles.length - n, twiddles.length);
      newTwiddles.forEach(function(twiddle) {
        mainNew.push(twiddle);
      });
      if (live) {
        getNewTwiddles();
      } else {
        $("#get-new").text("See " + mainNew.length + " new Twiddles");
        $("#get-new").show();
      }
    }
  }
  if (filtered) {
    var matches = filterTwiddles(filterProp, filterTarget);
    var relation;
    if (filterProp === "user") {
      relation = "by ";
    } else if (filterProp === "tag") {
      relation = "about ";
    }
    var n = matches.length - (filterLoaded.length + filterNew.length);
    if (n > 0) {
      newTwiddles = matches.slice(matches.length - n, matches.length);
      newTwiddles.forEach(function(twiddle) {
        filterNew.push(twiddle);
      });
      if (live) {
        getNewTwiddles();
      } else {
        $("#get-new").text(
          "See " + filterNew.length + " new Twiddles " + relation + filterTarget
        );
        $("#get-new").show();
      }
    }
  }
  if (live) {
    setTimeout(detectNewTwiddles, 1000);
  } else {
    setTimeout(detectNewTwiddles, 3000);
  }
}

function updateTwiddles() {
  var twiddles;
  if (filtered) {
    twiddles = filterLoaded;
  } else {
    twiddles = mainLoaded;
  }
  twiddles.forEach(function(twiddle) {
    $timestamp = $("#" + twiddle.id + "-timestamp");
    var secsOld = Math.floor((new Date() - twiddle.created_at) / 1000);
    var minsOld = Math.floor(secsOld / 60);
    var hrsOld = Math.floor(minsOld / 60);
    $timestamp.text(secsOld + " seconds ago");
    if (minsOld > 0) {
      $timestamp.text(minsOld + " minutes ago");
    }
    if (hrsOld > 0) {
      $timestamp.text(hrsOld + " hours ago");
    }
  });
  setTimeout(updateTwiddles, Math.floor(Math.random() * 3000) + 1);
}

function displayTwiddles(newTwiddles) {
  var $twiddles = $("#twiddles");

  newTwiddles.forEach(function(twiddle) {
    var $twiddle = $(twiddle.html);
    var $timestamp = $(
      '<div id="' +
        twiddle.id +
        '-timestamp" class="grayed-sm float-right"></div>'
    );

    var secsOld = Math.floor((new Date() - twiddle.created_at) / 1000);
    var minsOld = Math.floor(secsOld / 60);
    var hrsOld = Math.floor(minsOld / 60);

    $timestamp.text(secsOld + " seconds ago");
    if (minsOld > 0) {
      $timestamp.text(minsOld + " minutes ago");
    }
    if (hrsOld > 0) {
      $timestamp.text(hrsOld + " hours ago");
    }

    $timestamp.appendTo($twiddle);
    $twiddle.insertAfter("#twiddle-top");

    if (filtered) {
      filterLoaded.push(twiddle);
    } else {
      mainLoaded.push(twiddle);
    }
  });
}

function displayUsers() {
  var $users = $("#users");
  for (var user in streams.users) {
    var $user = $('<div class="twiddle btn-block-author"></div>');
    var $author = $('<div class="author text-center"></div>');
    $author.text("@" + user);
    $author.appendTo($user);
    $user.appendTo($users);
  }
}

function displayTags() {
  var $tags = $("#tags");
  var t = tags.length - 1;
  while (t >= 0) {
    var tag = tags[t];
    var $tag = $('<div class="twiddle btn-block-tag"></div>');
    var $content = $('<div class="content text-center"></div>');
    $content.text(tag);
    $content.appendTo($tag);
    $tag.appendTo($tags);
    t--;
  }
}

setTimeout(detectNewTwiddles, 1000);
setTimeout(updateTwiddles, Math.floor(Math.random() * 10000) + 1);
