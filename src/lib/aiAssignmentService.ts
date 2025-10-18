// src/lib/aiAssignmentService.ts
import { getAIAssignmentRecommendations } from '@/lib/geminiService';
import { Nurse, Doctor, Bed } from '@/store/hospitalStore';

interface PatientData {
  name: string;
  age: string;
  condition: string;
  specialty_required: string;
  notes: string;
}

interface AssignmentResult {
  nurse: Nurse | null;
  doctor: Doctor | null;
  bed: Bed | null;
  reasoning: string;
}

export class AIAssignmentService {
  static async assignPatientToStaff(
    patientData: PatientData,
    availableNurses: Nurse[],
    availableDoctors: Doctor[],
    availableBeds: Bed[]
  ): Promise<AssignmentResult> {
    try {
      // Get AI recommendations - this will now properly check for API key
      const recommendations = await getAIAssignmentRecommendations(
        patientData,
        availableNurses,
        availableDoctors,
        availableBeds
      );

      // Find the recommended staff and bed
      const assignedNurse = availableNurses.find(n => n.id === recommendations.recommended_nurse_id) || null;
      const assignedDoctor = availableDoctors.find(d => d.id === recommendations.recommended_doctor_id) || null;
      const assignedBed = availableBeds.find(b => b.id === recommendations.recommended_bed_id) || null;

      return {
        nurse: assignedNurse,
        doctor: assignedDoctor,
        bed: assignedBed,
        reasoning: recommendations.reasoning
      };
    } catch (error) {
      // Re-throw the error instead of using fallback logic
      console.error('AI assignment failed:', error);
      throw new Error(`Failed to get AI recommendations from Gemini API: ${error.message}`);
    }
  }

  static async getPatientUrgencyAnalysis(condition: string, age: string, notes: string) {
    try {
      // Integrate with the Gemini API for patient condition analysis
      // This would be implemented similar to getAIAssignmentRecommendations
      throw new Error('Patient urgency analysis not yet implemented. Please implement the Gemini API integration.');
    } catch (error) {
      console.error('AI patient analysis failed:', error);
      throw new Error(`Failed to analyze patient condition with Gemini API: ${error.message}`);
    }
  }
}

export default AIAssignmentService;