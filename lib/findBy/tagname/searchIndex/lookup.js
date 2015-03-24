module.exports = lookup

var _ = require('lodash'),
    Promise = require('bluebird')

var debug = console.log

// search in the index for docs matching the given query
// return a list of ids
function lookup(index, query) {

    var words = query.words    

    // e.g.,
    //
    // index = {
    //     LinearLayout: [{
    //         id: 1,
    //         count: 3
    //     }],
    //     ImageButton: [{
    //         id: 1,
    //         count: 4
    //     }, {
    //         id: 2,
    //         count: 2
    //     }]
    // }
    //
    // 
    // query = {
    //     words: ['ImageButton', 'LinearLayout']
    // }

    var idsForAllWords = _.map(query.words, function(word) {

        // get the ids of the list of docs containing this word
        var ids = _.pluck(index[word], 'id')
            // debug(ids)
        return ids

    })

    // debug(idsForAllWords)

    var results = _.reduce(idsForAllWords, function(intersectionOfAll, idsPerWord, index) {
        // debug(intersectionOfAll, idsPerWord, index)
        return _.intersection(intersectionOfAll, idsPerWord)
    })

    // debug(results)
    return new Promise(function(resolve, reject){
        resolve(results)
    })
    // return results
}