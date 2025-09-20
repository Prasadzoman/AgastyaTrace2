require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const User = require("./model/user");
const Collector = require("./model/collection");
const Transport = require("./model/transporter");
const Processing = require("./model/processing");
const LabTesting = require("./model/lab");
const QRCode = require("qrcode");

const app = express();
const cors = require("cors");

// ------------------ MIDDLEWARE ------------------
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ------------------ AUTH ROUTES ------------------

// Signup
app.post("/signup", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    User.register({ username, role }, password, (err, user) => {
      if (err) return res.status(500).json({ message: err.message });

      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: err.message });
        return res.status(201).json({
          message: "User registered",
          user: { id: user._id, username, role },
        });
      });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!user)
      return res
        .status(400)
        .json({ message: info?.message || "Invalid credentials" });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: err.message });
      return res.json({ message: "Login successful", user });
    });
  })(req, res, next);
});

// Logout
app.post("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out successfully" });
  });
});

// Get current user
app.get("/me", (req, res) => {
  if (!req.isAuthenticated())
    return res.status(401).json({ message: "Not authenticated" });
  res.json({ user: req.user });
});

// ------------------ PRODUCT CHAIN ROUTES ------------------

// Collector submission
app.post("/collector", async (req, res) => {
  try {
    if (!req.isAuthenticated())
      return res.status(401).json({ message: "Not authenticated" });

    const collectorData = {
      ...req.body,
      userId: req.user._id, // logged-in collector
    };

    const collector = await Collector.create(collectorData);

    const qrData = collector._id.toString();
    const qrCodeURL = await QRCode.toDataURL(qrData);

    res
      .status(201)
      .json({ message: "Collector record created", collector, qrCodeURL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Transport submission
app.post("/transport", async (req, res) => {
  try {
    if (!req.isAuthenticated())
      return res.status(401).json({ message: "Not authenticated" });

    const transport = await Transport.create({
      ...req.body,
      transporter: req.user._id, // logged-in transporter
    });

    res.status(201).json({ message: "Transport recorded", transport });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Processing submission
app.post("/processing", async (req, res) => {
  try {
    if (!req.isAuthenticated())
      return res.status(401).json({ message: "Not authenticated" });

    const { collectorId, receivedQuantityKg, processedQuantityKg, processingType, location } = req.body;

    if (!collectorId || !receivedQuantityKg || !processedQuantityKg || !processingType || !location?.lat || !location?.lng)
      return res.status(400).json({ message: "All required fields must be provided" });

    const processing = await Processing.create({
      collectorId,
      processor: req.user._id, // logged-in processor
      receivedQuantityKg,
      processedQuantityKg,
      processingType,
      location,
    });

    res.status(201).json({ message: "Processing recorded", processing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Lab Testing submission
app.post("/labtesting", async (req, res) => {
  try {
    if (!req.isAuthenticated())
      return res.status(401).json({ message: "Not authenticated" });

    const { collectorId, testedQuantityKg, testType, result, certificateLinks, location } = req.body;

    if (!collectorId || !testedQuantityKg || !testType || !result || !location?.lat || !location?.lng)
      return res.status(400).json({ message: "All required fields must be provided" });

    const labTest = await LabTesting.create({
      collectorId,
      labTechnician: req.user._id, // logged-in lab technician
      testedQuantityKg,
      testType,
      result,
      certificateLinks,
      location,
    });

    const qrData = `LabTestID:${labTest._id}`;
    const qrCodeURL = await QRCode.toDataURL(qrData);

    res.status(201).json({ message: "Lab test recorded", labTest, qrCodeURL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Trace product chain
/*
app.get("/trace/:id", async (req, res) => {
  try {
    const collector = await Collector.findById(req.params.id).populate("userId", "username");
    if (!collector) return res.status(404).json({ message: "Collector not found" });

    const transport = await Transport.find({ collectorId: collector._id }).populate("transporter", "username");
    const processing = await Processing.findOne({ collectorId: collector._id }).populate("processor", "username");
    const lab = await LabTesting.findOne({ collectorId: collector._id }).populate("labTechnician", "username");

    res.json({ collector, transport, processing, lab });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
*/
// Trace full chain by LabTest ID
app.get("/trace/lab/:id", async (req, res) => {
  try {
    // Strip prefix if present
    let labId = req.params.id;
    if (labId.startsWith("LabTestID:")) {
      labId = labId.replace("LabTestID:", "");
    }

    // Find lab test by proper ObjectId
    const lab = await LabTesting.findById(labId).populate("labTechnician", "username");
    if (!lab) return res.status(404).json({ message: "Lab test not found" });

    const collector = await Collector.findById(lab.collectorId).populate("userId", "username");
    if (!collector) return res.status(404).json({ message: "Collector not found" });

    const transport = await Transport.find({ collectorId: collector._id }).populate("transporter", "username");
    const processing = await Processing.findOne({ collectorId: collector._id }).populate("processor", "username");

    res.json({ lab, collector, transport, processing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ------------------ START SERVER ------------------
app.listen(5000, () => console.log("Server running on port 5000"));
