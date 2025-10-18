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
      // If no API key is provided, use fallback logic
      const apiKey = import.meta.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('Gemini API key not found, using fallback assignment logic');
        return this.fallbackAssignment(patientData, availableNurses, availableDoctors, availableBeds);
      }

      // Get AI recommendations
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
      console.error('AI assignment failed, using fallback logic:', error);
      return this.fallbackAssignment(patientData, availableNurses, availableDoctors, availableBeds);
    }
  }

  private static fallbackAssignment(
    patientData: PatientData,
    availableNurses: Nurse[],
    availableDoctors: Doctor[],
    availableBeds: Bed[]
  ): AssignmentResult {
    // Simple fallback logic based on specialty matching
    let assignedNurse: Nurse | null = null;
    let assignedDoctor: Doctor | null = null;
    let assignedBed: Bed | null = null;

    // Find nurse with matching specialization or first available
    if (patientData.specialty_required) {
      assignedNurse = availableNurses.find(n => 
        n.specialization.toLowerCase().includes(patientData.specialty_required.toLowerCase()) && 
        n.status === 'available'
      ) || null;
    }
    
    if (!assignedNurse) {
      assignedNurse = availableNurses.find(n => n.status === 'available') || 
                     (availableNurses.length > 0 ? availableNurses[0] : null);
    }

    // Find doctor with matching specialization or first available
    if (patientData.specialty_required) {
      assignedDoctor = availableDoctors.find(d => 
        d.specialization.toLowerCase().includes(patientData.specialty_required.toLowerCase()) && 
        d.status === 'available'
      ) || null;
    }
    
    if (!assignedDoctor) {
      assignedDoctor = availableDoctors.find(d => d.status === 'available') || 
                      (availableDoctors.length > 0 ? availableDoctors[0] : null);
    }

    // Find first available bed
    assignedBed = availableBeds.find(b => b.status === 'available') || 
                 (availableBeds.length > 0 ? availableBeds[0] : null);

    return {
      nurse: assignedNurse,
      doctor: assignedDoctor,
      bed: assignedBed,
      reasoning: 'Assigned using fallback logic based on availability and specialization matching'
    };
  }

  static async getPatientUrgencyAnalysis(condition: string, age: string, notes: string) {
    // This would integrate with the Gemini API for patient condition analysis
    // For now, we'll return a mock response
    return {
      urgency_level: "Medium",
      treatment_approach: "Standard assessment and monitoring",
      time_sensitivity: "30-60 minutes"
    };
  }
}

export default AIAssignmentService;