import { useState, useCallback, useEffect } from 'react';
import { Button, Modal, Table, Checkbox } from 'antd';
import TaskForm from '../../components/Form/form4todolist';

declare module TodoList {
    export interface TodoListRecord {
        TaskName: string;
        DueDate: string;
        Status: boolean;
    }
}

const TodoList = () => {
    const [tasks, setTasks] = useState<TodoList.TodoListRecord[]>([]);
    const [visible, setVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentTask, setCurrentTask] = useState<TodoList.TodoListRecord | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // Fetch tasks from localStorage on initial load
    useEffect(() => {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
        }
    }, []);

    // Save tasks to localStorage whenever tasks change
    useEffect(() => {
        if (tasks.length) {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }, [tasks]);

    const handleAdd = useCallback(() => {
        setVisible(true);
        setIsEdit(false);
        setCurrentTask(null);
    }, []);

    const handleEdit = useCallback((task: TodoList.TodoListRecord) => {
        setVisible(true);
        setIsEdit(true);
        setCurrentTask(task);
    }, []);

    const handleDelete = useCallback((taskToDelete: TodoList.TodoListRecord) => {
        Modal.confirm({
            title: 'Are you sure?',
            content: `Delete "${taskToDelete.TaskName}"?`,
            onOk: () => {
                setTasks(prevTasks => prevTasks.filter(task => task.TaskName !== taskToDelete.TaskName));
            }
        });
    }, []);

    const handleFinish = useCallback((values: any) => {
        const newTask: TodoList.TodoListRecord = {
            TaskName: values.TaskName,
            DueDate: values.DueDate,
            Status: values.Status || false,
        };

        setTasks(prevTasks => {
            if (isEdit) {
                return prevTasks.map(task =>
                    task.TaskName === currentTask?.TaskName ? newTask : task
                );
            }
            return [...prevTasks, newTask];
        });
        setVisible(false);
    }, [isEdit, currentTask]);

    const toggleComplete = useCallback((taskToToggle: TodoList.TodoListRecord) => {
        setTasks(prevTasks => 
            prevTasks.map(task => 
                task.TaskName === taskToToggle.TaskName ? { ...task, Status: !task.Status } : task
            )
        );
    }, []);

    const columns = [
        {
            title: 'Task Name',
            dataIndex: 'TaskName',
            key: 'TaskName',
            render: (text: string, record: TodoList.TodoListRecord) => (
                <span style={{ fontWeight: 'bold', textDecoration: record.Status ? 'line-through' : 'none' }}>
                    {text}
                </span>
            ),
        },
        {
            title: 'Due Date',
            dataIndex: 'DueDate',
            key: 'DueDate',
            align: 'center',
            width: 200,
            render: (date: string) => (
                <span style={{ fontWeight: 'bold' }}>
                    {date}
                </span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            key: 'Status',
            align: 'center',
            width: 200,
            render: (_: any, record: TodoList.TodoListRecord) => (
                <Checkbox checked={record.Status} onChange={() => toggleComplete(record)}>
                    {record.Status ? 'Completed' : 'Pending'}
                </Checkbox>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: 200,
            render: (_: any, record: TodoList.TodoListRecord) => (
                <div>
                    <Button onClick={() => handleEdit(record)}>Edit</Button>
                    <Button onClick={() => handleDelete(record)} danger style={{ marginLeft: 10 }}>Delete</Button>
                </div>
            ),
        },
    ];

    return (
        <div style={{ width: '100%', padding: '20px'}}>
            <Button type="primary" onClick={handleAdd}>Add Task</Button>
            <Table
                dataSource={tasks}
                columns={columns}
                rowKey="TaskName"
                pagination={{
                    current: page,
                    pageSize: pageSize,
                    onChange: (page, pageSize) => {
                        setPage(page);
                        setPageSize(pageSize);
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                }}
                scroll={{ x: 'max-content' }}  // Bảng nội dung full chiều ngang
                style={{ marginTop: '20px' }}
            />
            <Modal
                title={isEdit ? 'Edit Task' : 'Add Task'}
                visible={visible}
                onCancel={() => setVisible(false)}
                footer={null}
            >
                <TaskForm
                    initialValues={{
                        TaskName: currentTask?.TaskName,
                        DueDate: currentTask?.DueDate,
                        Status: currentTask?.Status,
                    }}
                    isEdit={isEdit}
                    onFinish={handleFinish}
                    onCancel={() => setVisible(false)}
                />
            </Modal>
        </div>
    );
};

export default TodoList;
