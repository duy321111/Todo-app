import request from "supertest";
import app from "../app.js";
import Todo from "../models/Todo.js";

// Mock model Todo của Mongoose để không kết nối tới DB thực
jest.mock("../models/Todo.js", () => {
    const MockTodo = jest.fn().mockImplementation((data) => {
        return {
            ...data,
            completed: data.completed || false,
            _id: "mock_id_123",
            save: jest.fn().mockResolvedValue(this)
        };
    });

    MockTodo.countDocuments = jest.fn();
    MockTodo.find = jest.fn();

    return MockTodo;
});

describe("GET /api/todos", () => {
    it("should return a list of todos with pagination info", async () => {
        // Giả lập dữ liệu trả về từ DB
        const mockTodos = [
            { _id: "1", title: "Học Docker", completed: false },
            { _id: "2", title: "Viết Unit Test", completed: true }
        ];

        // Mock các phương thức của Mongoose
        Todo.countDocuments.mockResolvedValue(2);
        Todo.find.mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(mockTodos)
        });

        const res = await request(app).get("/api/todos?page=1&limit=5");

        expect(res.statusCode).toBe(200);
        expect(res.body.todos).toHaveLength(2);
        expect(res.body.totalTodos).toBe(2);
        expect(res.body.todos[0].title).toBe("Học Docker");
    });
});

describe("POST /api/todos", () => {
    it("should create a new todo successfully", async () => {
        const newTodoData = { title: "Học Jest", description: "Làm lab unit test" };

        const res = await request(app)
            .post("/api/todos")
            .send(newTodoData);

        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe("Học Jest");
        expect(res.body._id).toBe("mock_id_123");
    });

    it("should return 400 if title is empty or missing", async () => {
        const res = await request(app)
            .post("/api/todos")
            .send({ title: "  " });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Title is required");
    });
});
