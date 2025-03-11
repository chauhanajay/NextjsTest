"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuth } from "@/context/AuthContext";
import UserService from "@/services/UserService";
import { supabase } from "@/lib/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjects, insertProject, updateProject, deleteProject } from "@/services/ProjectService";


const projectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().min(1, "Description is required"),
});

export default function FormTable() {
    const { user } = useAuth();
    const router = useRouter();
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(projectSchema),
        defaultValues: { name: "", description: "" },
    });

    const { data, isLoading, error } = useQuery({
        queryKey: ["projects"],
        queryFn: fetchProjects,
    });
    
    const user_data = useQuery({
        queryKey: ["users", user?.email], 
        queryFn: () => UserService.fetchUsers(user?.email??""),
        enabled: !!user?.email,
    });

    const insertMutation = useMutation({
        mutationFn: insertProject,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, projectData }: { id: string; projectData: { name?: string; description?: string } }) =>
            updateProject(id, projectData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProject,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });

    const handleEdit = (item: any) => {
        setEditing(true);
        setEditId(item.id);
        reset({ name: item.name, description: item.description }); 
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this project?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleViewTask = (taskId: string) => {
        router.push(`/task?taskId=${taskId}`);
    };

    const onSubmit = async (data: { name: string; description: string }) => {
        setLoading(true);
        setSuccessMessage("");

        if (editing && editId) {
            updateMutation.mutate({ id: editId, projectData: { name: data.name, description: data.description } });
            setSuccessMessage("Project updated successfully!");
        } else {
            insertMutation.mutate({ user_id: user_data.data.id, name: data.name, description: data.description });
            setSuccessMessage("Project created successfully!");
        }
        
        setLoading(false);
        setEditing(false);
        setEditId(null);
        reset({ name: "", description: "" });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
                <h1 className="text-xl font-semibold">Project</h1>
            </header>

            <main className="flex-1 p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                <div className="p-6 grid gap-6">
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">{editing ? "Edit Project" : "Add New Project"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-1">
                                    <Input
                                        type="text"
                                        placeholder="Project Name"
                                        {...register("name")}
                                        className="w-full"
                                    />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Textarea
                                        placeholder="Enter Description"
                                        {...register("description")}
                                        className="w-full"
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-sm">{errors.description.message}</p>
                                    )}
                                </div>

                                <Button type="submit" disabled={loading} style={{ width: "fit-content" }}>
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : editing ? "Update Project" : "Add Project"}
                                </Button>
                            </form>
                            {successMessage && (
                                <p className="mt-4 text-green-600 text-center text-sm font-medium">{successMessage}</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Project List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full border-collapse border bg-white rounded-md">
                                <thead>
                                    <tr className="bg-gray-200 text-left">
                                        {/* <th className="border p-3">ID</th> */}
                                        <th className="border p-3">Name</th>
                                        <th className="border p-3">Description</th>
                                        <th className="border p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.map((item) => (
                                        <tr key={item.id} className="border">
                                            {/* <td className="border p-3">{item.id}</td> */}
                                            <td className="border p-3"><span onClick={() => handleViewTask(item.id)} style={{cursor: 'pointer'}}>{item.name}</span></td>
                                            <td className="border p-3">{item.description}</td>
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
