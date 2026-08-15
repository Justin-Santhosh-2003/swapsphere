const Item = require("../models/Item");
const ExchangeRequest = require("../models/ExchangeRequest");

/**
 * Finds direct (2-way) and 3-way barter match suggestions for a given user.
 * Excludes items currently involved in active (PENDING or ACCEPTED) exchange requests.
 */
async function findMatchesForUser(userId) {
    // 0. Find all item IDs currently involved in PENDING or ACCEPTED exchange requests
    const activeRequests = await ExchangeRequest.find({
        status: { $in: ["PENDING", "ACCEPTED"] }
    }).select("offeredItemId requestedItemId");

    const busyItemIds = new Set();
    activeRequests.forEach((req) => {
        if (req.offeredItemId) busyItemIds.add(req.offeredItemId.toString());
        if (req.requestedItemId) busyItemIds.add(req.requestedItemId.toString());
    });

    // 1. Get user's available items (not in active exchanges)
    const allUserItems = await Item.find({
        ownerId: userId,
        status: "AVAILABLE"
    })
        .populate("categoryId", "name icon")
        .populate("exchangePreferences.categoryId", "name");

    const userItems = allUserItems.filter((item) => !busyItemIds.has(item._id.toString()));

    if (!userItems.length) {
        return { directMatches: [], threeWayMatches: [] };
    }

    // 2. Get other available items (not in active exchanges) capped at 300
    const allOtherItems = await Item.find({
        ownerId: { $ne: userId },
        status: "AVAILABLE"
    })
        .limit(300)
        .populate("ownerId", "fullName profilePicture location averageRating")
        .populate("categoryId", "name icon")
        .populate("exchangePreferences.categoryId", "name");

    const otherItems = allOtherItems.filter((item) => !busyItemIds.has(item._id.toString()));

    const directMatches = [];
    const threeWayMatches = [];
    const directKeys = new Set();
    const usedInThreeWayItemIds = new Set();

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

    // Helper: check if two items form a direct 2-way match
    const isDirectMatchPair = (itemX, itemY) => {
        return itemMatchesPreference(itemX, itemY) && itemMatchesPreference(itemY, itemX);
    };

    // --- DIRECT 2-WAY MATCHES ---
    for (const myItem of userItems) {
        for (const otherItem of otherItems) {
            if (isDirectMatchPair(myItem, otherItem)) {
                const key = [myItem._id.toString(), otherItem._id.toString()].sort().join("_");
                if (!directKeys.has(key)) {
                    directKeys.add(key);
                    directMatches.push({
                        myItem: {
                            _id: myItem._id,
                            title: myItem.title,
                            images: myItem.images,
                            category: myItem.categoryId?.name,
                            subcategory: myItem.subcategory,
                            condition: myItem.condition
                        },
                        otherItem: {
                            _id: otherItem._id,
                            title: otherItem.title,
                            images: otherItem.images,
                            category: otherItem.categoryId?.name,
                            subcategory: otherItem.subcategory,
                            condition: otherItem.condition,
                            owner: otherItem.ownerId
                        }
                    });
                }
            }
        }
    }

    // --- 3-WAY MATCHES (User A -> User B -> User C -> User A) ---
    for (const itemA of userItems) {
        if (usedInThreeWayItemIds.has(itemA._id.toString())) continue;

        for (const itemB of otherItems) {
            if (usedInThreeWayItemIds.has(itemB._id.toString())) continue;
            if (!itemMatchesPreference(itemA, itemB)) continue;
            // Skip if A & B form a direct 2-way match
            if (isDirectMatchPair(itemA, itemB)) continue;

            for (const itemC of otherItems) {
                if (usedInThreeWayItemIds.has(itemC._id.toString())) continue;
                if (
                    itemC._id.toString() === itemB._id.toString() ||
                    itemC.ownerId._id.toString() === itemB.ownerId._id.toString()
                ) continue;

                // Skip if B & C or C & A form direct 2-way matches
                if (isDirectMatchPair(itemB, itemC) || isDirectMatchPair(itemC, itemA)) continue;

                if (
                    itemMatchesPreference(itemB, itemC) &&
                    itemMatchesPreference(itemC, itemA)
                ) {
                    // Valid unique 3-way match ring
                    usedInThreeWayItemIds.add(itemA._id.toString());
                    usedInThreeWayItemIds.add(itemB._id.toString());
                    usedInThreeWayItemIds.add(itemC._id.toString());

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
                    break; // Move to next itemA
                }
            }
            if (usedInThreeWayItemIds.has(itemA._id.toString())) break;
        }
    }

    return { directMatches, threeWayMatches };
}

module.exports = {
    findMatchesForUser
};
