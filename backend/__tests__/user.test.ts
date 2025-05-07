import { Convert } from '../services/user.service';
import Students from '../schemas/students.model';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

jest.mock('../schemas/students.model'); // Mock the Students model

describe('Convert functions', () => {
    let mongoServer: MongoMemoryServer;

    const mockFindOne = jest.fn();
    (Students.findOne as any) = mockFindOne;

    beforeAll(async () => {
        // Start an in-memory MongoDB server
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        // Connect to the in-memory database
        await mongoose.connect(mongoUri); // No need for additional options in Mongoose v6+
    });

    afterAll(async () => {
        // Clean up and stop the in-memory server
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    it('getStudentID_username should return studentID', async () => {
        const student = new Students({
            username: 'nure-saba-7e865d55',
            studentID: '7e865d55-44ef-47c5-8c1b-0aa20bcea66f',
        });
        await student.save();

        mockFindOne.mockResolvedValue({ studentID: '7e865d55-44ef-47c5-8c1b-0aa20bcea66f' });

        const result = await Convert.getStudentID_username('nure-saba-7e865d55');
        expect(mockFindOne).toHaveBeenCalledWith({ username: 'nure-saba-7e865d55' }, { studentID: 1 });
        expect(result).toBe('7e865d55-44ef-47c5-8c1b-0aa20bcea66f');
    });

    it('getDocumentID_studentid should return _id', async () => {
        const student = new Students({
            studentID: '7e865d55-44ef-47c5-8c1b-0aa20bcea66f',
            _id: '67e6b6c2d6b821eadfc837ce',
        });
        await student.save();

        mockFindOne.mockResolvedValue({ _id: '67e6b6c2d6b821eadfc837ce' });

        const result = await Convert.getDocumentID_studentid('7e865d55-44ef-47c5-8c1b-0aa20bcea66f');
        expect(mockFindOne).toHaveBeenCalledWith({ studentID: '7e865d55-44ef-47c5-8c1b-0aa20bcea66f' }, { _id: 1 });
        expect(result).toBe('67e6b6c2d6b821eadfc837ce');
    });

    it('getUserName_studentid should return username', async () => {
        const student = new Students({
            studentID: '7e865d55-44ef-47c5-8c1b-0aa20bcea66f',
            username: 'nure-saba-7e865d55',
        });
        await student.save();

        mockFindOne.mockResolvedValue({ username: 'nure-saba-7e865d55' });

        const result = await Convert.getUserName_studentid('7e865d55-44ef-47c5-8c1b-0aa20bcea66f');
        expect(mockFindOne).toHaveBeenCalledWith({ studentID: '7e865d55-44ef-47c5-8c1b-0aa20bcea66f' }, { username: 1 });
        expect(result).toBe('nure-saba-7e865d55');
    });

    it('getStudentID_email should return studentID', async () => {
        const student = new Students({
            email: 'nuresaba686@gmail.com',
            studentID: '7e865d55-44ef-47c5-8c1b-0aa20bcea66f',
        });
        await student.save();

        mockFindOne.mockResolvedValue({ studentID: '7e865d55-44ef-47c5-8c1b-0aa20bcea66f' });

        const result = await Convert.getStudentID_email('nuresaba686@gmail.com');
        expect(mockFindOne).toHaveBeenCalledWith({ email: 'nuresaba686@gmail.com' }, { studentID: 1 });
        expect(result).toBe('7e865d55-44ef-47c5-8c1b-0aa20bcea66f');
    });

    it('getEmail_studentid should return email', async () => {
        const student = new Students({
            studentID: '7e865d55-44ef-47c5-8c1b-0aa20bcea66f',
            email: 'nuresaba686@gmail.com',
        });
        await student.save();

        mockFindOne.mockResolvedValue({ email: 'nuresaba686@gmail.com' });

        const result = await Convert.getEmail_studentid('7e865d55-44ef-47c5-8c1b-0aa20bcea66f');
        expect(mockFindOne).toHaveBeenCalledWith({ studentID: '7e865d55-44ef-47c5-8c1b-0aa20bcea66f' }, { email: 1 });
        expect(result).toBe('nuresaba686@gmail.com');
    });

    it('getDisplayName_email should return displayname', async () => {
        const student = new Students({
            email: 'nuresaba686@gmail.com',
            displayname: 'saba',
        });
        await student.save();

        mockFindOne.mockResolvedValue({ displayname: 'saba' });

        const result = await Convert.getDisplayName_email('nuresaba686@gmail.com');
        expect(mockFindOne).toHaveBeenCalledWith({ email: 'nuresaba686@gmail.com' }, { displayname: 1 });
        expect(result).toBe('saba');
    });

    it('getDocumentID_username should return _id', async () => {
        const student = new Students({
            username: 'nure-saba-7e865d55',
            _id: '67e6b6c2d6b821eadfc837ce',
        });
        await student.save();

        mockFindOne.mockResolvedValue({ _id: '67e6b6c2d6b821eadfc837ce' });

        const result = await Convert.getDocumentID_username('nure-saba-7e865d55');
        expect(mockFindOne).toHaveBeenCalledWith({ username: 'nure-saba-7e865d55' }, { _id: 1 });
        expect(result).toBe('67e6b6c2d6b821eadfc837ce');
    });

    it('should return null if findOne throws an error', async () => {
        mockFindOne.mockRejectedValue(new Error('Database error'));

        const result = await Convert.getDocumentID_username('nure-saba-7e865d55');
        expect(result).toBeNull();
    });
});
