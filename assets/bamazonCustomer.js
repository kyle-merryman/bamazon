//SETUP
var mysql = require("mysql");
var inquirer = require("inquirer");

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

//initialize
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  console.log("------------------------------------");
  console.log("* * * * * * * * * * * * * * * * * *");
  //call the prompt function
  readProducts();
});


/*-------------reads-prints-all-data-from-table------------*/
function readProducts() {
    console.log("------------------------------------");
    console.log("Selecting all products...\n");
    console.log("------------------------------------\n");
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
        console.log(res);
      // Log all results of the SELECT statement
        for (i=0; i < res.length; i++) {
            var ID = res[i].item_id;
            var name = res[i].product_name;
            var dept = res[i].department_name;
            var price = res[i].price;
            var amount = res[i].stock_quantity;
            console.log("------------------------------------\n");
            console.log(`${name}, ${price}`);
            console.log(`department: ${dept}`);
            console.log(`product ID: ${ID}\n`);
            if (amount <= 0) {
                console.log("OUT OF STOCK")
            } else {
                console.log(`${amount} left`);
            }
            console.log("------------------------------------\n");
        }
      getById();
    });
}  

/*-------------prompts, will push results into function------------*/

function getById(){
    inquirer.prompt([
        {
            name: "productID",
            type: "input",
            message: "Enter the product ID"
        }, 
        {
            name: "quantity",
            type: "input",
            message: "Enter purchase quantity"
        }
        ]).then(function(answer){
            //console.log(answer);

            var purchased = answer.quantity;
            var id = answer.productID;           

            //console.log(purchased + " , " + id);
            purchase(purchased, id);
            getTotal(purchased, id);
            

        });
    //connection.end();
}


  

/*------------get-product-by-id-&-subtract-----------*/
//subtract inventory
function purchase(purchased, id) {
    connection.query(`SELECT stock_quantity FROM products WHERE item_id=${id}`, function(err, res) {
        //if (err) throw err;
        //console.log(res);

        //get stock_quantity, push into variable
        var oldStock = res[0].stock_quantity;
        //console.log(oldStock);

        //push id into id variable - confusing, right?
        var product = id;
        //console.log(product);

        //if less than zero, redo prompt
        if (oldStock - purchased < 0) {
            console.log("------------------------------------\n");
            console.log("Insufficient quantity!\n");
            console.log("------------------------------------");
            readProducts();
        } else {
            //subtract stock_quantity variable by purchased
            var newStock = oldStock - purchased;
            //console.log(newStock);
            updateStock(newStock, product);
            //connection.end();
        }
    });
}

/*----------update-inventory-in-database---------*/
function updateStock(amount, product) {
    console.log("------------------------------------\n");
    console.log("Updating product availability...\n");
    //console.log(`the id of product is ${product}...`);
    console.log(`${amount} units.\n`);
    console.log("------------------------------------\n");
    
    connection.query(
      "UPDATE products SET ? WHERE ?",
      [
        {
          stock_quantity: amount //variable name from "subtract inventory" section -- equal to inventory minus quantity purchased
        },
        {
          item_id: product //variable name from productID user input -- pushed into this func as a parameter
        }
      ],
      function(err, res) {
        //console.log(res.affectedRows + " products updated!\n");
      }
    );

    //connection.end();
}

/*--------------so-far-so-good-----------------*/


/*------------total-the-purchase-----------*/
function getTotal(amount, product)  {
    connection.query(`SELECT * FROM products WHERE item_id=${product}`, function(err, res) {
        //console.log(res);

        //get stock_quantity, push into variable
        var cost = res[0].price;
        console.log("------------------------------------\n");
        console.log(`You purchased ${amount} unit(s) at $${cost} each.\n`);
        console.log("------------------------------------\n");

        var total = cost * amount;
        console.log(`You have been charged $${total}.\n`);
        console.log("------------------------------------\n");
    });

    connection.end();
    //ask();
}

/*-------prompts-to-redo-or-disconnect-------*/

/*function ask() {
    inquirer.prompt([
    {
        type: 'toggle',
        name: 'value',
        message: "Look at more products? type 'yes' or 'no'",
        initial: true,
        active: 'yes',
        inactive: 'no'
    }
    ]).then(function(answer){
        if (answer == 'yes'){
            console.log("yes");
            readProducts();
        } else if (answer == 'no'){
            console.log("no");
            connection.end();
        }
    });
}*/

/*---------------------------------END-OF-CODE------------------------------------*/








/*-------------TROUBLESHOOTING-------------
LINE 70: `SELECT stock_quantity FROM products WHERE item_id=${id}` not working
    conflict w/ asynchronous? TRY placing call w/i previous getById();
        NO | still "Cannot read property 'item_id' of undefined"
    syntax incorrect? TRY "WHERE item_id IN ${id}"
        NO | still undefined
    remove "WHERE item_id IN ${id}" THEN console.log(res);
        NO | response = "undefined"
    ending connection early? TRY placing "connection.end()" AFTER function;
        YA | response printing!

LINE 83: prints RowDataPacket containing stock_quantity INSTEAD of number itself
    in an object? TRY index [0] to res
        YN | "[]" removed, still "RowDataPacket { stock_quantity: #}"
    nested objects? TRY index[0] to RowDataPacket
        NO | doesn't let me put index.index.index...
    call res.stock_quantity? TRY calling `SELECT * FROM products WHERE item_id=${id}`
        NO | res.stock_quantity = "undefined"
    need index? TRY call index[4] of selected product object
        NO | res[4] = "undefined"
    need to call w/i RowDataPacket? TRY res[0].RowDataPacket[4]
        NO | cannot read property [4] of undefined
    need to Parse object? TRY "console.log(JSON.stringify(res))"
        NO | literally turns the ENTIRE object into a string, character-by-character
    TRY just JSON(res)
        NO | "JSON is not a function"
    need to attach a method to it. TRY JSON.parse(res)
        NO | it is already a JSON object, don't need to/can't parse it
    use index[0] in RowDataPacket then stock_quantity
        NO | res[0].stock_quantity results in "undefined"
    replace * w/ `SELECT stock_quantity FROM products WHERE item_id=${id}`
        YN | prints [ RowDataPacket { stock_quantity: 8000 }]
    TRY including JSON.parse(res);
        NO | it is ALREADY parsed, stringify doesn't work either
    TRY double indexing[0]
        NO | 'undefined'
    WHAT? redoing res[0].stock_quantity WORKED????
        YA | but doesn't make sense, I had literally tested it 4 steps earlier

REMEMBER: code is asynchronous -> "connection.end()" must occur w/i last func. not after last func. callback

LINE 106: id pushed from purchase() to updateStock() is 'undefined'
    TRY console.logging id in purchase() to see where undefined occurs
        YN | id is undefined w/i purchase()
    TRY changing id var so diff than id parameter it is defined by
        YA | works!

LINE 22: affectedRows == undefined when connection.end() is placed outside of THAT function
    TRY commenting it out
        YN* | getTotal WORKS, but still not solved affectedRows, just avoided


LINE 183: prompt occurs before updateStock() and getTotal(), followed by "-----------" ... and no yes/no option
    look over those func.s in how they relate to this func


/*---------------DISABLED-CODE-------------

connection.query(`SELECT * FROM products ${answer.item_id}`, function(err, result) {
    if (err) throw err;
    console.log("----------------------");
    console.log(result.product_name);
    console.log("Cost: " + result.price);
    console.log("Availability: " + result.stock_quantity);
    console.log("----------------------");

    })

//get name 
    connection.query(`SELECT product_name FROM products WHERE item_id=${id}`, function(err, res) {
    });
            //create name var to push into getTotal();
            var name = res[0].product_name;


    Connection.query(`SELECT * FROM products WHERE`, function(err, res) {
                //if (err) throw err;
                console.log(res);
                //console.log(`The id of ${id} = ${res.item_id}`);
                connection.end();
            });
            //connection.end();

*/