require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express();
const port = process.env.PORT || 7000;
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

		app.post("/all-users", async (req, res) => {
			const users = req.body;
			console.log(users);
			
			const result = await UserCollection.insertOne(users);
			res.send(result);
		});

		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
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
