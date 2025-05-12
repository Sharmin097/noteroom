import mongoose, { connect } from 'mongoose';
import * as FriendsService from '../services/friends.service';
import Friends from '../schemas/connections.model';
import Follow from '../schemas/follow.model';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '../.env') });
const url = (process.env.DEVELOPMENT && process.env.DEVELOPMENT === "true") ? process.env.MONGO_URI_DEV : process.env.MONGO_URI;

describe('Friends Service - Integration Tests', () => {
    beforeAll(async () => {
        await connect(url);
        console.log(`[-] development mode: ${process.env.DEVELOPMENT}`);
        if (process.env.DEVELOPMENT && process.env.DEVELOPMENT === "true") {
            console.log(`[-] using local mongodb: ${url}`);
        } else {
            console.log(`[-] using remote mongodb: ${url}`);
        }
    });

    //   afterAll(async () => {
    //     await mongoose.connection.db.dropDatabase();
    //     await mongoose.connection.close();
    //   });

    describe('sendFriendRequest', () => {
        it('should create a new friend request if not existing', async () => {
            const requestID = uuidv4();

            const result = await FriendsService.sendFriendRequest({
                senderDocID: '670955a378c4ceb3504985b7',
                receiverDocID: '6709468078c4ceb3504984bf',
                requestID,
            });

            expect(result.ok).toBe(true);

            const found = await Friends.findOne({
                senderDocID: '670955a378c4ceb3504985b7',
                receiverDocID: '6709468078c4ceb3504984bf',
            });

            expect(found).not.toBeNull();
            expect(found?.requestID).toBe(requestID);
        });

        it('should return EXISTING_REQUEST if request exists', async () => {
            const result = await FriendsService.sendFriendRequest({
                senderDocID: '670955a378c4ceb3504985b7',
                receiverDocID: '6709468078c4ceb3504984bf',
                requestID: uuidv4(),
            });

            expect(result.ok).toBe(false);
            expect(result.code).toBe('EXISTING_REQUEST');
        });
    });

    describe('getFriendRequestById', () => {
        it('should return the correct friend request by ID', async () => {
            const result = await FriendsService.getFriendRequestById('f3513ade-53c1-4296-a471-e7f853dd5564');

            expect(result.ok).toBe(true);
            expect(result.request.requestID).toBe("f3513ade-53c1-4296-a471-e7f853dd5564");
            expect(result.receiverInfo).toBeDefined();
        });

        it('should return ok: false if request does not exist', async () => {
            const result = await FriendsService.getFriendRequestById('nonexistentID');
            expect(result.ok).toBe(false);
        });
    });

    describe('updateFriendRequestStatus', () => {
        it('should update the status of a friend request', async () => {
            const result = await FriendsService.updateFriendRequestStatus("ce730581-b8e9-45ab-adc9-e85abb076b21", 'accepted');
            const requestID = 'ce730581-b8e9-45ab-adc9-e85abb076b21'
            expect(result.ok).toBe(true);
            const updatedRequest = await Friends.findOne({ requestID });
            expect(updatedRequest?.status).toBe('accepted');
        });

        it('should return ok: false if no request is modified', async () => {
            const result = await FriendsService.updateFriendRequestStatus('nonexistentID', 'declined');
            expect(result.ok).toBe(false);
            expect(result.code).toBe('UNMODIFIED_DOC');
        });
    });

    describe('unfriendUser', () => {
        it('should unfriend the user successfully', async () => {
            const requestID = uuidv4();

            await Friends.create({
                senderDocID: '670955a378c4ceb3504985b7',
                receiverDocID: '670a24d4ed746b132e0c615b',
                requestID,
                status: 'accepted',
            });

            const result = await FriendsService.unfriendUser(requestID);

            expect(result.ok).toBe(true);
            const deletedRequest = await Friends.findOne({ requestID });
            expect(deletedRequest).toBeNull();
        });

        it('should return ok: false if no request is deleted', async () => {
            const result = await FriendsService.unfriendUser('nonexistentID');
            expect(result.ok).toBe(false);
            expect(result.code).toBe('DELETION_FAILURE');
        });
    });

    describe('followUser', () => {
        it('should create a new follow relationship', async () => {
            const followID = uuidv4();
            const requestID = uuidv4();

            await Friends.create({
                senderDocID: '670955a378c4ceb3504985b7',
                receiverDocID: '6709468078c4ceb3504984bf',
                requestID,
                status: 'declined',
            });

            const result = await FriendsService.followUser(followID, '670955a378c4ceb3504985b7', '6709468078c4ceb3504984bf');

            expect(result.ok).toBe(true);

            const follow = await Follow.findOne({ followID });
            expect(follow).not.toBeNull();
            expect(follow?.followerDocID).toBe('670955a378c4ceb3504985b7');
            expect(follow?.followingDocID).toBe('6709468078c4ceb3504984bf');
        });

        it('should return EXISTING_FOLLOW if the follow relationship already exists', async () => {
            const followID = uuidv4();
            await Follow.create({
                followID,
                followerDocID: '670955a378c4ceb3504985b7',
                followingDocID: '6709d4ded6c535541a4c44d0',
            });

            const result = await FriendsService.followUser(followID, '670955a378c4ceb3504985b7', '6709468078c4ceb3504984bf');
            expect(result.ok).toBe(true);
            expect(result.code).toBe('EXISTING_FOLLOW');
        });
    });

    describe('unfollowUser', () => {
        it('should unfollow a user successfully', async () => {
            const followID = uuidv4();
            await Follow.create({
                followID,
                followerDocID: '670955a378c4ceb3504985b7',
                followingDocID: '6709468078c4ceb3504984bf',
            });

            const result = await FriendsService.unfollowUser(followID);
            expect(result.ok).toBe(true);

            const follow = await Follow.findOne({ followID });
            expect(follow).toBeNull();
        });

        it('should return ok: false if follow relationship does not exist', async () => {
            const result = await FriendsService.unfollowUser('nonexistentFollowID');
            expect(result.ok).toBe(false);
        });
    });
});
