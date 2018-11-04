//initialize
var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  //call the prompt function
  readProducts();
});

/*--------------so-far-so-good-----------------*/



/*-------------reads-prints-all-data-from-table------------*/
function readProducts() {
    console.log("Selecting all products...\n");
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      console.log(res);
      connection.end();
    });
}  

/*-------------prompts, will push results into function------------*/

function getById(){
    inquirer.prompt([
        {
        name: "productID",
        type: "input",
        message: "Enter the product ID"
    }]).then(function(answer){
        connection.query(`SELECT * FROM products ${answer.item_id}`, function(err, result) {
            if (err) throw err;
            console.log("----------------------");
            console.log(result.product_name);
            console.log("Cost: " + result.price);
            console.log("Availability: " + result.stock_quantity);
            console.log("----------------------");

    })
    }
    )
    }
    

/*------------get-product-by-id-&-subtract-----------*/
//subtract inventory
//update inventory in database

/*------------total-the-purchase-----------*/
`SELECT * FROM products ${answer.item}`