const Category = require("../models/Category");

// Get all categories
exports.getCategories = async (req, res) => {

    try {

        const categories = await Category.find().sort({ name: 1 });

        res.status(200).json({
            success: true,
            categories
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// Create Category
exports.createCategory = async (req, res) => {

    try {

        const {

            name,
            subcategories,
            icon,
            description

        } = req.body;

        if (!name) {

            return res.status(400).json({

                success: false,
                message: "Category name is required."

            });

        }

        const exists = await Category.findOne({

            name: name.trim()

        });

        if (exists) {

            return res.status(400).json({

                success: false,
                message: "Category already exists."

            });

        }

        const category = await Category.create({

            name,
            subcategories,
            icon,
            description

        });

        res.status(201).json({

            success: true,
            message: "Category created successfully.",

            category

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};

// Get Category By ID
exports.getCategoryById = async (req, res) => {

    try {

        const category = await Category.findById(req.params.id);

        if (!category) {

            return res.status(404).json({

                success: false,
                message: "Category not found."

            });

        }

        res.status(200).json({

            success: true,
            category

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};

// Update Category
exports.updateCategory = async (req, res) => {

    try {

        const category = await Category.findByIdAndUpdate(

            req.params.id,

            req.body,

            {

                new: true,
                runValidators: true

            }

        );

        if (!category) {

            return res.status(404).json({

                success: false,
                message: "Category not found."

            });

        }

        res.status(200).json({

            success: true,
            message: "Category updated successfully.",

            category

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};

// Delete Category
exports.deleteCategory = async (req, res) => {

    try {

        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {

            return res.status(404).json({

                success: false,
                message: "Category not found."

            });

        }

        res.status(200).json({

            success: true,
            message: "Category deleted successfully."

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};

