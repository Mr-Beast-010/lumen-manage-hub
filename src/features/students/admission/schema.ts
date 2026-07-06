import { z } from "zod";

const phone = z.string().trim().regex(/^[+()\d\s-]{7,20}$/, "Enter a valid phone");
const email = z.string().trim().email("Enter a valid email").max(255);
const req = (label: string, max = 80) => z.string().trim().min(1, `${label} required`).max(max);

export const personalSchema = z.object({
  photo: z.string().optional(),
  firstName: req("First name"),
  middleName: z.string().trim().max(80).optional().or(z.literal("")),
  lastName: req("Last name"),
  dob: z.string().min(1, "Date of birth required"),
  gender: z.enum(["male", "female", "other"], { required_error: "Select a gender" }),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]),
  nationality: req("Nationality"),
  religion: z.string().trim().max(60).optional().or(z.literal("")),
  aadhaar: z.string().trim().regex(/^\d{12}$/, "Aadhaar must be 12 digits").optional().or(z.literal("")),
  mobile: phone,
  email: email,
  address: req("Address", 200),
  city: req("City"),
  state: req("State"),
  postalCode: z.string().trim().min(3, "Postal code required").max(12),
});

export const admissionSchema = z.object({
  admissionNo: req("Admission number", 40),
  rollNo: req("Roll number", 20),
  academicYear: req("Academic year", 20),
  className: req("Class", 20),
  section: req("Section", 10),
  house: z.string().trim().max(40).optional().or(z.literal("")),
  admissionDate: z.string().min(1, "Admission date required"),
  previousSchool: z.string().trim().max(120).optional().or(z.literal("")),
  transportRequired: z.boolean().default(false),
  hostelRequired: z.boolean().default(false),
});

const parent = z.object({
  name: req("Name"),
  occupation: z.string().trim().max(80).optional().or(z.literal("")),
  mobile: phone,
  email: email.optional().or(z.literal("")),
});

export const guardianSchema = z.object({
  father: parent,
  mother: parent,
  emergency: z.object({
    name: req("Emergency contact name"),
    relationship: req("Relationship", 40),
    phone: phone,
  }),
});

export const medicalSchema = z.object({
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]),
  allergies: z.string().trim().max(500).optional().or(z.literal("")),
  conditions: z.string().trim().max(500).optional().or(z.literal("")),
  disabilities: z.string().trim().max(500).optional().or(z.literal("")),
  medications: z.string().trim().max(500).optional().or(z.literal("")),
  doctorName: z.string().trim().max(120).optional().or(z.literal("")),
  emergencyNotes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const documentsSchema = z.object({
  files: z.record(z.string(), z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
    dataUrl: z.string().optional(),
  })).default({}),
});

export const admissionFormSchema = z.object({
  personal: personalSchema,
  admission: admissionSchema,
  guardian: guardianSchema,
  medical: medicalSchema,
  documents: documentsSchema,
});

export type AdmissionFormValues = z.infer<typeof admissionFormSchema>;
export type PersonalValues = z.infer<typeof personalSchema>;
export type AdmissionValues = z.infer<typeof admissionSchema>;
export type GuardianValues = z.infer<typeof guardianSchema>;
export type MedicalValues = z.infer<typeof medicalSchema>;
export type DocumentsValues = z.infer<typeof documentsSchema>;

export const stepFieldMap = {
  0: "personal",
  1: "admission",
  2: "guardian",
  3: "medical",
  4: "documents",
} as const;

export const generateAdmissionNo = () => {
  const y = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 8999);
  return `ADM-${y}-${rand}`;
};

export const defaultAdmissionValues: AdmissionFormValues = {
  personal: {
    photo: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    gender: "male",
    bloodGroup: "Unknown",
    nationality: "Indian",
    religion: "",
    aadhaar: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  },
  admission: {
    admissionNo: generateAdmissionNo(),
    rollNo: "",
    academicYear: `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(2)}`,
    className: "9",
    section: "A",
    house: "",
    admissionDate: new Date().toISOString().slice(0, 10),
    previousSchool: "",
    transportRequired: false,
    hostelRequired: false,
  },
  guardian: {
    father: { name: "", occupation: "", mobile: "", email: "" },
    mother: { name: "", occupation: "", mobile: "", email: "" },
    emergency: { name: "", relationship: "", phone: "" },
  },
  medical: {
    bloodGroup: "Unknown",
    allergies: "",
    conditions: "",
    disabilities: "",
    medications: "",
    doctorName: "",
    emergencyNotes: "",
  },
  documents: { files: {} },
};

export const DOCUMENT_SLOTS: { key: string; label: string; required?: boolean }[] = [
  { key: "studentPhoto", label: "Student Photo" },
  { key: "birthCertificate", label: "Birth Certificate" },
  { key: "aadhaar", label: "Aadhaar" },
  { key: "transferCertificate", label: "Transfer Certificate" },
  { key: "previousReportCard", label: "Previous Report Card" },
  { key: "passportPhoto", label: "Passport Photo" },
  { key: "other", label: "Other Documents" },
];
