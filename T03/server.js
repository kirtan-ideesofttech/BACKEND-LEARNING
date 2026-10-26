const express = require('express');
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const product = {
    id: 1,
    name: 'Sample Product',
    price: 19.99,
    description: 'This is a sample product for demonstration purposes.',
    category: 'Sample Category',
    stock: 100,
}

app.get('/', (req, res) => {
  res.send('Hello, World!');
}); 
    

app.get('/product/:id', (req, res) => {
  const { id } = req.params;
    if (parseInt(id) === product.id) {
    res.json(product);
    } else {
    res.status(404).json({ message: 'Product not found' });
    }


res.status(200).json(product);

});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 


