const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const db = new Database(":memory:");

db.exec(`
CREATE TABLE users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT UNIQUE NOT NULL,
 password TEXT NOT NULL,
 email TEXT UNIQUE NOT NULL,
 role TEXT NOT NULL DEFAULT 'user'
);

CREATE TABLE books (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 title TEXT NOT NULL,
 author TEXT NOT NULL,
 price REAL NOT NULL,
 stock INTEGER NOT NULL DEFAULT 10
);

CREATE TABLE orders (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL,
 book_id INTEGER NOT NULL,
 quantity INTEGER NOT NULL DEFAULT 1,
 total REAL NOT NULL
);
`);

const pw = (p) => bcrypt.hashSync(p, 10);

db.prepare(
`INSERT INTO users(username,password,email,role)
 VALUES(?,?,?,?)`
).run(
"alice",
pw("alice123"),
"alice@bookstore.dev",
"user"
);

db.prepare(
`INSERT INTO users(username,password,email,role)
 VALUES(?,?,?,?)`
).run(
"bob",
pw("bob123"),
"bob@bookstore.dev",
"user"
);

db.prepare(
`INSERT INTO users(username,password,email,role)
 VALUES(?,?,?,?)`
).run(
"admin",
pw("supersecret"),
"admin@bookstore.dev",
"admin"
);


db.prepare(
`INSERT INTO books(title,author,price)
VALUES(?,?,?)`
).run(
"The Web Application Hacker's Handbook",
"Stuttard & Pinto",
39.99
);


db.prepare(
`INSERT INTO orders(user_id,book_id,quantity,total)
VALUES(1,1,1,39.99)`
).run();


db.prepare(
`INSERT INTO orders(user_id,book_id,quantity,total)
VALUES(2,1,1,39.99)`
).run();


module.exports = db;