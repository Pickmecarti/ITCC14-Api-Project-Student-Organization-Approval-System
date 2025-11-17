// js/data.js
export const users = JSON.parse(localStorage.getItem('users')) || [
  { id: 1, name: "Jane Smith", email: "student@example.com", password: "password123", role: "student", studentId: "2023-12345", organization: "Rotaract Club", avatar: "JS" },
  { id: 2, name: "Dr. Reyes", email: "admin@example.com", password: "admin123", role: "admin", avatar: "DR" }
];

export const submissions = JSON.parse(localStorage.getItem('submissions')) || [
  {
    id: "60d21b4667d0d8992e610c85",
    title: "Annual Charity Run 2025",
    organization: "Rotaract Club",
    submittedBy: "Jane Smith",
    dateSubmitted: "2025-11-13T08:00:00Z",
    status: "Pending",
    objectives: "Raise funds for local orphanage",
    budget: 15000,
    venue: "University Oval",
    dateOfActivity: "2025-12-10",
    description: "A 5K fun run open to all students",
    comments: []
  },
  {
    id: "60d21b4667d0d8992e610c86",
    title: "Leadership Seminar",
    organization: "Student Council",
    submittedBy: "John Doe",
    dateSubmitted: "2025-11-10T10:30:00Z",
    status: "Approved",
    objectives: "Develop leadership skills among student officers",
    budget: 8000,
    venue: "University Auditorium",
    dateOfActivity: "2025-12-05",
    description: "One-day seminar with guest speakers",
    comments: [
      { author: "Dr. Reyes", text: "Great initiative! Approved with minor budget adjustments.", timestamp: "2025-11-12T14:20:00Z" }
    ]
  }
];

export function saveUsers() {
  localStorage.setItem('users', JSON.stringify(users));
}

export function saveSubmissions() {
  localStorage.setItem('submissions', JSON.stringify(submissions));
}