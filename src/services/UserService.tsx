import { supabase } from "@/lib/supabaseClient";

class UserService {

    async fetchUsers(email: string){
        const { data, error } = await supabase.from("users").select("*").eq('email', email).single();
        if (error) throw new Error(error.message);
        return data;
    };

    async insertData(data: {email: string}[]){
        const { data: result, error } = await supabase.from("users").insert(data);

        if (error) {
        return { success: false, error };
        }

        return { success: true, data: result };
    }
}

export default new UserService();