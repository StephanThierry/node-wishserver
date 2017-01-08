// if databasehandler_config is missing rename "databasehandler_config.template.js" to "databasehandler_config.js" and change values
var config = require('./databasehandler_config')
var mysql  = require('mysql');

databasehandler = {
  open : function() {
      var connection = mysql.createConnection(config.mysqlconnection);

      connection.connect(function(err) {              // The server is either down
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('Error connecting to db:', err);
        //setTimeout(connectHandler, 2000); // We introduce a delay before attempting to reconnect,
      }   else {
          console.log("Database is connected ... make request on port:3000" );
      }                                 // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        this.open();                         // lost due to either server restart, or a
      } else {                                      // connnection idle timeout (the wait_timeout
        throw err;                                  // server variable configures this)
      }
    });
    return(connection);
  }
}

module.exports = databasehandler;
