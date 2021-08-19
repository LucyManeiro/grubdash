const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//-------------------MIDDLEWARE-------------------------------


//checks to see if deliverTo property present 
function hasDeliverToProperty(req, res, next){
  const {data: {deliverTo} = {}} = req.body;
  if(deliverTo){
    return next()
  }
  next({
    status: 400, 
    message: "Order must include a deliverTo"
  })
};


//checks for mobileNumber property in order
function hasMobileNumberProperty(req, res, next){
  const {data: {mobileNumber}={}} = req.body;
  if(mobileNumber){
    return next();
  }
  next({
    status: 400, 
    message: "Order must include a mobileNumber"
  })
};
 
//checks for dishes property 
function hasDishesProperty(req, res, next){
  const {data: {dishes} ={}}= req.body;
  if(dishes){
    return next();
  }
  next({
    status: 400, 
    message: "Order must include a dish"
  })
};

//checks whether list of dishes is an array
function dishesIsArray(req, res, next){
  const {data: {dishes}={}} = req.body;
  if(Array.isArray(dishes)){
    return next();
  }
  next({
    status: 400, 
    message: "Order must include at least one dish"
  })
}


//checks that dishes array not empty
function dishArrayNotEmpty(req, res, next){
  const {data: {dishes}={}} = req.body;
  if(dishes.length>0){
    return next();
  }
  next({
    status: 400, 
    message: "Order must include at least one dish"
  })
};

//first checks to make sure requested order exists
function orderExists(req, res, next){
  const {orderId} = req.params;
  const foundOrder = orders.find((order)=> 
    order.id===orderId
  )
  if(foundOrder){
    res.locals.order = foundOrder;
    next();
  }
    return next({
      status: 404, 
      message: `Order does not exist: ${orderId}`
    })
  }
  
//checks whether quantity of dishes valid
function dishQuantityValidation(req, res, next){
  const {data: {dishes}={}} = req.body
  dishes.forEach((dish, index)=> {
    if(!dish.quantity || dish.quantity<=0 || !Number.isInteger(dish.quantity)){
      next({
        status: 400, 
        message: `Dish ${index} must have a quantity that is an integer greater than 0`
      })
    }
  })
  next()
};

//checks for valid status
function validateStatus(req, res, next){
  const {data: {status}={}}= req.body;
  if(!status || !status.length)
    return next({
      status: 400, 
      message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
    })
  if(status==="delivered"){
    next({
      status: 400, 
      message: "A delivered order cannot be changed"
    })
  }
  if(status==="invalid"){
    next({
      status: 400, 
      message: "An order with invalid status cannot be changed"
    })
  }
  next();
  }

//checks whether orderId from params matches the requested order
function orderIdMatches(req, res,next){
  const {orderId} = req.params;
  const {id} = req.body.data;
  if(orderId !==id && id){
      return next({
      status: 400, 
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
    })
   }
  next();
  }

//-------------------handler functions-------------------
function read(req, res){
  res.json({data: res.locals.order})
};

function update(req, res){
  const {orderId} = req.params;
  const matchingOrder = res.locals.order;
  const {data: {deliverTo, mobileNumber, status, dishes} ={}} = req.body;
  matchingOrder.deliverTo = deliverTo;
  matchingOrder.mobileNumber = mobileNumber;
  matchingOrder.status = status;
  matchingOrder.dishes = dishes;
  res.json({data: matchingOrder})
}

function list(req, res){
  res.json({data: orders})
};

function destroy(req, res, next){
  const {orderId} = req.params;
  const foundOrder = res.locals.order;
  const index = orders.findIndex((order)=> order.id===orderId);
  if (index > -1){
    orders.splice(index, 1);
  }
  if(foundOrder.status==="pending"){
    res.sendStatus(204)
  } else {
    next({
      status: 400, 
      message: "An order cannot be deleted unless it is pending"
    })
  }
}


function create(req, res) {
  const { data: { id } = {} } = req.body;
  const { data: { deliverTo } = {} } = req.body;
  const { data: { mobileNumber } = {} } = req.body;
  const { data: { status } = {} } = req.body;
  const { data: { dishes } = {} } = req.body;

  const newOrder = {
    id: {nextId},
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};
 
module.exports = {
  list,
  create: [hasDeliverToProperty, hasMobileNumberProperty, hasDishesProperty, dishesIsArray, dishArrayNotEmpty, dishQuantityValidation, create],
  read: [orderExists, read],
  update: [orderExists, orderIdMatches, validateStatus, hasDeliverToProperty, hasMobileNumberProperty, hasDishesProperty, dishesIsArray, dishArrayNotEmpty, dishQuantityValidation, update], 
  delete: [orderExists, destroy]
}
