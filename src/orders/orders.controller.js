const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass


function orderExists(req, res, next) {
  //const dishId = Number(req.params.dishId);
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  } else {
    next({
      status: 404,
      message: `Order does not exist: ${orderId}`,
    });
  }
}

function validateOrder(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  if (
    deliverTo &&
    deliverTo !== "" &&
    mobileNumber &&
    mobileNumber !== "" > 0 &&
    Array.isArray(dishes) &&
    dishes.length > 0
  ) {
    return next();
  } else if (!deliverTo || deliverTo === "") {
    next({ status: 400, message: "deliverTo" });
  } else if (!mobileNumber || mobileNumber === "") {
    next({ status: 400, message: "mobileNumber" });
  } else if (!Array.isArray(dishes) || dishes.length === 0) {
    next({ status: 400, message: "dishes" });
  } else {
    next({ status: 400, message: "error" });
  }
}

function validateOrderQuantity(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  dishes.map((dish, index) => {
    if (
      !dish.quantity ||
      dish.quantity === 0 ||
      Number.isInteger(dish.quantity) === false
    ) {
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });

  return next();
}

function validateId(req, res, next) {
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;

  if (!req.body.data.id || req.body.data.id === "") {
    return next();
  }
  if (req.body.data.id != res.locals.order.id) {
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${req.body.data.id}, Route: ${res.locals.order.id}`,
    });
  } else {
    return next();
  }
}

// check status is valid before updating
function validateStatus(req, res, next) {
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;

  if (!status || status === "" || status === "invalid") {

    next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  } else if (status === "delivered") {
    next({ status: 400, message: "A delivered order cannot be changed" });
  } else {
    return next();
  }
}

// check order is pending before allowing deletion
function isPending(req, res, next) {
  const { status } = res.locals.order;
  if (status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }
  next();
}

// LIST
function list(req, res) {
  res.json({ data: orders });
}

// POST request
function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  const newOrder = {
    deliverTo,
    mobileNumber,
    status,
    dishes,
    id: orders.length + 1,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

// PUT request
function update(req, res) {
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;

  const updateOrder = {
    id: res.locals.order.id,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  };

  res.json({ data: updateOrder });
}

// GET request
function read(req, res) {
  res.json({ data: res.locals.order });
}

function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  if (index > -1) {
    orders.splice(index, 1);
  }
  res.sendStatus(204);
}

module.exports = {
  create: [validateOrder, validateOrderQuantity, create],
  update: [
    orderExists,
    validateOrder,
    validateOrderQuantity,
    validateStatus,
    validateId,
    update,
  ],
  read: [orderExists, read],
  delete: [orderExists, isPending, destroy],
  list
};
