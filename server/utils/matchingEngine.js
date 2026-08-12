const Item = require("../models/Item");

/**
 * Finds direct (2-way) and 3-way barter match suggestions for a given user.
 */
async function findMatchesForUser(userId) {
    // 1. Get user's available items
    const userItems = await Item.find({
        ownerId: userId,
        status: "AVAILABLE"
    }).populate("categoryId", "name icon").populate("exchangePreferences.categoryId", "name");

    if (!userItems.length) {
        return { directMatches: [], threeWayMatches: [] };
    }

    // 2. Get all other available items in the system
    const otherItems = await Item.find({
        ownerId: { $ne: userId },
        status: "AVAILABLE"
    })
        .populate("ownerId", "fullName profilePicture location averageRating")
        .populate("categoryId", "name icon")
        .populate("exchangePreferences.categoryId", "name");

    const directMatches = [];
    const threeWayMatches = [];

    // Helper: checks if item A's preferences match item B
    const itemMatchesPreference = (itemA, itemB) => {
        if (!itemA.exchangePreferences || !itemA.exchangePreferences.length) return false;

        return itemA.exchangePreferences.some((pref) => {
            const prefCatId = pref.categoryId?._id
                ? pref.categoryId._id.toString()
                : pref.categoryId?.toString();
            const itemBCatId = itemB.categoryId?._id
                ? itemB.categoryId._id.toString()
                : itemB.categoryId?.toString();

            if (prefCatId && prefCatId !== itemBCatId) return false;
            if (pref.subcategory && pref.subcategory.toLowerCase() !== itemB.subcategory?.toLowerCase()) return false;
            return true;
        });
    };

    // --- DIRECT 2-WAY MATCHES ---
    for (const myItem of userItems) {
        for (const otherItem of otherItems) {
            const myWantsOther = itemMatchesPreference(myItem, otherItem);
            const otherWantsMine = itemMatchesPreference(otherItem, myItem);

            if (myWantsOther && otherWantsMine) {
                directMatches.push({
                    myItem: {
                        _id: myItem._id,
                        title: myItem.title,
                        images: myItem.images,
                        category: myItem.categoryId?.name,
                        subcategory: myItem.subcategory
                    },
                    otherItem: {
                        _id: otherItem._id,
                        title: otherItem.title,
                        images: otherItem.images,
                        category: otherItem.categoryId?.name,
                        subcategory: otherItem.subcategory,
                        owner: otherItem.ownerId
                    }
                });
            }
        }
    }

    // --- 3-WAY MATCH CYCLES (User A -> User B -> User C -> User A) ---
    for (const itemA of userItems) { // User A = current user
        for (const itemB of otherItems) {
            if (itemMatchesPreference(itemA, itemB)) {
                // Find a 3rd item (itemC) owned by someone else
                for (const itemC of otherItems) {
                    if (
                        itemC._id.toString() !== itemB._id.toString() &&
                        itemC.ownerId._id.toString() !== itemB.ownerId._id.toString()
                    ) {
                        if (
                            itemMatchesPreference(itemB, itemC) &&
                            itemMatchesPreference(itemC, itemA)
                        ) {
                            threeWayMatches.push({
                                itemA: {
                                    _id: itemA._id,
                                    title: itemA.title,
                                    images: itemA.images,
                                    ownerName: "You"
                                },
                                itemB: {
                                    _id: itemB._id,
                                    title: itemB.title,
                                    images: itemB.images,
                                    owner: itemB.ownerId
                                },
                                itemC: {
                                    _id: itemC._id,
                                    title: itemC.title,
                                    images: itemC.images,
                                    owner: itemC.ownerId
                                }
                            });
                        }
                    }
                }
            }
        }
    }

    return { directMatches, threeWayMatches };
}

module.exports = {
    findMatchesForUser
};
