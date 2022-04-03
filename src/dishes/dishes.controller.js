const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function hasText(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;

  if (
    name &&
    description &&
    price &&
    price > 0 &&
    Number.isInteger(price) &&
    image_url
  ) {
    return next();
  } else if (!name) {
    next({ status: 400, message: "name" });
  } else if (!description) {
    next({ status: 400, message: "description" });
  } else if (!price || price <= 0 || !Number.isInteger(price)) {
    next({ status: 400, message: "price" });
  } else if (!image_url) {
    next({ status: 400, message: "image_url" });
  } else {
    next({ status: 400, message: "error" });
  }
}

function validateId(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;

  if (!req.body.data.id || req.body.data.id === "") {
    return next();
  } else if (req.body.data.id != res.locals.dishId.id) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${req.body.data.id}, Route: ${res.locals.dishId.id}`,
    });
  } else {
    return next();
  }
}

// LIST
function list(req, res) {
  res.json({ data: dishes });
}

// POST request
function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    name,
    description,
    price,
    image_url,
    id: dishes.length + 1,
  };
  dishes.push(newDish);
 
  res.status(201).json({ data: newDish });
}

// GET request
function dishExists(req, res, next) {

  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (foundDish) {
    res.locals.dishId = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}

function read(req, res) {
  res.json({ data: res.locals.dishId });
}

// PUT request
function update(req, res) {
  const { data: { id, name, description, price, image_url } = {} } = req.body;

  const updateDish = {
    id: res.locals.dishId.id,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };

  res.json({ data: updateDish });
}

module.exports = {
  create: [hasText, create],
  read: [dishExists, read],
  update: [dishExists, hasText, validateId, update],
  list,
};
