// various constants to be used in looking things up
const score_class_name = "meter-value superPageFontColor";
const base_urls = ['https://www.rottentomatoes.com/m/', 
                   'https://www.rottentomatoes.com/tv/']

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
    if (matches) {
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

                // attempt to find the media title both as a movie and tv show
                Promise.all(base_urls.map(url => fetch(url + title)))
                    .then(responses => {
                        for (var response of responses) {
                            if (response.status === 200) {
                                // valid response found
                                return response.text();
                            }
                        }
                        // neither url returned anything -> report failure
                        return null;
                    })
                    .then(text => {
                        score = get_score_elem(overlay);
                        if (text) {
                            newScore = regex_score_from_page(text);
                            score = get_score_elem(overlay);
                            if (score) {
                                score.innerText = newScore;
                            }
                        } else {
                            if (score) {
                                score.innerText = 'NA';
                            }
                        }
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

