import { useNavigate } from "react-router-dom";
import { AdmissionWizard } from "@/features/students/admission/AdmissionWizard";
import type { AdmissionFormValues } from "@/features/students/admission/schema";
import { toast } from "sonner";

export default function StudentAdmission() {
  const navigate = useNavigate();

  const handleSubmit = (values: AdmissionFormValues) => {
    const id = `STU-${Math.floor(2000 + Math.random() * 7999)}`;
    // In a real app this would post to the API. For now we just toast.
    toast.success("Student created", { description: `${values.personal.firstName} ${values.personal.lastName} • ${id}` });
    return id;
  };

  return <AdmissionWizard onSubmit={handleSubmit} onCancel={() => navigate("/students")} />;
}
