/******************************************************************************
* 
*  ITE5315 – Assignment 2
*  I declare that this assignment is my own work in accordance with Humber Academic Policy.   
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including web sites) or distributed to other students.
* 
*  Name: Trusha Mavani
*  Student ID: N01709841
*  Date: 2025-10-26
* 
******************************************************************************/

const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Handlebars setup
app.engine('.hbs', engine({ 
  extname: '.hbs',
  helpers: {
    // Custom helper to replace empty names with "N/A"
    checkName: function(name) {
      return name && name.trim() !== '' ? name : 'N/A';
    },
    // Helper to check if name is empty for highlighting
    isEmptyName: function(name, options) {
      if (!name || name.trim() === '') {
        return options.fn(this);
      }
      return options.inverse(this);
    },
    // Helper to format price
    formatPrice: function(price) {
      return price ? price.trim() : 'N/A';
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Load JSON data
let airbnbData = [];
async function loadData() {
  try {
    const data = await fs.readFile('./airbnb_with_photos.json', 'utf8');
    airbnbData = JSON.parse(data);
    console.log(`Loaded ${airbnbData.length} records`);
  } catch (error) {
    console.error('Error loading data:', error);
  }
}
loadData();

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Airbnb Data Explorer',
    name: 'Trusha Mavani',
    studentId: 'N01709841'
  });
});

app.get('/users', (req, res) => {
  res.send('respond with a resource');
});

// Assignment 1 Routes integrated with Handlebars

// Display all data
app.get('/allData', (req, res) => {
  const dataToShow = airbnbData.slice(0, 100); // Show first 100 records
  res.render('allData', {
    title: 'All Airbnb Data',
    data: dataToShow,
    totalRecords: airbnbData.length,
    displayedRecords: dataToShow.length
  });
});

// Search by invoice ID
app.get('/search/invoiceID/', (req, res) => {
  res.render('searchInvoice', {
    title: 'Search by Invoice ID'
  });
});

app.post('/search/invoiceID/', (req, res) => {
  const invoiceId = req.body.invoiceId;
  const record = airbnbData.find(item => item.id === invoiceId);
  
  res.render('searchInvoice', {
    title: 'Search by Invoice ID',
    searchTerm: invoiceId,
    result: record,
    hasSearched: true
  });
});

// Search by product line
app.get('/search/produceLine/', (req, res) => {
  res.render('searchProductLine', {
    title: 'Search by Product Line'
  });
});

app.post('/search/produceLine/', (req, res) => {
  const productLine = req.body.productLine;
  const results = airbnbData.filter(item => 
    item.property_type && item.property_type.toLowerCase().includes(productLine.toLowerCase())
  );
  
  res.render('searchProductLine', {
    title: 'Search by Product Line',
    searchTerm: productLine,
    results: results.slice(0, 50),
    totalFound: results.length,
    hasSearched: true
  });
});

// View Data routes
app.get('/viewData', (req, res) => {
  const dataToShow = airbnbData.slice(0, 100);
  res.render('viewData', {
    title: 'View All Data',
    data: dataToShow,
    totalRecords: airbnbData.length,
    displayedRecords: dataToShow.length
  });
});

app.get('/viewData/clean', (req, res) => {
  const cleanData = airbnbData.filter(item => 
    item.NAME && item.NAME.trim() !== ''
  ).slice(0, 100);
  
  res.render('viewData', {
    title: 'Clean Data (No Empty Names)',
    data: cleanData,
    totalRecords: airbnbData.length,
    displayedRecords: cleanData.length,
    isClean: true
  });
});

// Price range search
app.get('/viewData/price', (req, res) => {
  res.render('priceSearch', {
    title: 'Search by Price Range'
  });
});

app.post('/viewData/price', (req, res) => {
  const minPrice = parseFloat(req.body.minPrice) || 0;
  const maxPrice = parseFloat(req.body.maxPrice) || Number.MAX_SAFE_INTEGER;
  
  const results = airbnbData.filter(item => {
    const price = parseFloat(item.price?.replace(/[^\d.]/g, '')) || 0;
    return price >= minPrice && price <= maxPrice;
  }).slice(0, 100);
  
  res.render('priceSearch', {
    title: 'Search by Price Range',
    minPrice,
    maxPrice,
    results,
    totalFound: results.length,
    hasSearched: true
  });
});

// 404 Error handler
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Error', 
    message: 'Wrong Route - Page Not Found' 
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});