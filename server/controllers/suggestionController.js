const { findMatchesForUser } = require("../utils/matchingEngine");

exports.getSuggestions = async (req, res) => {
    try {
        const matches = await findMatchesForUser(req.user.id);
        res.status(200).json({
            success: true,
            directMatches: matches.directMatches,
            threeWayMatches: matches.threeWayMatches,
            totalSuggestions: matches.directMatches.length + matches.threeWayMatches.length
        });
    } catch (error) {
        console.error("getSuggestions error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
