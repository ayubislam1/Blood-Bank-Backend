require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const port = process.env.PORT || 7000;
const cors = require("cors");
const e = require("express");

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
		const Blogs = client.db("Blood_Donation").collection("blogs");
		const UserDonation = client
			.db("Blood_Donation")
			.collection("users-donation");

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
		app.get("/all-users", async (req, res) => {
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

		app.get("/users-donation", async (req, res) => {
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
		app.patch("/all-users/:id", async (req, res) => {
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
			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$set: {
					status: "inprogress",
					donorName: user.displayName,
					donorEmail: user.email,
				},
			};

			const result = await UserDonation.updateOne(filter, updateDoc);
			res.send(result);
		});
		app.put("/users-donation/:id", async (req, res) => {
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

		app.get("/stats-item", async (req, res) => {
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

		app.patch("/blogs/:id/publish", async (req, res) => {
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
		app.patch("/blogs/:id/unpublish", async (req, res) => {
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
