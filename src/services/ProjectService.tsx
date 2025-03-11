import { supabase } from "@/lib/supabaseClient";

export const fetchProjects = async () => {
  const { data, error } = await supabase.from("projects").select("*");
  if (error) throw new Error(error.message);
  return data;
};

export const insertProject = async (projectData: { user_id: string, name: string; description: string }) => {
  const { data, error } = await supabase.from("projects").insert(projectData);
  if (error) throw new Error(error.message);
  return data;
};

export const updateProject = async (id: string, projectData: { name?: string; description?: string }) => {
  const { data, error } = await supabase.from("projects").update(projectData).eq("id", id);
  if (error) throw new Error(error.message);
  return data;
};

export const deleteProject = async (id: string) => {
  const { data, error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return data;
};