const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));

app.listen("3000", () => {
  console.log("Server is listening");
});

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "delta_app",
  password: "#mohd12saad",
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("<h1>Database is sucked🤡</h1>🤡");
  }
});
app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let data = result;
      res.render("users.ejs", { data });
    });
  } catch (err) {
    res.send("<h1>Database is sucked🤡</h1>🤡");
  }
});

// EDIT USERNAME
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    res.send("<h1>Database is sucked🤡</h1>🤡");
  }
});

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  let { password: formPass, username: newUser } = req.body;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formPass != user.password) {
        res.send("password is incorrect (MOye Moye)");
      } else {
        let q2 = `UPDATE user SET username='${newUser}' WHERE id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    res.send("<h1>Database is sucked🤡</h1>🤡");
  }
});

// DELETE
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("<h1>Database is sucked🤡</h1>🤡");
  }
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  let { email: email, password: formPass } = req.body;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formPass != user.password && email != user.email) {
        res.send("<h1>Eamiland Password is incorrect</h1>");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    res.send("<h1>Database is sucked🤡</h1>🤡");
  }
});

// ADD USER
app.get("/user/new", (req, res) => {
  res.render("addUser.ejs");
});

app.post("/user", (req, res) => {
  const { username, email, password } = req.body;
  const id = uuidv4();

  if (!username || !email || !password) {
    return res.status(400).send("<h1>Please provide all required fields: username, email, password</h1>");
  }

  const query = 'INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)';
  const values = [id, username, email, password];

  try {
    connection.query(query, values, (err, result) => {
      if (err) throw err;
      console.log("User added successfully");
      res.redirect("/user");
    });
  } catch (err) {
    console.error(err);
    res.send("Error adding user to the database");
  }
});



//FOR ADDING DATA IN TABLE
// let q = "INSERT INTO USER(id,username,email,password) VALUES ?";
// let data = [];
// for (let i = 0; i <= 100; i++) {
//   data.push(getRandomUser());
// }

// try {
//   connection.query(q, [data], (err, result) => {
//     if (err) throw err;
//     console.log(result);
//   });
// } catch (err) {
//   console.log(err);
// }
// connection.end();
