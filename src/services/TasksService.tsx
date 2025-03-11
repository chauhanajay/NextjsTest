import { supabase } from "@/lib/supabaseClient";

export const fetchTasks = async (taskId?: string) => {
  let query = supabase.from("tasks").select("*, projects(name)");
  if (taskId) {
      query = query.eq("project_id", taskId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const insertTasks = async (taskData: { title: string; status: string; project_id: string }) => {
  const { data, error } = await supabase.from("tasks").insert(taskData);
  if (error) throw new Error(error.message);
  return data;
};

export const updateTasks = async (id: string, taskData: { title?: string; status?: string; project_id?: string; }) => {
  const { data, error } = await supabase.from("tasks").update(taskData).eq("id", id);
  if (error) throw new Error(error.message);
  return data;
};

export const deleteTasks = async (id: string) => {
  const { data, error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return data;
};