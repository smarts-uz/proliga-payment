import { Client } from 'pg';
import { users, subscribtions, usersub } from './data';  // Import the data from data.ts

// PostgreSQL connection details
const client = new Client({
    user: 'postgres',      // Replace with your PostgreSQL username
    host: 'localhost',      // Replace with your PostgreSQL host
    database: 'test',    // Replace with your PostgreSQL database name
    password: '0200',  // Replace with your PostgreSQL password
    port: 5432,             // Default PostgreSQL port
});

// Insert data function
async function insertData() {
    try {
        // Connect to PostgreSQL
        await client.connect();

        // 1. Insert data into the users table and get the inserted ids
        const userIds = [];
        for (let user of users) {
            const insertUserQuery = `
                INSERT INTO users (name, lastname)
                VALUES ($1, $2)
                RETURNING id;
            `;
            const res = await client.query(insertUserQuery, [user.name, user.lastname]);
            const userId = res.rows[0].id;  // Getting the generated user id
            userIds.push(userId);  // Store user id for future use
        }

        // 2. Insert data into the subscribtion table and get the inserted ids
        const subscribtionIds = [];
        for (let subscribtion of subscribtions) {
            const insertSubscribtionQuery = `
                INSERT INTO subscribtion (price)
                VALUES ($1)
                RETURNING id;
            `;
            const res = await client.query(insertSubscribtionQuery, [subscribtion.price]);
            const subscribtionId = res.rows[0].id;  // Getting the generated subscribtion id
            subscribtionIds.push(subscribtionId);  // Store subscribtion id for future use
        }

        // 3. Insert data into the usersub table using the user_ids and subscribtion_ids
        for (let subscriptionData of usersub) {
            const insertUsersubQuery = `
                INSERT INTO usersub (user_id, subs_id)
                VALUES ($1, $2);
            `;
            const userId = userIds[subscriptionData.user_id - 1];  // Get user_id using the index (adjusting for zero-indexed arrays)
            const subscribtionId = subscribtionIds[subscriptionData.subscribtion_id - 1];  // Get subscribtion_id similarly
            await client.query(insertUsersubQuery, [userId, subscribtionId]);
        }

    } catch (error) {
        console.error("Error inserting data:", error);
    } finally {
        // Close the connection
        await client.end();
    }
}

// Call the insertData function to add data
insertData();
