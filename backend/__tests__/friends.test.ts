import mongoose from 'mongoose';
import Friends from '../schemas/connections.model';
import {
    sendFriendRequest,
    getFriendRequestById,
    acceptRequest,
    unfollowRequest
} from '../services/friends.service'; // Adjust the path as needed

jest.mock('../schemas/connections.model');

describe('Friend Connection Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('sendFriendRequest', () => {
        it('should return EXISTING_REQUEST if one exists', async () => {
            (Friends.findOne as jest.Mock).mockResolvedValueOnce({ _id: '123' });

            const result = await sendFriendRequest({ senderDocID: 's1', receiverDocID: 'r1' });

            expect(result).toEqual({ ok: false, code: 'EXISTING_REQUEST' });
            expect(Friends.findOne).toHaveBeenCalled();
        });

        it('should create a new request if none exists', async () => {
            (Friends.findOne as jest.Mock).mockResolvedValueOnce(null);
            (Friends.create as jest.Mock).mockResolvedValueOnce({});

            const result = await sendFriendRequest({ senderDocID: 's1', receiverDocID: 'r1' });

            expect(result).toEqual({ ok: true });
            expect(Friends.create).toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            (Friends.findOne as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

            const result = await sendFriendRequest({ senderDocID: 's1', receiverDocID: 'r1' });

            expect(result.ok).toBe(false);
            expect(result.code).toBe('SERVER');
        });
    });

    describe('getFriendRequestById', () => {
        it('should return ok: false if request not found', async () => {
            (Friends.findOne as jest.Mock).mockResolvedValueOnce(null);

            const result = await getFriendRequestById('req123');

            expect(result).toEqual({ ok: false });
        });

        it('should populate and return receiver info', async () => {
            const mockRequest = {
                populate: jest.fn().mockResolvedValueOnce({
                    receiverDocID: { studentID: 'ST123' }
                })
            };
            (Friends.findOne as jest.Mock).mockResolvedValueOnce(mockRequest);

            const result = await getFriendRequestById('req123');

            expect(mockRequest.populate).toHaveBeenCalled();
            expect(result).toEqual({
                ok: true,
                request: mockRequest,
                receiverInfo: 'ST123'
            });
        });
    });

    describe('acceptRequest', () => {
        it('should update the document to accept request', async () => {
            (Friends.updateOne as jest.Mock).mockResolvedValueOnce({ modifiedCount: 1 });

            const result = await acceptRequest('req123');

            expect(Friends.updateOne).toHaveBeenCalledWith(
                { requestID: 'req123' },
                { $set: { receiverFollowingSender: true } }
            );
            expect(result).toEqual({ ok: true });
        });

        it('should handle update errors', async () => {
            (Friends.updateOne as jest.Mock).mockRejectedValueOnce(new Error('Update error'));

            const result = await acceptRequest('req123');

            expect(result.ok).toBe(false);
        });
    });

    describe('unfollowRequest', () => {
        it('should call updateOne with proper aggregation pipeline', async () => {
            (Friends.updateOne as jest.Mock).mockResolvedValueOnce({ modifiedCount: 1 });

            const result = await unfollowRequest('req123', 'user123');

            expect(Friends.updateOne).toHaveBeenCalled();
            expect(result).toEqual({ ok: true });
        });

        it('should handle errors', async () => {
            (Friends.updateOne as jest.Mock).mockRejectedValueOnce(new Error('Error'));

            const result = await unfollowRequest('req123', 'user123');

            expect(result.ok).toBe(false);
        });
    });
});
