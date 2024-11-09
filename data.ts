// Data for users table
export const users = [
    { name: 'Alice', lastname: 'alice@example.com' },
    { name: 'Bob', lastname: 'bob@example.com' },
    { name: 'Charlie', lastname: 'charlie@example.com' }
];

// Data for subscribtion table
export const subscribtions = [
    {  price: 10 },
    {  price: 20 },
    {  price: 30 }
];

// Data for usersub table (This will be filled later after user and subscribtion insertions)
export const usersub = [
    { user_id: 1, subscribtion_id: 2},
    { user_id: 2, subscribtion_id: 1 },
    { user_id: 3, subscribtion_id: 3 }
];
