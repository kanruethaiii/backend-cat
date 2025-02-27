require("dotenv").config();
const express = require("express");
const { Sequelize, DataTypes, json } = require("sequelize");

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
    },
    cat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    console.log(req.body);
    
    //await Cat.create(req.body).then((cat => {
        //res.send(cat);
    //})).catch(err => {
        //res.send(500).send(err);
    //})
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

// 📌 Cat Update Route (แสดงข้อมูลแมวที่จะแก้ไข)
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


// 📌 Employee Routes
// 📌 GET: ดึงข้อมูลพนักงานทั้งหมด
app.get("/employees", async (req, res) => {
    try {
        const employees = await Employee.findAll();
        res.json(employees);
    } catch (err) {
        console.error("Error fetching employees:", err);
        res.status(500).send(err);
    }
});

// 📌 POST: สร้างพนักงานใหม่
app.post("/employees", async (req, res) => {
    try {
        const { username, firstName, lastName, email, phoneNumber } = req.body;
        const newEmployee = await Employee.create({
            username,
            firstName,
            lastName,
            email,
            phoneNumber,
        });
        res.status(201).json(newEmployee);
    } catch (err) {
        console.error("Error creating employee:", err);
        res.status(500).send(err);
    }
});

// 📌 PUT: อัปเดตข้อมูลพนักงาน
app.put("/employees/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { username, firstName, lastName, email, phoneNumber } = req.body;
        const employee = await Employee.findByPk(id);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        employee.username = username || employee.username;
        employee.firstName = firstName || employee.firstName;
        employee.lastName = lastName || employee.lastName;
        employee.email = email || employee.email;
        employee.phoneNumber = phoneNumber || employee.phoneNumber;

        await employee.save();
        res.json(employee);
    } catch (err) {
        console.error("Error updating employee:", err);
        res.status(500).send(err);
    }
});

// 📌 DELETE: ลบพนักงาน
app.delete("/employees/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findByPk(id);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        await employee.destroy();
        res.json({ message: "Employee deleted successfully" });
    } catch (err) {
        console.error("Error deleting employee:", err);
        res.status(500).send(err);
    }
});

// 📌 Employee Update Route (แสดงข้อมูลพนักงานที่จะแก้ไข)
app.get("/employees/edit/:id", async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        if (!employee) {
            return res.status(404).send("Employee not found");
        }
        res.render("editEmployee", { employee });  // ส่งข้อมูล employee ไปที่ view
    } catch (err) {
        console.error("Error fetching employee:", err);
        res.status(500).send(err);
    }
});


// 📌 Order Routes
// 📌 GET: ดึงข้อมูลคำสั่งซื้อทั้งหมด
app.get("/orders", async (req, res) => {
    try {
        const orders = await Order.findAll();
        res.json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).send(err);
    }
});

// 📌 POST: สร้างคำสั่งซื้อใหม่
app.post("/orders", async (req, res) => {
    try {
        const { order_id, customer_id, order_date, total_amount } = req.body;
        const newOrder = await Order.create({
            order_id,
            customer_id,
            order_date,
            total_amount,
        });
        res.status(201).json(newOrder);
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).send(err);
    }
});

// 📌 PUT: อัปเดตข้อมูลคำสั่งซื้อ
app.put("/orders/:order_id", async (req, res) => {
    try {
        const { order_id } = req.params;
        const { customer_id, order_date, total_amount } = req.body;
        const order = await Order.findByPk(order_id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.customer_id = customer_id || order.customer_id;
        order.order_date = order_date || order.order_date;
        order.total_amount = total_amount || order.total_amount;

        await order.save();
        res.json(order);
    } catch (err) {
        console.error("Error updating order:", err);
        res.status(500).send(err);
    }
});

// 📌 DELETE: ลบคำสั่งซื้อ
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

// 📌 Order Update Route (แสดงข้อมูลคำสั่งซื้อที่จะแก้ไข)
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



// 📌 Detail Routes
// 📌 GET: ดึงข้อมูลรายละเอียดคำสั่งซื้อทั้งหมด
app.get("/details", async (req, res) => {
    try {
        const details = await Detail.findAll();
        res.json(details);
    } catch (err) {
        console.error("Error fetching details:", err);
        res.status(500).send(err);
    }
});

app.post("/details", async (req, res) => {
    Detail.create(req.body).then((detail) => {
        console.log (detail);
        res.send(req.body);
       
    }).catch((err) => {
        res.status(500).send(err);
    });
    
});


// 📌 PUT: อัปเดตรายละเอียดคำสั่งซื้อ
app.put("/details/:detail_id", async (req, res) => {
    try {
        const { detail_id } = req.params;
        const { order_id, cat_id, quantity, unitPrice } = req.body;
        const detail = await Detail.findByPk(detail_id);

        if (!detail) {
            return res.status(404).json({ message: "Detail not found" });
        }

        detail.order_id = order_id || detail.order_id;
        detail.cat_id = cat_id || detail.cat_id;
        detail.quantity = quantity || detail.quantity;
        detail.unitPrice = unitPrice || detail.unitPrice;

        await detail.save();
        res.json(detail);
    } catch (err) {
        console.error("Error updating detail:", err);
        res.status(500).send(err);
    }
});

// 📌 DELETE: ลบรายละเอียดคำสั่งซื้อ
app.delete("/details/:detail_id", async (req, res) => {
    try {
        const { detail_id } = req.params;
        const detail = await Detail.findByPk(detail_id);

        if (!detail) {
            return res.status(404).json({ message: "Detail not found" });
        }

        await detail.destroy();
        res.json({ message: "Detail deleted successfully" });
    } catch (err) {
        console.error("Error deleting detail:", err);
        res.status(500).send(err);
    }
});


// ตรวจสอบการเชื่อมต่อฐานข้อมูลก่อนเริ่มเซิร์ฟเวอร์
checkDatabaseConnection().then(() => {
    // 📌 Start Server
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`🚀 API running at http://localhost:${port}`));
});