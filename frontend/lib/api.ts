import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Default resume for Likhith Dude
export const DEFAULT_RESUME = `LIKHITH DUDE
Email: dudelikhith@gmail.com | LinkedIn: linkedin.com/in/likhithdude

EDUCATION
M.S. Computer Science — Florida Atlantic University (FAU) | GPA: 3.867 | 2024

SKILLS
Languages: Python, SQL, Bash, JavaScript
Cloud & DevOps: AWS (EC2, S3, Lambda, ECS), Docker, Kubernetes, GitHub Actions
MLOps & AI: MLflow, FastAPI, PostgreSQL, scikit-learn, TensorFlow, Google Gemini API
Tools: Git, Terraform, Grafana, Prometheus

EXPERIENCE
Graduate Research Assistant — FAU | 2023–2024
- Developed ML pipelines using MLflow for experiment tracking and model versioning
- Reduced cloud infrastructure costs by 35% through automated resource optimization
- Built FastAPI microservices deployed on Kubernetes with 99.9% uptime

PROJECTS
MLOps Fraud Detection Pipeline
- End-to-end fraud detection system using ensemble ML models (XGBoost, RandomForest)
- MLflow tracking, Docker containerization, deployed on AWS ECS
- Achieved 97.3% F1-score with real-time inference under 50ms latency

Cloud Cost Optimization Engine
- AI-powered AWS cost analysis tool using Python, FastAPI, and PostgreSQL
- Identifies idle resources, rightsizing opportunities, and Reserved Instance recommendations
- Saves average 40% on monthly AWS bills for analyzed accounts

CERTIFICATIONS
AWS Solutions Architect – Associate (in progress)`;

export const jobsApi = {
  search: (title: string, location?: string, limit = 20) =>
    API.get("/jobs/search", { params: { title, location, limit } }),
};

export const aiApi = {
  atsCheck: (resume_text: string, job_description: string) =>
    API.post("/ai/ats-check", { resume_text, job_description }),

  oneClickApply: (data: {
    resume_text: string;
    job_title: string;
    company: string;
    job_description: string;
  }) => API.post("/ai/one-click-apply", data),

  interviewPrep: (data: {
    job_title: string;
    company: string;
    job_description: string;
    resume_text?: string;
  }) => API.post("/ai/interview-prep", data),
};

export const applicationsApi = {
  list: () => API.get("/applications/"),
  create: (data: Record<string, unknown>) => API.post("/applications/", data),
  update: (id: number, data: Record<string, unknown>) => API.patch(`/applications/${id}`, data),
  delete: (id: number) => API.delete(`/applications/${id}`),
};
