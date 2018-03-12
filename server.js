const express = require('express');
const app = express();
const cors = require('cors');
const {CLIENT_ORIGIN, PORT} = require('./config');

//Routers
const {router: restaurantRouter} = require('./restaurant');

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

app.use('/restaurants', restaurantRouter);

app.get('/api/*', (req, res) => {
  res.json({ok: true});
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = {app};