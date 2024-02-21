const express = require("express");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const app = express();

require("./db/conn");
const User = require("./models/user.js");
const Ticket =require("./models/ticket.js")
const TicketDetail=require('./models/ticketdetails.js')



const port = process.env.PORT || 5002;
const static_path = path.join(__dirname, "./public/Frontend");

app.use(express.static(static_path));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Middleware to set the Content-Type header for CSS files
app.use((req, res, next) => {
  if (req.url.endsWith(".css")) {
    res.header("Content-Type", "text/css");
  }
  next();
});
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
    }
  },
}).single("photo"); // "photo" should match the name attribute of your file input field


app.post("/ticketdetail/create", async (req, res) => {
    try {
      upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: "Multer error: " + err.message });
        } else if (err) {
          return res.status(500).json({ error: "Internal Server Error: " + err.message });
        }
  
        const { email,name, description, number,status } = req.body;
        console.log(req.body)
        const slip = req.file ? req.file.buffer.toString("base64") : null;
  
        const newTicketDetail = new TicketDetail({email, name, description, number, slip,status });
        const savedTicketDetail = await newTicketDetail.save();
  
        res.status(201).json(savedTicketDetail);
      });
    } catch (error) {
      console.error("Error creating ticket detail:", error);
      res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
  });

  // Read ticket detail
  app.get("/ticketdetail/getAll", async (req, res) => {
    try {
        const ticketDetails = await TicketDetail.find();
        res.json(ticketDetails);
    } catch (error) {
        console.error("Error fetching all ticket details:", error);
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});

  
  // Update ticket detail
  app.put("/ticketdetail/update/:id", async (req, res) => {
    try {
        const ticketDetail = await TicketDetail.findById(req.params.id);
        if (!ticketDetail) {
            return res.status(404).json({ error: "Ticket detail not found" });
        }
        // Update the status to "verified"
        ticketDetail.status = "verified";
        await ticketDetail.save();
        res.json(ticketDetail);
    } catch (error) {
        console.error("Error updating ticket detail:", error);
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});

  
  // Delete ticket detail
  app.delete("/ticketdetail/delete/:id", async (req, res) => {
    try {
      const deletedTicketDetail = await TicketDetail.findByIdAndDelete(req.params.id);
      if (!deletedTicketDetail) {
        return res.status(404).json({ error: "Ticket detail not found" });
      }
      res.json(deletedTicketDetail);
    } catch (error) {
      console.error("Error deleting ticket detail:", error);
      res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
  });
  



// Route for creating a new ticket
app.post("/ticket/create", async (req, res) => {
  try {
    // Call the upload middleware to handle the file upload
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // Multer error
        return res.status(400).json({ error: "Multer error: " + err.message });
      } else if (err) {
        // Other errors
        return res.status(500).json({ error: "Internal Server Error: " + err.message });
      }

      // Extract the name and description from the request body
      const { name, description } = req.body;

      // If a file was uploaded, access its details from req.file
      const photo = req.file ? req.file.buffer.toString("base64") : null;

      // Create a new ticket with the provided details
      const newTicket = new Ticket({
        name,
        description,
        photo: req.file ? req.file.buffer.toString("base64") : null,
      });

      // Save the new ticket to the database
      const savedTicket = await newTicket.save();

      // Respond with the saved ticket details
      res.status(201).json(savedTicket);
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
});

  

// Route for fetching all tickets
app.get("/ticket/all", cors(), async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
});

app.get("/ticket/:id", cors(), async (req, res) => {
    try {
      const ticketId = req.params.id;
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});


// Route for deleting a ticket by ID
app.delete("/ticket/:id", cors(), async (req, res) => {
  try {
    const id = req.params.id;
    await Ticket.findByIdAndDelete(id);
    res.status(200).send("Ticket deleted successfully");
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

// Route for updating a ticket by ID
app.put("/ticket/:id", cors(), upload, async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description } = req.body;
    let photoData = req.body.photo; 
    if (req.file) {
      photoData = req.file.buffer.toString("base64");
      
    }
    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      {
        name,
        description,
        photoData
      },
      { new: true }
    );
    res.json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});



app.post("/register", cors(), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email is already in use");
    }

    const newUser = new User({
      name,
      email,
      password,
    });

    await newUser.save();

    res.status(201).send("User registered successfully!");
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

app.post("/login", cors(), async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    await User.findOne({ email })
      .then((data) => {
        console.log(data);
        res.redirect("http://localhost:5501/movie/frontend/");
      })
      .catch((err) => {
        console.log(err);
      });

    // if (password !== user.password) {
    //     return res.status(401).send('Invalid email or password');
    // }
   
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(`Internal Server Error: ${err.message}`);
});

app.listen(port, () => {
  console.log(`Server is running at port no ${port}`);
});
