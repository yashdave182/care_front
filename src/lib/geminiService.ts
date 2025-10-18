// src/lib/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API client
// Try both VITE_GEMINI_API_KEY (for Vercel) and GEMINI_API_KEY (for local development)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Function to get AI recommendations for nurse and doctor assignments
export const getAIAssignmentRecommendations = async (
  patientData: {
    name: string;
    age: string;
    condition: string;
    specialty_required: string;
    notes: string;
  },
  availableNurses: any[],
  availableDoctors: any[],
  availableBeds: any[]
) => {
  // Check if API key is available
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required for AI-powered assignments. Please configure your environment variables.');
  }

  try {
    // Get the generative model (updated to gemini-2.5-pro)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    
    // Create a prompt for the AI
    const prompt = `
      You are an AI hospital management assistant. Based on the patient information and available staff, 
      recommend the best nurse and doctor assignments. Consider specialty matching, workload balance, 
      and staff expertise.

      Patient Information:
      Name: ${patientData.name}
      Age: ${patientData.age}
      Medical Condition: ${patientData.condition}
      Required Specialty: ${patientData.specialty_required || 'Not specified'}
      Additional Notes: ${patientData.notes || 'None'}

      Available Nurses:
      ${availableNurses.map(nurse => 
        `- ID: ${nurse.nurse_id}, Name: ${nurse.name}, Specialization: ${nurse.specialization}, Status: ${nurse.status}`
      ).join('\n')}

      Available Doctors:
      ${availableDoctors.map(doctor => 
        `- ID: ${doctor.doctor_id}, Name: ${doctor.name}, Specialization: ${doctor.specialization}, Status: ${doctor.status}`
      ).join('\n')}

      Available Beds:
      ${availableBeds.map(bed => 
        `- Bed Number: ${bed.bed_number}, Floor: ${bed.floor}, Status: ${bed.status}`
      ).join('\n')}

      Please provide your recommendations in the following JSON format:
      {
        "recommended_nurse_id": "nurse ID",
        "recommended_doctor_id": "doctor ID",
        "recommended_bed_id": "bed ID",
        "reasoning": "Brief explanation of your recommendations"
      }

      Only return the JSON object, nothing else.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonString = text.substring(jsonStart, jsonEnd);
      
      const recommendations = JSON.parse(jsonString);
      return recommendations;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Failed to parse AI recommendations');
    }
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    throw new Error(`Failed to get AI recommendations: ${error.message}`);
  }
};

// Function to analyze patient condition and urgency
export const analyzePatientCondition = async (condition: string, age: string, notes: string) => {
  // Check if API key is available
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required for AI-powered patient analysis. Please configure your environment variables.');
  }

  try {
    // Updated to gemini-2.5-pro
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    
    const prompt = `
      As a medical triage AI, analyze the following patient information and provide:
      1. Urgency level (Low, Medium, High, Critical)
      2. Recommended initial treatment approach
      3. Estimated time sensitivity

      Patient Information:
      Condition: ${condition}
      Age: ${age}
      Notes: ${notes || 'None'}

      Please provide your analysis in the following JSON format:
      {
        "urgency_level": "Low|Medium|High|Critical",
        "treatment_approach": "Brief description",
        "time_sensitivity": "Estimated time in minutes"
      }

      Only return the JSON object, nothing else.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonString = text.substring(jsonStart, jsonEnd);
      
      const analysis = JSON.parse(jsonString);
      return analysis;
    } catch (parseError) {
      console.error('Error parsing AI analysis:', parseError);
      throw new Error('Failed to parse AI analysis');
    }
  } catch (error) {
    console.error('Error analyzing patient condition:', error);
    throw new Error(`Failed to analyze patient condition: ${error.message}`);
  }
};

export default {
  getAIAssignmentRecommendations,
  analyzePatientCondition
};