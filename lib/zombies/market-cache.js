'use strict';

// By using interval value passed from config it wll refresh
// internal items map with items fetched from external api
// if fetch fails then we will use stale(old) data
//
// calling create is not blocking that means that right after cache creation map can be empty,
// until first request to external api finishes
function create(logger, {url, refreshIntervalMs}, httpClient) {

    const items = new Map();

    refreshItems();
    setInterval(refreshItems, refreshIntervalMs)

    function refreshItems() {
        return httpClient.get(url)
            .then( ({data}) => data.items.forEach( item => items.set(item.id, item)))
            .catch( err => {
                logger.error('Could not refresh items, will set store to zero ', err);
                // set items to zero elements?
            });
    }

    function get(id) {
        return items.get(id);
    }

    return {
        get
    }
}

module.exports.create = create;