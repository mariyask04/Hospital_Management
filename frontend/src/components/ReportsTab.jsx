import { useEffect, useState } from "react";
import axios from "axios";

export default function ReportsTab() {
    const [patients, setPatients] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [reports, setReports] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState("");

    const [form, setForm] = useState({
        otSchedule: "",
        patient: "",
        reportType: "Operative Report",
        content: "",
    });

    const token = localStorage.getItem("token");

    // =============================
    // Load patients & schedules
    // =============================
    useEffect(() => {
        const fetchData = async () => {
            try {
                const patientRes = await axios.get(
                    "http://localhost:5000/api/patient/getAll",
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const scheduleRes = await axios.get(
                    "http://localhost:5000/api/otschedule/getAll",
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setPatients(patientRes.data.patients || patientRes.data);
                setSchedules(scheduleRes.data.schedules || scheduleRes.data);
            } catch (error) {
                console.error("Error loading data", error);
            }
        };

        fetchData();
    }, []);

    // =============================
    // Fetch Reports by Patient
    // =============================
    const fetchReports = async (patientId) => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/report/patient/${patientId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setReports(res.data);
        } catch (error) {
            console.error("Error fetching reports", error);
        }
    };

    // =============================
    // Create Report
    // =============================
    const handleCreate = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                "http://localhost:5000/api/report",
                form,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchReports(form.patient);

            setForm({
                otSchedule: "",
                patient: "",
                reportType: "Operative Report",
                content: "",
            });
        } catch (error) {
            console.error("Error creating report", error);
        }
    };

    // =============================
    // Delete Report
    // =============================
    const handleDelete = async (id) => {
        try {
            await axios.delete(
                `http://localhost:5000/api/report/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchReports(selectedPatient);
        } catch (error) {
            console.error("Error deleting report", error);
        }
    };

    // =============================
    // Upload Attachment
    // =============================
    const handleUpload = async (id, file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            await axios.patch(
                `http://localhost:5000/api/report/${id}/attachment`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            fetchReports(selectedPatient);
        } catch (error) {
            console.error("Upload error", error);
        }
    };

    return (
        <section className="space-y-6">

            {/* ================= CREATE REPORT ================= */}
            <form onSubmit={handleCreate} className="p-4 border rounded-xl space-y-3">
                <h3 className="font-semibold text-lg">Create Report</h3>

                <select
                    value={form.patient}
                    onChange={(e) => {
                        setForm({ ...form, patient: e.target.value });
                        setSelectedPatient(e.target.value);
                        fetchReports(e.target.value);
                    }}
                    className="border p-2 rounded w-full"
                    required
                >
                    <option value="">Select Patient</option>
                    {patients.map((p) => (
                        <option key={p._id} value={p._id}>
                            {p.name}
                        </option>
                    ))}
                </select>

                <select
                    value={form.otSchedule}
                    onChange={(e) =>
                        setForm({ ...form, otSchedule: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                    required
                >
                    <option value="">Select OT Schedule</option>
                    {schedules.map((s) => (
                        <option key={s._id} value={s._id}>
                            OT {s.otNumber} -{" "}
                            {new Date(s.date).toLocaleDateString()}
                        </option>
                    ))}
                </select>

                <select
                    value={form.reportType}
                    onChange={(e) =>
                        setForm({ ...form, reportType: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                >
                    <option>Pre-Operative Report</option>
                    <option>Operative Report</option>
                    <option>Post-Operative Report</option>
                    <option>Anesthesia Report</option>
                    <option>Discharge Summary</option>
                </select>

                <textarea
                    placeholder="Report Content"
                    className="border p-2 rounded w-full"
                    value={form.content}
                    onChange={(e) =>
                        setForm({ ...form, content: e.target.value })
                    }
                    required
                />

                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                    Create Report
                </button>
            </form>

            {/* ================= REPORT LIST ================= */}
            <div className="space-y-4">
                {reports.map((r) => (
                    <div key={r._id} className="border rounded-xl p-4">
                        <h4 className="font-semibold">{r.reportType}</h4>
                        <p className="text-sm text-gray-600 mb-2">{r.content}</p>

                        {/* Upload file */}
                        <input
                            type="file"
                            onChange={(e) =>
                                handleUpload(r._id, e.target.files[0])
                            }
                        />

                        {/* Attachments */}
                        <div className="mt-2 text-sm">
                            {r.attachments?.map((a, i) => (
                                <a
                                    key={i}
                                    href={`http://localhost:5000${a.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 block"
                                >
                                    {a.fileName}
                                </a>
                            ))}
                        </div>

                        <button
                            onClick={() => handleDelete(r._id)}
                            className="mt-3 bg-red-500 text-white px-3 py-1 rounded"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}