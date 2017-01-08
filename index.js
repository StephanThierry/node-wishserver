var app = require("express")();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var databasehandler = require("./databasehandler");
var FileStore = require('session-file-store')(session);
var cors = require('cors');
var helmet = require('helmet');
var connection = databasehandler.open();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(session({
    secret: "1f5caa60-bd8c-4915-9c55-70abb803233c",
    name: "rest.protek.dk",
    resave: true,
    saveUninitialized: true,
    store: new FileStore()
}));
app.get("/people", function (req, res) {
    var test = 44;
    connection.query('SELECT 	person_id, person_name, person_family, person_responsible_person_id	 from people', function (err, rows, fields) {
        output(err, res, rows, "select");
    });
});
app.get("/logintest", function (req, res) {
    var html = '<script>';
    html += 'var xhr = new XMLHttpRequest();';
    html += 'xhr.open("POST", "/login");';
    html += 'xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");';
    html += 'xhr.send(JSON.stringify({"person_password": "nyTest" }));';
    html += '</script> ';
    res.send(html);
});
app.post("/login", function (req, res) {
    var person_password = req.body.person_password;
    if (person_password == null)
        console.log('person_password : null');
    connection.query("SELECT * from people where person_password = ?", person_password, function (err, rows, fields) {
        outputHandler(err, res, rows, "login", req);
    });
});
app.get("/who", function (req, res) {
    console.log('req.session', req.session);
    var person_id = req.session.person_id;
    if (person_id == null)
        console.log('req.session.person_id : null');
    res.send({ 'person_id': person_id });
});
app.get("/wishes", function (req, res) {
    var person_id = parseInt(req.query.person_id);
    if (!isNaN(person_id)) {
        connection.query('SELECT * from wishes where wish_person_id = ?', person_id, function (err, rows, fields) {
            output(err, res, rows, "select");
        });
    }
    else {
        res.send({ "error": "person_id missing in querystring - or is not a number" });
    }
});
app.post("/wishes", function (req, res) {
    var person = req.body.wish_person_id;
    var wish = req.body.wish_description;
    console.log(req.body);
    connection.query('INSERT INTO wishes (wish_person_id, wish_description) VALUES (?,?)', [person, wish], function (err, rows) {
        output(err, res, rows, "insert");
    });
});
app.delete("/wishes", function (req, res) {
    var wish_id = req.body.wish_id;
    connection.query('delete from wishes where wish_id = ?', [wish_id], function (err, rows) {
        output(err, res, rows, "delete");
    });
});
function output(err, res, rows, mode) {
    outputHandler(err, res, rows, mode, null);
}
function outputHandler(err, res, rows, mode, req) {
    res.setHeader('Content-Type', 'application/json');
    if (!err) {
        if (mode == "select" || mode == "delete")
            res.send(rows);
        if (mode == "insert")
            res.send({ 'insertId': rows.insertId });
        if (mode == "login") {
            if (rows[0] != undefined) {
                var person_id = rows[0].person_id;
                res.send({ 'person_id': person_id });
                req.session.person_id = person_id;
                console.log('req.session.person_id set: ', req.session.person_id);
                req.session.save(function (err) {
                });
            }
            else {
                res.send({ 'person_id': -1, 'error': 'notfound' });
            }
        }
        console.log('OK! ', rows);
    }
    else {
        res.send({ err: err });
        console.log('Error while performing Query.', err);
    }
}
app.listen(3000);
//# sourceMappingURL=index.js.map
