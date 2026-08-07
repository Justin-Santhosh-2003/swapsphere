const ownerId = "6a7075f6d08a1400a7f10578";

const categories = {
  electronics: "6a7302974dc4a86ae369b76f",
  books: "6a7302a94dc4a86ae369b770",
  furniture: "6a7302bf4dc4a86ae369b771",
  fashion: "6a7302ce4dc4a86ae369b772",
  sports: "6a7302de4dc4a86ae369b773"
};

const conditions = [
  "LIKE_NEW",
  "EXCELLENT",
  "GOOD",
  "FAIR"
];

function randomCondition() {
  return conditions[Math.floor(Math.random() * conditions.length)];
}

const items = [

  // ================= ELECTRONICS =================

  {
    title: "Canon EOS 200D DSLR",
    categoryId: categories.electronics,
    subcategory: "Camera",
    wants: [
      { categoryId: categories.electronics, subcategory: "Laptop", priority: 1 },
      { categoryId: categories.electronics, subcategory: "Mobile", priority: 2 }
    ]
  },

  {
    title: "Sony Alpha A6400",
    categoryId: categories.electronics,
    subcategory: "Camera",
    wants: [
      { categoryId: categories.electronics, subcategory: "Laptop", priority: 1 }
    ]
  },

  {
    title: "MacBook Air M1",
    categoryId: categories.electronics,
    subcategory: "Laptop",
    wants: [
      { categoryId: categories.electronics, subcategory: "Camera", priority: 1 }
    ]
  },

  {
    title: "Dell XPS 13",
    categoryId: categories.electronics,
    subcategory: "Laptop",
    wants: [
      { categoryId: categories.electronics, subcategory: "Mobile", priority: 1 }
    ]
  },

  {
    title: "HP Pavilion Gaming",
    categoryId: categories.electronics,
    subcategory: "Laptop",
    wants: [
      { categoryId: categories.electronics, subcategory: "Camera", priority: 1 }
    ]
  },

  {
    title: "Lenovo ThinkPad",
    categoryId: categories.electronics,
    subcategory: "Laptop",
    wants: [
      { categoryId: categories.electronics, subcategory: "Headphones", priority: 1 }
    ]
  },

  {
    title: "iPhone 13",
    categoryId: categories.electronics,
    subcategory: "Mobile",
    wants: [
      { categoryId: categories.electronics, subcategory: "Laptop", priority: 1 }
    ]
  },

  {
    title: "Samsung Galaxy S23",
    categoryId: categories.electronics,
    subcategory: "Mobile",
    wants: [
      { categoryId: categories.electronics, subcategory: "Camera", priority: 1 }
    ]
  },

  {
    title: "Google Pixel 8",
    categoryId: categories.electronics,
    subcategory: "Mobile",
    wants: [
      { categoryId: categories.electronics, subcategory: "Laptop", priority: 1 }
    ]
  },

  {
    title: "Sony WH-1000XM4",
    categoryId: categories.electronics,
    subcategory: "Headphones",
    wants: [
      { categoryId: categories.electronics, subcategory: "Mobile", priority: 1 }
    ]
  },

  // ================= BOOKS =================

  {
    title: "Atomic Habits",
    categoryId: categories.books,
    subcategory: "Non Fiction",
    wants: [
      { categoryId: categories.books, subcategory: "Fiction", priority: 1 }
    ]
  },

  {
    title: "Clean Code",
    categoryId: categories.books,
    subcategory: "Academic",
    wants: [
      { categoryId: categories.books, subcategory: "Academic", priority: 1 }
    ]
  },

  {
    title: "Harry Potter Collection",
    categoryId: categories.books,
    subcategory: "Fiction",
    wants: [
      { categoryId: categories.books, subcategory: "Comics", priority: 1 }
    ]
  },

  {
    title: "Operating Systems",
    categoryId: categories.books,
    subcategory: "Academic",
    wants: [
      { categoryId: categories.books, subcategory: "Academic", priority: 1 }
    ]
  },

  {
    title: "Data Structures in C",
    categoryId: categories.books,
    subcategory: "Academic",
    wants: [
      { categoryId: categories.books, subcategory: "Non Fiction", priority: 1 }
    ]
  },

  {
    title: "The Pragmatic Programmer",
    categoryId: categories.books,
    subcategory: "Academic",
    wants: [
      { categoryId: categories.books, subcategory: "Academic", priority: 1 }
    ]
  },

  // ================= FURNITURE =================

  {
    title: "Wooden Study Table",
    categoryId: categories.furniture,
    subcategory: "Table",
    wants: [
      { categoryId: categories.furniture, subcategory: "Chair", priority: 1 }
    ]
  },

  {
    title: "Office Chair",
    categoryId: categories.furniture,
    subcategory: "Chair",
    wants: [
      { categoryId: categories.furniture, subcategory: "Table", priority: 1 }
    ]
  },

  {
    title: "Gaming Chair",
    categoryId: categories.furniture,
    subcategory: "Chair",
    wants: [
      { categoryId: categories.furniture, subcategory: "Table", priority: 1 }
    ]
  },

  {
    title: "Sofa Set",
    categoryId: categories.furniture,
    subcategory: "Sofa",
    wants: [
      { categoryId: categories.furniture, subcategory: "Bed", priority: 1 }
    ]
  },

  {
    title: "Queen Size Bed",
    categoryId: categories.furniture,
    subcategory: "Bed",
    wants: [
      { categoryId: categories.furniture, subcategory: "Sofa", priority: 1 }
    ]
  },

  {
    title: "Bookshelf",
    categoryId: categories.furniture,
    subcategory: "Table",
    wants: [
      { categoryId: categories.furniture, subcategory: "Chair", priority: 1 }
    ]
  },

  // ================= FASHION =================

  {
    title: "Leather Jacket",
    categoryId: categories.fashion,
    subcategory: "Men",
    wants: [
      { categoryId: categories.fashion, subcategory: "Shoes", priority: 1 }
    ]
  },

  {
    title: "Men's Hoodie",
    categoryId: categories.fashion,
    subcategory: "Men",
    wants: [
      { categoryId: categories.fashion, subcategory: "Accessories", priority: 1 }
    ]
  },

  {
    title: "Women's Handbag",
    categoryId: categories.fashion,
    subcategory: "Women",
    wants: [
      { categoryId: categories.fashion, subcategory: "Accessories", priority: 1 }
    ]
  },

  {
    title: "Sneakers",
    categoryId: categories.fashion,
    subcategory: "Shoes",
    wants: [
      { categoryId: categories.fashion, subcategory: "Men", priority: 1 }
    ]
  },

  {
    title: "Formal Shirt",
    categoryId: categories.fashion,
    subcategory: "Men",
    wants: [
      { categoryId: categories.fashion, subcategory: "Shoes", priority: 1 }
    ]
  },

  {
    title: "Sports Watch",
    categoryId: categories.fashion,
    subcategory: "Accessories",
    wants: [
      { categoryId: categories.fashion, subcategory: "Men", priority: 1 }
    ]
  },

  // ================= SPORTS =================

  {
    title: "Cricket Bat",
    categoryId: categories.sports,
    subcategory: "Cricket",
    wants: [
      { categoryId: categories.sports, subcategory: "Football", priority: 1 }
    ]
  },

  {
    title: "Football",
    categoryId: categories.sports,
    subcategory: "Football",
    wants: [
      { categoryId: categories.sports, subcategory: "Cricket", priority: 1 }
    ]
  },

  {
    title: "Badminton Racket",
    categoryId: categories.sports,
    subcategory: "Cycling",
    wants: [
      { categoryId: categories.sports, subcategory: "Gym", priority: 1 }
    ]
  },

  {
    title: "Gym Bench",
    categoryId: categories.sports,
    subcategory: "Gym",
    wants: [
      { categoryId: categories.sports, subcategory: "Cycling", priority: 1 }
    ]
  },

  {
    title: "Mountain Bike",
    categoryId: categories.sports,
    subcategory: "Cycling",
    wants: [
      { categoryId: categories.sports, subcategory: "Gym", priority: 1 }
    ]
  },

  {
    title: "Yoga Mat",
    categoryId: categories.sports,
    subcategory: "Gym",
    wants: [
      { categoryId: categories.sports, subcategory: "Cycling", priority: 1 }
    ]
  }

];

const itemData = items.map(item => ({
  ownerId,
  title: item.title,
  description: `${item.title} in excellent working condition. Looking for a fair exchange.`,
  categoryId: item.categoryId,
  subcategory: item.subcategory,
  condition: randomCondition(),
  images: [],
  videos: [],
  exchangePreferences: item.wants
}));

module.exports = itemData;