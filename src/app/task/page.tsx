"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Loader2, LogOut } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuth } from "@/context/AuthContext";
import UserService from "@/services/UserService";
import { supabase } from "@/lib/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, insertTasks, updateTasks, deleteTasks } from "@/services/TasksService";
import { fetchProjects } from "@/services/ProjectService";


const taskSchema = z.object({
    title: z.string().min(1, "Task title is required"),
    status: z.string().min(1, "Task Status is required"),
    project: z.string().min(1, "Task Project is required"),
});

export default function FormTable() {
    const { user } = useAuth();
    const router = useRouter();
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const taskId = searchParams.get("taskId"); 
    
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset, 
        setValue, watch
    } = useForm({
        resolver: zodResolver(taskSchema),
        defaultValues: { title: "", status: "", project: "" },
    });

    const selectedStatus = watch("status");
    const selectedProject = watch("project");

    const project = useQuery({
        queryKey: ["projects"],
        queryFn: fetchProjects,
    });
    
    const { data, isLoading, error } = useQuery({
        queryKey: taskId ? ["tasks", taskId] : ["tasks"],
        queryFn: () => fetchTasks(taskId || undefined),
    });
    
    const insertMutation = useMutation({
        mutationFn: insertTasks,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, taskData }: { id: string; taskData: { title?: string; status?: string; project_id?: string; } }) =>
            updateTasks(id, taskData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTasks,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    });

    const handleEdit = (item: any) => {
        setEditing(true);
        setEditId(item.id);
        reset({ title: item.title, status: item.status, project: item.project_id }); // Reset form with selected project
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this project?")) {
            deleteMutation.mutate(id);
        }
    };

    const onSubmit = async (data: { title: string; status: string, project: string }) => {
        setLoading(true);
        setSuccessMessage("");

        if (editing && editId) {
            updateMutation.mutate({ id: editId, taskData: { title: data.title, status: data.status, project_id: data.project } });
            setSuccessMessage("Task updated successfully!");
        } else {
            insertMutation.mutate({ title: data.title, status: data.status, project_id: data.project });
            setSuccessMessage("Task created successfully!");
        }
        
        setLoading(false);
        setEditing(false);
        setEditId(null);
        reset({ title: "", status: "", project: "" });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
                <h1 className="text-xl font-semibold">Task</h1>
            </header>

            <main className="flex-1 p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                <div className="p-6 grid gap-6">
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">{editing ? "Edit Task" : "Add New Task"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-1">
                                    <Input
                                        type="text"
                                        placeholder="Task Title"
                                        {...register("title")}
                                        className="w-full"
                                    />
                                    {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Select value={selectedStatus} onValueChange={(value) => setValue("status", value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-red-500 text-sm">{errors.status.message}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Select value={selectedProject} onValueChange={(value) => setValue("project", value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {project.isLoading ? (
                                                <p className="p-2 text-gray-500">Loading...</p>
                                            ) : project.error ? (
                                                <p className="p-2 text-red-500">Error loading projects</p>
                                            ) : project.data && project.data.length > 0 ? (
                                                project.data.map((option: any) => (
                                                    <SelectItem key={option.id} value={option.id}>
                                                        {option.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <p className="p-2 text-gray-500">No projects available</p>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.project && (
                                        <p className="text-red-500 text-sm">{errors.project.message}</p>
                                    )}
                                </div>

                                <Button type="submit" disabled={loading} style={{ width: "fit-content" }}>
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : editing ? "Update Task" : "Add Task"}
                                </Button>
                            </form>
                            {successMessage && (
                                <p className="mt-4 text-green-600 text-center text-sm font-medium">{successMessage}</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Task List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full border-collapse border bg-white rounded-md">
                                <thead>
                                    <tr className="bg-gray-200 text-left">
                                        {/* <th className="border p-3">ID</th> */}
                                        <th className="border p-3">Title</th>
                                        <th className="border p-3">Project</th>
                                        <th className="border p-3">Status</th>
                                        <th className="border p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.map((item) => (
                                        <tr key={item.id} className="border">
                                            {/* <td className="border p-3">{item.id}</td> */}
                                            <td className="border p-3">{item.title}</td>
                                            <td className="border p-3">{item?.projects?.name}</td>
                                            <td className="border p-3">{item.status}</td>
                                            <td className="border p-3 flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                                                    <Pencil className="w-4 h-4" /> Edit
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="w-4 h-4" /> Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
