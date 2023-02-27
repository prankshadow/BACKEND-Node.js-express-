const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const PostModel = require('../models/post_models');
const { body, validationResult } = require('express-validator');

// ROUTER 1 :-> Add all the sales.
router.post('/addsales', fetchuser, [
    body('productName', 'Enter a valid productName').isLength({ min: 3 }),
    body('quantity', 'Enter a valid quantity'),
    body('amount', 'Enter a valid amount'),

], async (req, res) => {

    try {
        const { productName, quantity, amount } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const sale = new PostModel({
            productName, quantity, amount, user: req.user.id
        })

        const savedSale = await sale.save() //saves the entries
        res.json(savedSale);

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error. Unable to add entries.")
    }
});


// ROUTER 2 :-> Get all the sales.
router.get('/totalrevenue', fetchuser, async (req, res) => {
    try {
        const total = await PostModel.find({ user: req.user.id });
        res.json(total);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error. Unable to add entries.")
    }
});

// ROUTER 3 :-> Update the entry. 
router.put('/updatesale/:id', fetchuser, [
    body('productName', 'Enter a valid productName'),
    body('quantity', 'Enter a valid quantity'),
    body('amount', 'Enter a valid amount')
], async (req, res) => {
    const { productName, quantity, amount } = req.body;

    try {

        //Create new entry
        const newSale = {};
        if (productName) {
            newSale.productName = productName
        }
        if (quantity) {
            newSale.quantity = quantity
        }
        if (amount) {
            newSale.amount = amount
        }

        //Find the sale an update it
        let sale = await PostModel.findById(req.params.id);
        if (!sale) {
            res.status(404).send("Not Found")
        }

        if (sale.user.toString() !== req.user.id) {   //toString() give the id of this note
            return res.status(401).send("Not allowed");
        }

        sale = await PostModel.findByIdAndUpdate(req.params.id, { $set: newSale }, { new: true })
        res.json({ sale });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error. Unable to add entries.")
    }

})

// ROUTER 4 :-> Delete the entry. 
router.delete('/deletesale/:id', fetchuser, async (req, res) => {

    try {
        //Find the sale an delete it
        let sale = await PostModel.findById(req.params.id);
        if (!sale) {
            return res.status(404).send("Not Found")
        }

        //Allow deletion onlu user owns this note
        if (sale.user.toString() !== req.user.id) {   //toString() give the id of this note
            return res.status(401).send("Not allowed");
        }

        sale = await PostModel.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note as been successfully deleted", sale: sale });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error. Unable to add entries.")
    }

})


module.exports = router;