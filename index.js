require("dotenv").config();
const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const { parse } = require("dotenv");

const app = express();
app.use(express.json());

// 📌 สร้างการเชื่อมต่อฐานข้อมูลแต่ละตัวโดยใช้ SQLite แต่ละไฟล์
const sequelizeCat = new Sequelize({
    dialect: "sqlite",
    storage: "./Database/cat_shop.db", // ฐานข้อมูลสำหรับตาราง cat
    logging: false, // ปิด log ของ sequelize
});


// 📌 ตรวจสอบการเชื่อมต่อฐานข้อมูล
async function checkDatabaseConnection() {
    try {
        await sequelizeCat.authenticate();
        // await sequelizeEmployee.authenticate();
        // await sequelizeOrder.authenticate();
        // await sequelizeDetail.authenticate();
        // await sequelizeCustomer.authenticate();
        console.log("🎉 Database connection successful!");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        process.exit(1); // หากไม่สามารถเชื่อมต่อได้ให้หยุดการทำงาน
    }
}

// 📌 สร้างโมเดลต่างๆ
const Cat = sequelizeCat.define("cat", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    breed: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    availability: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Available",
    },
});

const Order = sequelizeCat.define("order", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    customer_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cat_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    unitPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    order_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    total_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    }
});

// const OrderDetail = sequelizeCat.define("order_detail", {
//     detail_id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//     },
//     order_id: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     cat_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     quantity: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//     },
//     unitPrice: {
//         type: DataTypes.FLOAT,
//         allowNull: false,
//     },
// });

const Customer = sequelizeCat.define("customer", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isNumeric: true,
        },
    }
});

const Breed = sequelizeCat.define("breed", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
});

// 📌 สร้างตารางในฐานข้อมูล
sequelizeCat.sync({ force: false });
// sequelizeEmployee.sync({ force: false });
// sequelizeOrder.sync({ force: false });
// sequelizeDetail.sync({ force: false });
// sequelizeCustomer.sync({ force: false });

// 📌 Routes สำหรับจัดการ API ของแต่ละโมเดล

// 📌 Cats Routes
app.get("/cats", async (req, res) => {
    try {
        const cats = await Cat.findAll();
        res.json(cats);
    } catch (err) {
        console.error("Error fetching cats:", err);
        res.status(500).send(err);
    }
});
app.get("/cats/:id", async (req, res) => {
    try {
        const cats = await Cat.findByPk(req.params.id);
        res.json(cats);
    } catch (err) {
        console.error("Error fetching cats:", err);
        res.status(500).send(err);
    }
});
app.post("/cats", async (req, res) => {
    await Cat.create(req.body).then((cat) => {
        res.send(req.body);
    }).catch((err) => {
        res.status(500).send(err);
    });
});
app.put("/cats/:id", async (req, res) => {
    try {
        const cat = await Cat.findByPk(req.params.id);
        if (!cat) {
            return res.status(404).send("Cat not found");
        }
        await cat.update(req.body);
        res.json(cat);
    } catch (err) {
        console.error("Error updating cat:", err);
        res.status(500).send(err);
    }
});
app.delete("/cats/:id", async (req, res) => {
    try {
        const cat = await Cat.findByPk(req.params.id);
        if (!cat) {
            return res.status(404).send("Cat not found");
        }
        await cat.destroy();
        res.status(204).send();
    } catch (err) {
        console.error("Error deleting cat:", err);
        res.status(500).send(err);
    }
});
app.get("/cats/edit/:id", async (req, res) => {
    try {
        const cats = await Cat.findByPk(req.params.id);
        if (!cats) {
            return res.status(404).send("Cat not found");
        }
        const cat = cats.dataValues;
        res.json(cat);  // ส่งข้อมูล cat ไปที่ view (ejs หรือ html)
    } catch (err) {
        console.error("Error fetching cat:", err);
        res.status(500).send(err);
    }
});

// Customers Routes
app.get("/customers", async (req, res) => {
    try {
        const response = await Customer.findAll();
        res.json(response);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send(err);
    }
});
app.get("/customers/:id", async (req, res) => {
    try {
        const response = await Customer.findByPk(req.params.id);
        res.json(response);
    } catch (err) {
        console.error("Error fetching items:", err);
        res.status(500).send(err);
    }
});
app.post("/customers", async (req, res) => {
    await Customer.create(req.body).then((item) => {
        res.send(req.body);
    }).catch((err) => {
        res.status(500).send(err);
    });
});
app.put("/customers/:id", async (req, res) => {
    try {
        const response = await Customer.findByPk(req.params.id);
        if (!response) {
            return res.status(404).send("Item not found");
        }
        await response.update(req.body);
        res.json(response);
    } catch (err) {
        console.error("Error updating item:", err);
        res.status(500).send(err);
    }
});
app.delete("/customers/:id", async (req, res) => {
    try {
        const response = await Customer.findByPk(req.params.id);
        if (!response) {
            return res.status(404).send("Item not found");
        }
        await response.destroy();
        res.status(204).send();
    } catch (err) {
        console.error("Error deleting item:", err);
        res.status(500).send(err);
    }
});

app.get("/orders", async (req, res) => {
    try {
        const orders = await Order.findAll()
        res.json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).send(err);
    }
});
app.get("/orders/:id", async (req, res) => {
    try {
        const response = await Order.findByPk(req.params.id);
        res.json(response);
    } catch (err) {
        console.error("Error fetching items:", err);
        res.status(500).send(err);
    }
});
app.post("/orders", async (req, res) => {
    try {
        const {cat, customer, quantity, unitPrice } = req.body;

        if (!cat || !customer || !quantity || !unitPrice) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        const resCustomer = await Customer.findByPk(customer);
        const resCat = await Cat.findByPk(cat);

        const customer_id = resCustomer.id;
        const customer_name = resCustomer.username;
        const cat_id = resCat.id;
        const cat_name = resCat.name;
        const total_amount = parseInt(quantity) * parseFloat(unitPrice);
        
        const newOrder = await Order.create({
            customer_id,
            customer_name,
            cat_id,
            cat_name,
            quantity,
            unitPrice,
            total_amount
        });

        res.status(201).json(newOrder);

    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).send(err);
    }
});
app.put("/orders/:order_id", async (req, res) => {
    try {
        const { order_id } = req.params;
        const { cat, customer, quantity, unitPrice } = req.body;
        const order = await Order.findByPk(order_id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const resCustomer = await Customer.findByPk(customer);
        const resCat = await Cat.findByPk(cat);

        order.customer_id = resCustomer.id || order.customer_id;
        order.customer_name = resCustomer.name || order.customer_name;
        order.cat_id = resCat.id || order.cat_id;
        order.cat_name = resCat.name || order.cat_name;
        order.quantity = quantity || order.quantity;
        order.unitPrice = unitPrice || order.unitPrice;
        order.total_amount = parseInt(quantity) * parseFloat(unitPrice)
        await order.save();
        res.json(order);
    } catch (err) {
        console.error("Error updating order:", err);
        res.status(500).send(err);
    }
});
app.delete("/orders/:order_id", async (req, res) => {
    try {
        const { order_id } = req.params;
        const order = await Order.findByPk(order_id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        await order.destroy();
        res.json({ message: "Order deleted successfully" });
    } catch (err) {
        console.error("Error deleting order:", err);
        res.status(500).send(err);
    }
});
app.get("/orders/edit/:order_id", async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.order_id);
        if (!order) {
            return res.status(404).send("Order not found");
        }
        res.render("editOrder", { order });  // ส่งข้อมูล order ไปที่ view
    } catch (err) {
        console.error("Error fetching order:", err);
        res.status(500).send(err);
    }
});

app.get("/breeds", async (req, res) => {
    try {
        const breeds = await Breed.findAll({
            where: {
                is_active: true,
            },
        });
        res.json(breeds);
    } catch (err) {
        console.error("Error fetching breeds:", err);
        res.status(500).send(err);
    }
});
app.get("/breeds/:id", async (req, res) => {
    try {
        const breeds = await Breed.findByPk(req.params.id);
        res.json(breeds);
    } catch (err) {
        console.error("Error fetching breeds:", err);
        res.status(500).send(err);
    }
});
app.post("/breeds", async (req, res) => {
    await Breed.create(req.body).then((breed) => {
        res.send(req.body);
    }).catch((err) => {
        res.status(500).send(err);
    });
});
app.put("/breeds/:id", async (req, res) => {
    try {
        const resBreed = await Breed.findByPk(req.params.id);
        if (!resBreed) {
            return res.status(404).send("Breed not found");
        }
        await resBreed.update(req.body);
        res.json(resBreed);
    } catch (err) {
        console.error("Error updating cat:", err);
        res.status(500).send(err);
    }
});
app.delete("/breeds/:id", async (req, res) => {
    try {
        const resBreed = await Breed.findByPk(req.params.id);
        if (!resBreed) {
            return res.status(404).send("Breed not found");
        }
        await resBreed.destroy();
        res.status(204).send();
    } catch (err) {
        console.error("Error deleting breed:", err);
        res.status(500).send(err);
    }
});
app.get("/breeds/edit/:id", async (req, res) => {
    try {
        const resBreed = await Breed.findByPk(req.params.id);
        if (!resBreed) {
            return res.status(404).send("Breed not found");
        }
        const breed = resBreed.dataValues;
        res.json(breed);
    } catch (err) {
        console.error("Error fetching cat:", err);
        res.status(500).send(err);
    }
});

app.get("/reports", async (req, res) => {
    try {
        const reports = await Order.findAll({
            attributes: [
                [sequelizeCat.literal("DATE(order_date)"), "order_date"],
                [sequelizeCat.fn("SUM", sequelizeCat.col("total_amount")), "total"],
            ],
            group: [sequelizeCat.literal("DATE(order_date)")],
            order: [[sequelizeCat.literal("DATE(order_date)"), "DESC"]],
            raw: true,
        });
        res.json(reports);
    } catch (err) {
        console.error("Error fetching reports:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.get("/reports/detail", async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: "Missing required parameter: date" });
        }

        const reports = await Order.findAll({
            attributes: [
                [sequelizeCat.literal("DATE(order_date)"), "order_date"],
                [sequelizeCat.literal("printf('O%03d', id)"), "order_id"],
                "customer_name",
                "cat_name",
                "quantity",
                "unitPrice",
                "total_amount",
            ],
            where: {
                order_date: {
                    [sequelizeCat.Op.between]: [${date} 00:00:00, ${date} 23:59:59]
                }
            },
            order: [["order_date", "ASC"]],
            raw: true,
        });

        res.json(reports);
    } catch (err) {
        console.error("Error fetching report details:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ตรวจสอบการเชื่อมต่อฐานข้อมูลก่อนเริ่มเซิร์ฟเวอร์
checkDatabaseConnection().then(() => {
    // 📌 Start Server
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`🚀 API running at http://localhost:${port}`));
});