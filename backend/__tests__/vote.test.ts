import * as VoteService from '../services/vote.service';
import Votes, { CommentVotes } from '../schemas/votes.model';
import Notes from '../schemas/notes.model';
import { feedbacksModel } from '../schemas/comments.model';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

jest.mock('../schemas/votes.model');
jest.mock('../schemas/notes.model');
jest.mock('../schemas/comments.model');

describe('VoteService functions', () => {
    let mongoServer: MongoMemoryServer;

    // Start an in-memory MongoDB server
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        // Connect to the in-memory database
        await mongoose.connect(mongoUri);
    });

    // Clean up and stop the in-memory server
    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('isUpvoted', () => {
        it('should return true if vote exists', async () => {
            (Votes.findOne as jest.Mock).mockResolvedValue({});

            const result = await VoteService.isUpvoted('6709b85a63a247780563d9f9', '67e6b6c2d6b821eadfc837ce');
            expect(Votes.findOne).toHaveBeenCalledWith({
                $and: [
                    { docType: { $ne: 'feedback' } },
                    { noteDocID: '6709b85a63a247780563d9f9' },
                    { voterStudentDocID: '67e6b6c2d6b821eadfc837ce' }
                ]
            });
            expect(result).toBe(true);
        });

        it('should return false if no vote found', async () => {
            (Votes.findOne as jest.Mock).mockResolvedValue(null);

            const result = await VoteService.isUpvoted('6709b85a63a247780563d9f9', '67e6b6c2d6b821eadfc837ce');
            expect(result).toBe(false);
        });
    });

    describe('isCommentUpVoted', () => {
        it('should return true if comment vote exists', async () => {
            (CommentVotes.findOne as jest.Mock).mockResolvedValue({});

            const result = await VoteService.isCommentUpVoted({
                feedbackDocID: '681bcac1c81ab83eacd6efbb',
                voterStudentDocID: '67e6b6c2d6b821eadfc837ce'
            });

            expect(CommentVotes.findOne).toHaveBeenCalledWith({
                $and: [
                    { docType: { $eq: 'feedback' } },
                    { feedbackDocID: '681bcac1c81ab83eacd6efbb' },
                    { voterStudentDocID: '67e6b6c2d6b821eadfc837ce' }
                ]
            });
            expect(result).toBe(true);
        });

        it('should return false if no comment vote found', async () => {
            (CommentVotes.findOne as jest.Mock).mockResolvedValue(null);

            const result = await VoteService.isCommentUpVoted({
                feedbackDocID: '681bcac1c81ab83eacd6efbb',
                voterStudentDocID: '67e6b6c2d6b821eadfc837ce'
            });

            expect(result).toBe(false);
        });
    });

    describe('deleteVote', () => {
        it('should delete post vote and decrement count', async () => {
            (Votes.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
            (Notes.updateOne as jest.Mock).mockResolvedValue({});

            const result = await VoteService.deleteVote({ noteDocID: '6709b85a63a247780563d9f9', voterStudentDocID: '67e6b6c2d6b821eadfc837ce' }, 'post');

            expect(Votes.deleteOne).toHaveBeenCalledWith({ noteDocID: '6709b85a63a247780563d9f9', voterStudentDocID: '67e6b6c2d6b821eadfc837ce' });
            expect(Notes.updateOne).toHaveBeenCalledWith({ _id: '6709b85a63a247780563d9f9' }, { $inc: { upvoteCount: -1 } });
            expect(result).toEqual({ ok: true });
        });

        it('should delete comment vote and decrement count', async () => {
            (Votes.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
            (feedbacksModel.updateOne as jest.Mock).mockResolvedValue({});

            const result = await VoteService.deleteVote(
                { noteDocID: '6709b85a63a247780563d9f9', voterStudentDocID: '67e6b6c2d6b821eadfc837ce' },
                'comment',
                '681bcac1c81ab83eacd6efbb'
            );

            expect(Votes.deleteOne).toHaveBeenCalledWith({
                noteDocID: '6709b85a63a247780563d9f9',
                voterStudentDocID: '67e6b6c2d6b821eadfc837ce',
                docType: 'feedback'
            });
            expect(feedbacksModel.updateOne).toHaveBeenCalledWith(
                { _id: '681bcac1c81ab83eacd6efbb' },
                { $inc: { upvoteCount: -1 } }
            );
            expect(result).toEqual({ ok: true });
        });

        it('should return ok false on delete failure', async () => {
            (Votes.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

            const result = await VoteService.deleteVote(
                { noteDocID: '6709b85a63a247780563d9f9', voterStudentDocID: '67e6b6c2d6b821eadfc837ce' },
                'comment'
            );
            expect(result).toEqual({ ok: false });
        });

        it('should handle exception and return ok false', async () => {
            (Votes.deleteOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            const result = await VoteService.deleteVote(
                { noteDocID: '6709b85a63a247780563d9f9', voterStudentDocID: '67e6b6c2d6b821eadfc837ce' },
                'comment'
            );
            expect(result).toEqual({ ok: false });
        });
    });

    describe('addVote', () => {
        it('should add post vote and increment count', async () => {
            (Votes.create as jest.Mock).mockResolvedValue({});
            (Notes.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

            const result = await VoteService.addVote(
                { noteDocID: '6709b85a63a247780563d9f9', voterStudentDocID: '67e6b6c2d6b821eadfc837ce', voteType: 'upvote' },
                'post'
            );

            expect(Votes.create).toHaveBeenCalledWith({
                noteDocID: '6709b85a63a247780563d9f9',
                voterStudentDocID: '67e6b6c2d6b821eadfc837ce',
                voteType: 'upvote'
            });
            expect(Notes.findByIdAndUpdate).toHaveBeenCalledWith('6709b85a63a247780563d9f9', {
                $inc: { upvoteCount: 1 }
            });
            expect(result).toEqual({ ok: true });
        });

        it('should add comment vote and increment count', async () => {
            (CommentVotes.create as jest.Mock).mockResolvedValue({});
            (feedbacksModel.updateOne as jest.Mock).mockResolvedValue({});

            const result = await VoteService.addVote(
                {
                    noteDocID: '6709b85a63a247780563d9f9',
                    voterStudentDocID: '67e6b6c2d6b821eadfc837ce',
                    voteType: 'upvote'
                },
                'comment',
                '681bcac1c81ab83eacd6efbb'
            );

            expect(CommentVotes.create).toHaveBeenCalledWith({
                noteDocID: '6709b85a63a247780563d9f9',
                voterStudentDocID: '67e6b6c2d6b821eadfc837ce',
                voteType: 'upvote',
                feedbackDocID: '681bcac1c81ab83eacd6efbb'
            });
            expect(feedbacksModel.updateOne).toHaveBeenCalledWith(
                { _id: '681bcac1c81ab83eacd6efbb' },
                { $inc: { upvoteCount: 1 } }
            );
            expect(result).toEqual({ ok: true });
        });
    });
});
