const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const { User } = require('../models');

const resolvers = {
    Query: {
       me: async (parent, args, context) => {
        if (context.user) {
            const meData = 
                await User.findOne({ _id: context.user._id }).populate('savedBooks')
            return meData;
        }
        throw new AuthenticationError('You are not logged in!');
       }
    },

    Mutation: {
        loginUser: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('No user with this email found!')
            }

            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect password!')
            }

            const token = signToken(user);
            return { token, user }
        },

        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user }
        },

        saveBook: async (parent, { input }, context) => {
            if (context.user){
                const updatedBooks = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: input } },
                    { new: ture }
                );
                return updatedBooks
            }
            throw new AuthenticationError('You are not logged in!')
        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedBooks = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                )
                return updatedBooks; 
            }
            throw new AuthenticationError('You are not logged in!')
        },


    }
};

module.exports = resolvers;