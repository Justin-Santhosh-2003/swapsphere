const Item = require("../models/Item");
const ExchangeRequest = require("../models/ExchangeRequest");

/**
 * SwapSphere — Graph-Based Barter Matching Engine
 *
 * APPROACH:
 *  1. Load all relevant items from MongoDB.
 *  2. Build an explicit directed preference graph (adjacency list):
 *       graph[itemId] = Set { itemId, itemId, ... }
 *     An edge  A → B  exists when item A's owner has a preference
 *     whose category/subcategory matches item B.
 *  3. Traverse the graph to detect:
 *       • 2-way cycles  (A → B  AND  B → A)  — Direct matches
 *       • 3-way cycles  (A → B → C → A)       — Three-way trade rings
 *  4. Return { directMatches, threeWayMatches } to the API.
 *
 * WHY A GRAPH:
 *  Modelling items and preferences as a directed graph makes the barter
 *  matching problem a standard cycle-detection problem in graph theory.
 *  Each node is an item; each directed edge A → B means "the owner of A
 *  wants something in B's category."  A valid trade ring is a closed cycle
 *  in this graph where every participant benefits.
 */
async function findMatchesForUser(userId) {

    // ── Step 0: Identify items locked in active exchange requests ────────────
    const activeRequests = await ExchangeRequest.find({
        status: { $in: ["PENDING", "ACCEPTED"] }
    }).select("offeredItemId requestedItemId");

    const busyItemIds = new Set();
    activeRequests.forEach((req) => {
        if (req.offeredItemId)   busyItemIds.add(req.offeredItemId.toString());
        if (req.requestedItemId) busyItemIds.add(req.requestedItemId.toString());
    });

    // ── Step 1: Load items from MongoDB ─────────────────────────────────────
    const allUserItems = await Item.find({ ownerId: userId, status: "AVAILABLE" })
        .populate("categoryId", "name icon")
        .populate("exchangePreferences.categoryId", "name");

    const userItems = allUserItems.filter(
        (item) => !busyItemIds.has(item._id.toString())
    );

    if (!userItems.length) return { directMatches: [], threeWayMatches: [] };

    const allOtherItems = await Item.find({
        ownerId: { $ne: userId },
        status: "AVAILABLE"
    })
        .limit(300)
        .populate("ownerId", "fullName profilePicture location averageRating")
        .populate("categoryId", "name icon")
        .populate("exchangePreferences.categoryId", "name");

    const otherItems = allOtherItems.filter(
        (item) => !busyItemIds.has(item._id.toString())
    );

    // All graph nodes = user's items + other available items
    const allItems = [...userItems, ...otherItems];

    // itemId → full Mongoose document (used when formatting output)
    const itemMap = new Map();
    allItems.forEach((item) => itemMap.set(item._id.toString(), item));

    // ── Step 2: Build directed preference graph (adjacency list) ────────────
    //
    //   graph[A] = Set { B, C, ... }
    //
    //   Edge A → B is added when item A has at least one exchange preference
    //   whose category (and optional subcategory) matches item B.
    //   Edges between items owned by the same user are excluded — you cannot
    //   barter with yourself.
    //
    const graph = {}; // { itemId: Set<itemId> }

    const addEdge = (fromId, toId) => {
        if (!graph[fromId]) graph[fromId] = new Set();
        graph[fromId].add(toId);
    };

    // O(1) edge existence check using the Set
    const hasEdge = (fromId, toId) =>
        graph[fromId] ? graph[fromId].has(toId) : false;

    // Returns true when itemA has a preference satisfied by itemB
    const preferenceMatches = (itemA, itemB) => {
        if (!itemA.exchangePreferences?.length) return false;
        return itemA.exchangePreferences.some((pref) => {
            const prefCatId = pref.categoryId?._id
                ? pref.categoryId._id.toString()
                : pref.categoryId?.toString();
            const bCatId = itemB.categoryId?._id
                ? itemB.categoryId._id.toString()
                : itemB.categoryId?.toString();
            if (prefCatId && prefCatId !== bCatId) return false;
            if (pref.subcategory &&
                pref.subcategory.toLowerCase() !== itemB.subcategory?.toLowerCase())
                return false;
            return true;
        });
    };

    // Build all edges in the graph
    for (const itemA of allItems) {
        const idA  = itemA._id.toString();
        const ownA = (itemA.ownerId?._id || itemA.ownerId).toString();

        for (const itemB of allItems) {
            const idB  = itemB._id.toString();
            const ownB = (itemB.ownerId?._id || itemB.ownerId).toString();

            if (idA === idB || ownA === ownB) continue;

            if (preferenceMatches(itemA, itemB)) {
                addEdge(idA, idB);
            }
        }
    }

    // ── Step 3a: Detect 2-way cycles — Direct Matches ────────────────────────
    //
    //   A direct (2-way) match exists when:
    //     edge A → B  AND  edge B → A  both exist in the graph
    //   i.e. both owners mutually want what the other has.
    //
    const directMatches = [];
    const directKeys    = new Set(); // prevents duplicate (A,B) / (B,A) cards

    for (const myItem of userItems) {
        const myId = myItem._id.toString();

        for (const otherItem of otherItems) {
            const otherId = otherItem._id.toString();

            if (hasEdge(myId, otherId) && hasEdge(otherId, myId)) {
                const key = [myId, otherId].sort().join("_");
                if (!directKeys.has(key)) {
                    directKeys.add(key);
                    directMatches.push({
                        myItem: {
                            _id:         myItem._id,
                            title:       myItem.title,
                            images:      myItem.images,
                            category:    myItem.categoryId?.name,
                            subcategory: myItem.subcategory,
                            condition:   myItem.condition
                        },
                        otherItem: {
                            _id:         otherItem._id,
                            title:       otherItem.title,
                            images:      otherItem.images,
                            category:    otherItem.categoryId?.name,
                            subcategory: otherItem.subcategory,
                            condition:   otherItem.condition,
                            owner:       otherItem.ownerId
                        }
                    });
                }
            }
        }
    }

    // ── Step 3b: Detect 3-way cycles — Three-Way Trade Rings ─────────────────
    //
    //   A 3-way ring exists when:
    //     edge A → B  AND  edge B → C  AND  edge C → A
    //   where A is one of the current user's items and B, C belong to two
    //   different other users.
    //
    //   Pairs that already form a direct 2-way match are skipped to avoid
    //   offering a 3-way suggestion where a simpler direct swap exists.
    //
    const threeWayMatches       = [];
    const usedInThreeWayItemIds = new Set(); // each item appears in at most one ring

    for (const itemA of userItems) {
        const idA = itemA._id.toString();
        if (usedInThreeWayItemIds.has(idA) || !graph[idA]) continue;

        for (const idB of graph[idA]) {                     // A → B edge
            if (usedInThreeWayItemIds.has(idB)) continue;
            if (hasEdge(idB, idA)) continue;                 // skip: A↔B is direct

            const itemB = itemMap.get(idB);
            if (!itemB || !graph[idB]) continue;

            for (const idC of graph[idB]) {                  // B → C edge
                if (usedInThreeWayItemIds.has(idC)) continue;
                if (idC === idA || idC === idB) continue;

                const itemC = itemMap.get(idC);
                if (!itemC) continue;

                // B and C must belong to different owners
                const ownB = (itemB.ownerId?._id || itemB.ownerId).toString();
                const ownC = (itemC.ownerId?._id || itemC.ownerId).toString();
                if (ownB === ownC) continue;

                // Skip if B↔C or C↔A are themselves direct 2-way pairs
                if (hasEdge(idC, idB)) continue;
                if (hasEdge(idA, idC) && hasEdge(idC, idA)) continue;

                // Close the ring: C → A must exist
                if (hasEdge(idC, idA)) {
                    // ✅ Valid 3-way cycle: A → B → C → A
                    usedInThreeWayItemIds.add(idA);
                    usedInThreeWayItemIds.add(idB);
                    usedInThreeWayItemIds.add(idC);

                    threeWayMatches.push({
                        itemA: { _id: itemA._id, title: itemA.title, images: itemA.images, ownerName: "You" },
                        itemB: { _id: itemB._id, title: itemB.title, images: itemB.images, owner: itemB.ownerId },
                        itemC: { _id: itemC._id, title: itemC.title, images: itemC.images, owner: itemC.ownerId }
                    });
                    break; // one ring per itemA is sufficient
                }
            }

            if (usedInThreeWayItemIds.has(idA)) break;
        }
    }

    return { directMatches, threeWayMatches };
}

module.exports = { findMatchesForUser };
