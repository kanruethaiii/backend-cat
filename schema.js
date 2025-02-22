const db = require("./database");

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Customers (
        customer_id TEXT PRIMARY KEY,
        username TEXT,
        firstName TEXT,
        lastName TEXT,
        email TEXT,
        phoneNumber TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Cats (
        cat_id TEXT PRIMARY KEY,
        name TEXT,
        breed TEXT,
        age INTEGER,
        color TEXT,
        price INTEGER,
        availability TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Orders (
        order_id TEXT PRIMARY KEY,
        customer_id TEXT,
        order_date TEXT,
        total_amount INTEGER,
        FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS OrderDetails (
        detail_id TEXT PRIMARY KEY,
        order_id TEXT,
        cat_id TEXT,
        quantity INTEGER,
        unitPrice INTEGER,
        FOREIGN KEY (order_id) REFERENCES Orders(order_id),
        FOREIGN KEY (cat_id) REFERENCES Cats(cat_id)
    )`);
});

console.log("Database tables created.");
