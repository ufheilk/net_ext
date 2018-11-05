// various constants to be used in looking things up
const score_class_name = "meter-value superPageFontColor";
const base_movie_url = "https://www.rottentomatoes.com/m/";
const base_tv_url = "https://www.rottentomatoes.com/tv/";

// attempts to get a webpage and perform the callback on it. If there is an 
// error in accessing the first page (e.g. 404), it will attempt the same
// on the backup url
function httpGetAsyncWithBackup(main_url, backup_url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4) {
            // the request has been completed (possibly unsuccessfully)
            if (xmlHttp.status == 200) {
                // everything went according to plan
                callback(xmlHttp.responseText);
            } else {
                // some failure has occurred, go to backup url
                var xmlHttpBackup = new XMLHttpRequest();
                xmlHttpBackup.onreadystatechange = function() {
                    if (xmlHttpBackup.readyState == 4) {
                        if (xmlHttpBackup.status == 200) {
                            // backup worked
                            callback(xmlHttpBackup.responseText);
                        } else {
                            // the backup also failed -- all is lost
                            console.log("Main url and backup url failed");
                        }
                    }
                }

                xmlHttpBackup.open("GET", backup_url, true); // true for async
                xmlHttpBackup.send(null);

        }
    }
    }

    xmlHttp.open("GET", main_url, true); // true for async
    xmlHttp.send(null);
}



// extract score from the RT page by parsing the responseText as a document
// @param resp: responseText from an XMLHttpRequest
function parse_score_from_page(resp) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(resp, "text/html");
    score =  doc.getElementsByClassName(score_class_name);
    alert(score[0].innerText);
}


// extract score from the RT page by using a regex directly on the responseText string
// @param resp: responseText from an XMLHttpRequest
function regex_score_from_page(resp) {
    var reg = /<span class="meter-value superPageFontColor"><span>([0-9]+)<\/span>%<\/span>/;
    matches = resp.match(reg);
    if (matches.length > 0) {
        // something was read
        return matches[1];
    } else {
        return null;
    }
}

// transforms a netflix title to a form that can be recognized by Rotten Tomatoes
// i.e. all lowercase and underscores instead of spaces
function transform_title(title) {
    return title.toLowerCase().replace(/ /g, "_");
}

// gets the title from a <bob-overlay> element
function get_title(overlay) {
    title = overlay.getElementsByClassName("bob-title");
    if (title.length > 0) {
        return title[0].innerHTML;
    }

    return null;
}

// gets the score HTML elem from a bob-overlay element
// @return HTML element whose innerText is the score
function get_score_elem(overlay) {
    score = overlay.getElementsByClassName("match-score");
    if (score.length > 0) {
        return score[0];
    }

    return null;
}

// gets the score for a titled work (i.e. a movie or a show)
function get_media_score(title) {
    httpGetAsyncWithBackup(base_movie_url + title, base_tv_url + title, regex_score_from_page);
}

function observation_callback(mutationList, observer) {
    for (var mutation of mutationList) {
        console.log("mutation occurred!");
        // mutation.getElementsByClassName("prostagma?");
        for (var node of mutation.addedNodes) {
            paragraphs = node.getElementsByClassName("prostagma?");
            if (paragraphs) {
                paragraphs[0].innerText = "porpoise";
            }
        }
    }
}

function change_scores(mutationList, observer) {
    for (var mutation of mutationList) {
        for (var node of mutation.addedNodes) {
            overlays = node.getElementsByClassName("bob-overlay");
            for (var overlay of overlays) {


                var title = transform_title(get_title(overlay));

                httpGetAsyncWithBackup(base_movie_url + title, base_tv_url + title, function(resp) {
                    new_score = regex_score_from_page(resp); // score from rotten tomatoes

                    score = get_score_elem(overlay); // actual score element on netflix page
                    if (score) {
                        score.innerText = new_score;
                    }
                    console.log(new_score);
                });
            }
        }
    }
}

function updateScore(overlay) {
    // first, get the title to use in the search
    var title = get_title(overlay);
}

var observer = new MutationObserver(change_scores);

var config = { childList: true, subtree: true };

observer.observe(document, config);

