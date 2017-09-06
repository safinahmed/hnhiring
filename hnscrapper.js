const rp = require('request-promise-native');
const cheerio = require('cheerio');
const moment = require('moment');

module.exports.scrapeForJobs = function(postId, lastOfferId) {

    return new Promise(function(resolve, reject) {
        var options = {
            uri: 'https://news.ycombinator.com/item?id=' + postId,
            transform: function(body) {
                return cheerio.load(body);
            }
        };

        rp(options)
            .then(function($) {
                const now = moment();
                console.log("Starting Scrapping for Jobs on Post " + postId + " at " + now + "!!");
                var result = [];
                var maxOfferId = 0;
                $(".athing.comtr").each(function(i, elem) {
                    var identation = $("img", elem).attr('width');
                    //Identations > 0 are comments on job offers
                    if (identation !== "0")
                        return;

                    var offerId = $(elem).attr('id');

                    //We use latest offer id scrapped to only process newer offers
                    if (offerId <= lastOfferId)
                        return;

                    if (offerId > maxOfferId)
                        maxOfferId = offerId;

                    var user = $(".hnuser", elem).text();
                    var date = parseDate($(".age", elem).text(), now);
                    var content = parseContent($, $(".c00", elem));
                    var offer = createOffer({ offerId: offerId, user: user, content: content, date: date });
                    result.push(offer);

                });
                resolve({
                    data: result,
                    maxOfferId: maxOfferId
                });
                console.log("Ended Scrapping for Jobs with " + result.length + " jobs!!");
            })
            .catch(function(err) {
                reject(Error('Error parsing page ' + err));
            });
    });
};

function parseDate(age, now) {
    const tokens = age.split(" ");
    var result = new moment(now);
    result.subtract(parseInt(tokens[0]), tokens[1]);
    return result;
}

function parseContent($, element) {
    $("span", element).remove();
    $(".reply", element).remove();
    return element.html();
}

function createOffer(offer) {
    var headline = offer.content.substring(0, offer.content.indexOf('<p>'));
    return offer;
}