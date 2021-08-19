const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass


//----------------------MIDDLEWARE-----------------------

//checks to see if dish exists
function dishExists (req, res, next){
  const {dishId} = req.params;
  const foundDish = dishes.find((dish)=> dish.id===dishId);
  if(foundDish===undefined){next({
     status: 404, 
     message: `Dish does not exist: ${dishId}`})}
  res.locals.dish = foundDish;
   next();
};

//checks to make sure dish has a name
function hasName(req, res, next){
  const {data: {name} = {}} = req.body;
  if(name){
    return next();
  }
  next({status: 400, message: "Dish must include a name"});
};

//checks to make sure dish has a description
function hasDescription(req, res, next){
  const {data: {description} = {}} = req.body;
  if(description){
    return next();
  }
  next({status: 400, message: "Dish must include a description"});
};

//checks to make sure price for dish is present
function hasPrice(req, res, next){
  const {data: {price} = {}} = req.body;
  if(price && price >0){
    return next();
  }
  next({status: 400, message: "Dish must include a price"});
};

//checks to make sure price is an integer
function priceIsAnInteger(req, res, next){
  const {data: {price}= {}} = req.body;
  if(Number.isInteger(price)){
    return next();
  }
  next({
    status: 400, 
    message: "Dish must have a price that is an integer greater than 0"
  })
}

//checks to make sure price is greater than 0
function priceGreaterThanZero(req, res, next){
  const {data: {price}= {}} = req.body;
  if (price=== 0 || price < 0){
    next({
      status: 400, 
      message: "Dish must have a price that is an integer greater than 0"
    })
  }
  return next();
}

//checks to make sure dish has an image
function hasImage(req, res, next){
  const {data: {image_url} = {}} = req.body;
  if(image_url){
    return next();
  }
  next({status: 400, message: "Dish must include a image_url"});
};

//checks to make sure that the dish.id and route params match
function dishIdMatch(req, res, next){
  const {data: {id} = {}} = req.body;
  const {dishId}= req.params;
  if(dishId===id || !id){
    return next();
  }
  next({
    status: 400, 
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
  })
};

//--------------------handler functions----------------
function list(req, res){
  res.json({data: dishes})
};

function read(req, res){
  res.json({data: res.locals.dish})
};

function create(req, res) {
  const { data: { name } = {} } = req.body;
  const { data: { description } = {} } = req.body;
  const { data: { image_url } = {} } = req.body;
  const { data: { price } = {} } = req.body;

  const newDish = {
    id: {nextId},
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
};


function update(req, res){
  const dish = res.locals.dish;
  const{data: {name, description, price, image_url}= {}} = req.body;
  dish.name=name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;
  res.json({data: dish})
}



module.exports = {
  list, 
  create: [hasName, hasDescription, hasPrice, priceIsAnInteger, priceGreaterThanZero, hasImage, create],
  read: [dishExists, read], 
  update: [dishExists, dishIdMatch, hasName, hasDescription, hasPrice, priceIsAnInteger, priceGreaterThanZero, hasImage, update]
}