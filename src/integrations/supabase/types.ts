export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admissions: {
        Row: {
          id: number;
          patient_id: number | null;
          bed_id: number | null;
          admitted_at: string | null;
          discharged_at: string | null;
          status: string | null;
        };
        Insert: {
          patient_id?: number | null;
          bed_id?: number | null;
          admitted_at?: string | null;
          discharged_at?: string | null;
          status?: string | null;
        };
        Update: {
          patient_id?: number | null;
          bed_id?: number | null;
          admitted_at?: string | null;
          discharged_at?: string | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "admissions_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admissions_bed_id_fkey";
            columns: ["bed_id"];
            isOneToOne: false;
            referencedRelation: "beds";
            referencedColumns: ["id"];
          },
        ];
      };
      beds: {
        Row: {
          id: number;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          status?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: number;
          type: string;
          payload: Json | null;
          processed: boolean | null;
          created_at: string | null;
        };
        Insert: {
          type: string;
          payload?: Json | null;
          processed?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          type?: string;
          payload?: Json | null;
          processed?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      patients: {
        Row: {
          id: number;
          name: string;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          name: string;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          name?: string;
          status?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      staff: {
        Row: {
          id: number;
          name: string;
          role: string;
        };
        Insert: {
          name: string;
          role: string;
        };
        Update: {
          name?: string;
          role?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: number;
          type: string;
          target_role: string | null;
          agent_role: string | null;
          assigned_to: number | null;
          patient_id: number | null;
          bed_id: number | null;
          status: string | null;
          scheduled_at: string | null;
          created_at: string | null;
        };
        Insert: {
          type: string;
          target_role?: string | null;
          agent_role?: string | null;
          assigned_to?: number | null;
          patient_id?: number | null;
          bed_id?: number | null;
          status?: string | null;
          scheduled_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          type?: string;
          target_role?: string | null;
          agent_role?: string | null;
          assigned_to?: number | null;
          patient_id?: number | null;
          bed_id?: number | null;
          status?: string | null;
          scheduled_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_bed_id_fkey";
            columns: ["bed_id"];
            isOneToOne: false;
            referencedRelation: "beds";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[keyof Database];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;
