require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const port = process.env.PORT || 7000;
const stripe = require("stripe")(process.env.Payment_Key);
const jwt = require("jsonwebtoken");
const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ds3da.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(process.env.DB_USER);

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});
async function run() {
	try {
		await client.connect();
		const UserCollection = client.db("Blood_Donation").collection("all-users");
		const FundCollection = client.db("Blood_Donation").collection("funds");
		const Blogs = client.db("Blood_Donation").collection("blogs");
		const UserDonation = client
			.db("Blood_Donation")
			.collection("users-donation");

		const verifyToken = (req, res, next) => {
			if (!req.headers.authorization) {
				return res.status(401).send({ message: "forbidden" });
			}
			const token = req.headers.authorization.split(" ")[1];
			jwt.verify(token, process.env.Access_Key, (err, decoded) => {
				if (err) {
					return res.status(401).send({ message: "forbidden" });
				}
				req.decoded = decoded;
				next();
			});
		};

		const verifyAdmin = async (req, res, next) => {
			const email = req.decoded.email;
			const query = { email: email };
			const user = await UserCollection.findOne(query);
			const isAdmin = user?.role === "admin";
			if (!isAdmin) {
				res.status(403).send({ message: "forbidden" });
			}
			next();
		};

		app.post("/all-users", async (req, res) => {
			const users = req.body;

			const result = await UserCollection.insertOne(users);
			res.send(result);
		});
		app.post("/users-donation", async (req, res) => {
			const users = req.body;

			const result = await UserDonation.insertOne(users);
			res.send(result);
		});
		app.get("/all-users/:email", async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const result = await UserCollection.find(query).toArray();
			res.send(result);
		});
		app.get("/all-users", verifyToken, verifyAdmin, async (req, res) => {
			const result = await UserCollection.find().toArray();
			res.send(result);
		});
		app.put("/all-users/:id", async (req, res) => {
			const user = req.body;

			const id = req.params.id;

			const filter = { _id: new ObjectId(id) };

			const updateDoc = {
				$set: {
					role: user.role,
				},
			};
			const result = await UserCollection.updateOne(filter, updateDoc);
			res.send(result);
		});

		app.patch("/all-users/:id/status", async (req, res) => {
			const user = req.body;

			const id = req.params.id;

			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$set: {
					status: user.status,
				},
			};
			const result = await UserCollection.updateOne(filter, updateDoc);
			res.send(result);
		});

		app.get("/users-donation", verifyToken, async (req, res) => {
			const result = await UserDonation.find().toArray();
			res.send(result);
		});
		app.get("/users-donation/:id", async (req, res) => {
			const id = req.params.id;

			const filter = { _id: new ObjectId(id) };
			const result = await UserDonation.find(filter).toArray();
			res.send(result);
		});
		app.get("/users-donation/:email", async (req, res) => {
			const email = req.params.email;

			const query = { email: email };

			const result = await UserDonation.find(query).toArray();
			res.send(result);
		});

		app.delete("/users-donation/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await UserDonation.deleteOne(query);
			res.send(result);
		});
		app.patch("/all-users/:id", verifyToken, async (req, res) => {
			const user = req.body;
			const id = req.params.id;
			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$set: {
					name: user.name,
					email: user.email,
					district: user.district,
					upazila: user.upazila,
					bloodGroup: user.bloodGroup,
				},
			};

			const result = await UserCollection.updateOne(filter, updateDoc);
			res.send(result);
		});

		app.patch("/users-donation/:id", async (req, res) => {
			const user = req.body;
			const id = req.params.id;
			console.log(user);
			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$set: {
					status: "inprogress",
					donorName: user.name,
					donorEmail: user.email,
				},
			};

			const result = await UserDonation.updateOne(filter, updateDoc);
			res.send(result);
		});
		app.patch(
			"/users-donation/:id/status",
			verifyToken,
			verifyAdmin,
			async (req, res) => {
				const user = req.body;
				const id = req.params.id;
				const filter = { _id: new ObjectId(id) };
				const updateDoc = {
					$set: {
						status: user.status,
					},
				};

				const result = await UserDonation.updateOne(filter, updateDoc);
				res.send(result);
			}
		);
		app.put("/users-donation/:id", verifyToken, async (req, res) => {
			const user = req.body;
			const id = req.params.id;
			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$set: {
					name: user.recipientName,
					email: user.email,
					district: user.district,
					upazila: user.upazila,
					bloodGroup: user.bloodGroup,
					donationDate: user.donationDate,
					donationTime: user.donationTime,
				},
			};

			const result = await UserDonation.updateOne(filter, updateDoc);
			res.send(result);
		});

		app.get("/stats-item", verifyToken, async (req, res) => {
			const users = await UserCollection.estimatedDocumentCount();
			const donors = await UserDonation.estimatedDocumentCount();
			res.send({ users, donors });
		});

		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);

		app.post("/blogs", async (req, res) => {
			const blogs = req.body;
			console.log(blogs);
			const result = await Blogs.insertOne(blogs);

			res.send(result);
		});

		app.get("/blogs", async (req, res) => {
			const result = await Blogs.find().toArray();
			res.send(result);
		});

		app.patch("/blogs/:id/publish", verifyToken, async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const updateDoc = {
				$set: {
					status: "published",
				},
			};
			const result = await Blogs.updateOne(query, updateDoc);
			res.send(result);
		});
		app.patch("/blogs/:id/unpublish", verifyToken, async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const updateDoc = {
				$set: {
					status: "draft",
				},
			};
			const result = await Blogs.updateOne(query, updateDoc);
			res.send(result);
		});
		app.delete("/blogs/:id", verifyToken, verifyAdmin, async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };

			const result = await Blogs.deleteOne(query);
			res.send(result);
		});

		app.get("/all-users/admin/:email", verifyToken, async (req, res) => {
			const email = req.params.email;

			if (email != req.decoded.email) {
				return res.status(403).send({ message: "unauthorized Access" });
			}
			const query = { email: email };
			const user = await UserCollection.findOne(query);
			let isAdmin = false;
			if (user) {
				isAdmin = user?.role === "admin";
			}
			res.send({ isAdmin });
		});
		app.get("/all-users/volunteer/:email", verifyToken, async (req, res) => {
			const email = req.params.email;

			if (email != req.decoded.email) {
				return res.status(403).send({ message: "unauthorized Access" });
			}
			const query = { email: email };
			const user = await UserCollection.findOne(query);
			let isVolunteer = false;
			if (user) {
				isVolunteer = user?.role === "volunteer";
			}
			res.send({ isVolunteer });
		});
		app.get("/all-users/donor/:email", verifyToken, async (req, res) => {
			const email = req.params.email;

			if (email != req.decoded.email) {
				return res.status(403).send({ message: "unauthorized Access" });
			}
			const query = { email: email };
			const user = await UserCollection.findOne(query);
			let isDonor = false;
			if (user) {
				isDonor = user?.role === "donor";
			}
			res.send({ isDonor });
		});
		app.post("/search-donors", async (req, res) => {
			const data = req.body;

			const query = {
				bloodGroup: data.bloodGroup,
				district: data.district,
				upazila: data.upazila,
			};

			const donor = await UserCollection.find(query).toArray();

			res.send(donor);
		});

		app.post("/jwt", async (req, res) => {
			const user = req.body;
			const token = jwt.sign(user, process.env.Access_Key, { expiresIn: "2h" });
			res.send({ token });
		});
		app.post("/create-payment-intent", async (req, res) => {
			const { price } = req.body;
			const amount = parseInt(price * 100);

			const paymentIntent = await stripe.paymentIntents.create({
				amount: amount,
				currency: "usd",
				payment_method_types: ["card"],
			});
			res.send({
				clientSecret: paymentIntent.client_secret,
			});
		});

		app.post("/payments", async (req, res) => {
			const payment = req.body;

			const result = await FundCollection.insertOne(payment);

			res.send({ result });
		});

		app.get("/payments",verifyToken, async (req, res) => {
			
			
			const result = await FundCollection.find().toArray();
			res.send(result);
		});
	} finally {
		//   // Ensures that the client will close when you finish/error
		//   await client.close();
	}
}
run().catch(console.dir);

app.get("/", async (req, res) => {
	res.send("hello world");
});

app.listen(port, () => {
	console.log(`Example app listening the port ${port}`);
});
