require("dotenv").config();
const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
app.use(express.json());

// 📌 สร้างการเชื่อมต่อฐานข้อมูลแต่ละตัวโดยใช้ SQLite แต่ละไฟล์
const sequelizeCat = new Sequelize({
    dialect: "sqlite",
    storage: "./Database/cat_shop.db", // ฐานข้อมูลสำหรับตาราง cat
    logging: false, // ปิด log ของ sequelize
});

const sequelizeEmployee = new Sequelize({
    dialect: "sqlite",
    storage: "./Database/employees.db", // ฐานข้อมูลสำหรับตาราง employee
    logging: false,
});

const sequelizeOrder = new Sequelize({
    dialect: "sqlite",
    storage: "./Database/order.db", // ฐานข้อมูลสำหรับตาราง order
    logging: false,
});

const sequelizeDetail = new Sequelize({
    dialect: "sqlite",
    storage: "./Database/detail.db", // ฐานข้อมูลสำหรับตาราง detail
    logging: false,
});

// 📌 ตรวจสอบการเชื่อมต่อฐานข้อมูล
async function checkDatabaseConnection() {
    try {
        await sequelizeCat.authenticate();
        await sequelizeEmployee.authenticate();
        await sequelizeOrder.authenticate();
        await sequelizeDetail.authenticate();
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

const Employee = sequelizeEmployee.define("employee", {
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

const Order = sequelizeOrder.define("order", {
    order_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
    },
    customer_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    order_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    total_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});

const Detail = sequelizeDetail.define("detail", {
    detail_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Order,
            key: "order_id",
        },
    },
    cat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cat,
            key: "id",
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    unitPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

// 📌 สร้างตารางในฐานข้อมูล
sequelizeCat.sync({ force: false });
sequelizeEmployee.sync({ force: false });
sequelizeOrder.sync({ force: false });
sequelizeDetail.sync({ force: false });

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

app.post("/cats", async (req, res) => {
    try {
        const newCat = await Cat.create(req.body);
        res.status(201).json(newCat);
    } catch (err) {
        console.error("Error creating cat:", err);
        res.status(500).send(err);
    }
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

// 📌 Employee Routes
app.get("/employees", async (req, res) => {
    try {
        const employees = await Employee.findAll();
        res.json(employees);
    } catch (err) {
        console.error("Error fetching employees:", err);
        res.status(500).send(err);
    }
});

// 📌 Order Routes
app.get("/orders", async (req, res) => {
    try {
        const orders = await Order.findAll();
        res.json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).send(err);
    }
});

// 📌 Detail Routes
app.get("/details", async (req, res) => {
    try {
        const details = await Detail.findAll();
        res.json(details);
    } catch (err) {
        console.error("Error fetching details:", err);
        res.status(500).send(err);
    }
});

// ตรวจสอบการเชื่อมต่อฐานข้อมูลก่อนเริ่มเซิร์ฟเวอร์
checkDatabaseConnection().then(() => {
    // 📌 Start Server
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`🚀 API running at http://localhost:${port}`));
});