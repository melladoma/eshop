var express = require('express');
var router = express.Router();
const stripe = require('stripe')('sk_test_51LBaJ7KluGGBocoBTk1CsQ6lwXiMkUNHQNQ3SO2nM24BJGq33DQlcbqpwfwbIWaq61mdW4BTbec2Ytk3L8tK5BWg00ifekJ73e');


let dataBike = [{
  name: 'BIKO45',
  image: '/images/bike-1.jpg',
  price: 679,
  index: 0,
},
{
  name: 'ZOOK7',
  image: '/images/bike-2.jpg',
  price: 779,
  index: 1,
},
{
  name: 'LIKO089',
  image: '/images/bike-3.jpg',
  price: 839,
  index: 2,
},
{
  name: 'GEW08',
  image: '/images/bike-4.jpg',
  price: 1249,
  index: 3,
},
{
  name: 'KIWIT',
  image: '/images/bike-5.jpg',
  price: 899,
  index: 4,
},
{
  name: 'NASAY',
  image: '/images/bike-6.jpg',
  price: 1399,
  index: 5,
},
];

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { dataBike });
});



//requete GET ajout au panier et affichage page panier
router.get('/shop', function (req, res, next) {
  let bike = {
    name: req.query.name,
    price: req.query.price,
    image: req.query.image,
    quantity: 1,
  }

  if (typeof req.session.dataCardBike !== 'undefined' && req.session.dataCardBike.length > 0) {
    const isExisting = element => element.name === bike.name
    if (req.session.dataCardBike.findIndex(isExisting) >= 0) {
      let indexToChange = req.session.dataCardBike.findIndex(isExisting);
      req.session.dataCardBike[indexToChange].quantity++
    } else {
      req.session.dataCardBike.push(bike)
    }
  } else {
    req.session.dataCardBike = [bike]
  }

  let totalCmd = 0;
  for (let i = 0; i < req.session.dataCardBike.length; i++) {
    totalCmd = totalCmd + req.session.dataCardBike[i].price * req.session.dataCardBike[i].quantity;
  }
  req.session.totalCmd = totalCmd;

  res.render('shop', { dataCardBike: req.session.dataCardBike, totalCmd: req.session.totalCmd });
});

//requete GET suppression velo
router.get('/delete-shop', function (req, res, next) {

  if (req.session.dataCardBike[req.query.index].quantity > 1) {
    req.session.dataCardBike[req.query.index].quantity--
  } else {
    req.session.dataCardBike.splice(req.query.index, 1);

  }
  let totalCmd = 0;
  for (let i = 0; i < req.session.dataCardBike.length; i++) {
    totalCmd = totalCmd + req.session.dataCardBike[i].price * req.session.dataCardBike[i].quantity;
  }
  req.session.totalCmd = totalCmd;
  res.render('shop', { dataCardBike: req.session.dataCardBike, totalCmd: req.session.totalCmd });
});

//requete POST actualisation quantite via formulaire
router.post('/update-shop', function (req, res) {
  let indice = req.body.index;
  req.session.dataCardBike[indice].quantity = req.body.quantity;
  let totalCmd = 0;
  for (let i = 0; i < req.session.dataCardBike.length; i++) {
    totalCmd = totalCmd + req.session.dataCardBike[i].price * req.session.dataCardBike[i].quantity;
  }
  req.session.totalCmd = totalCmd;
  res.render('shop', {
    dataCardBike: req.session.dataCardBike, totalCmd: req.session.totalCmd
  });
});




// stripe module

router.post('/create-checkout-session', async (req, res) => {
  let listItems = [];
  for (let i = 0; i < req.session.dataCardBike.length; i++) {
    let item =
    {
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${req.session.dataCardBike[i].name}`,
        },
        unit_amount: req.session.dataCardBike[i].price * 100,
      },
      quantity:
        req.session.dataCardBike[i].quantity,
    }
    if (typeof listItems !== 'undefined' && listItems.length > 0) {
      listItems.push(item)
    } else {
      listItems = [item]
    }
  }

  const session = await stripe.checkout.sessions.create({
    line_items: listItems,
    mode: 'payment',
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/cancel',
  });

  res.redirect(303, session.url);
});


router.get('/success', function (req, res, next) {
  res.render('success', {});
});

router.get('/cancel', function (req, res, next) {
  res.render('index', { dataBike });
});


module.exports = router;
