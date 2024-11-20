import jwt from 'jsonwebtoken';

export default async (req, res) => {
    if (req.method === 'POST') {
        // Retrieve user's email from request body
        const { email } = req.body;

        // Generate JWT token using the user's email
        const token = jwt.sign({ email }, "siddu", { expiresIn: '6h' });

        // Return the JWT token
        res.status(200).json({ token });
    } else {
        res.status(405).end(); // Method Not Allowed
    }
};
