import Todo from "../models/Todo.js";

const getTodos = async (req, res) => {
    try {
        // Lấy query parameters
        const { completed, search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 5 } = req.query;
        
        // Xây dựng filter object
        let filter = {};
        
        // Lọc theo trạng thái completed
        if (completed !== undefined) {
            filter.completed = completed === 'true';
        }
        
        // Tìm kiếm theo title hoặc description
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Chuyển đổi các giá trị phân trang thông thường
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 5);
        const skip = (pageNum - 1) * limitNum;

        // Xây dựng sort object
        const sortOrder = order === 'asc' ? 1 : -1;
        const sort = { [sortBy]: sortOrder };

        // Đếm tổng số bản ghi khớp bộ lọc
        const totalTodos = await Todo.countDocuments(filter);

        // Lấy danh sách đã phân trang và sắp xếp
        const todos = await Todo.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        const totalPages = Math.ceil(totalTodos / limitNum) || 1;

        res.status(200).json({
            todos,
            totalPages,
            currentPage: pageNum,
            totalTodos
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTodo = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        const todo = new Todo({ title, description });
        await todo.save();
        res.status(201).json(todo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};  

const updateTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, completed } = req.body;

        // Chỉ kiểm tra title nếu người dùng có gửi title
        if (title !== undefined && !title.trim()) {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        const todo = await Todo.findByIdAndUpdate(
            id,
            { title, description, completed },
            {
                new: true,
                runValidators: true
            }
        );

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found"
            });
        }

        res.status(200).json(todo);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const todo = await Todo.findByIdAndDelete(id);
        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        res.status(200).json({ message: "Todo deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo
};