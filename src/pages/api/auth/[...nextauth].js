import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: '457787975837-4eatttrk19me9brd7kft9qg0td9jmuc1.apps.googleusercontent.com',
            clientSecret: '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'
        }),
    ]
});


